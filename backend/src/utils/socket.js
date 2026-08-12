import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

let io = null;

// Track online sockets mapping: userId -> Set of socket.id
const onlineUsers = new Map();
// Track presence details: userId -> { status, lastSeen, currentProject, currentTask, typingIn }
const userStatuses = new Map();
// Track collaborative editing locks: taskId -> { userId, name, timeoutId }
const editingLocks = new Map();

export const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://task-management-portal-nine.vercel.app'
  ];
  if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

  const cleanAllowedOrigins = Array.from(
    new Set(allowedOrigins.map(url => url.trim().replace(/\/$/, '')))
  );

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        if (cleanAllowedOrigins.includes(cleanOrigin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employee: {
            select: { id: true }
          }
        }
      });

      if (!user) {
        return next(new Error('User not found in system'));
      }

      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id || null
      };
      next();
    } catch (err) {
      return next(new Error('Unauthorized: Invalid credentials signature'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.name;

    // Track connection sessions
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Initialize presence status
    userStatuses.set(userId, {
      status: 'ONLINE',
      lastSeen: new Date(),
      currentProject: null,
      currentTask: null,
      typingIn: null
    });

    // Automatically join the employee notifications room
    if (socket.user.employeeId) {
      socket.join(`employee:${socket.user.employeeId}`);
    }
    socket.join(`employee:${userId}`); // fallback private channel

    // Broadcast presence update
    io.emit('user:online', {
      userId,
      name: userName,
      eventVersion: 1,
      timestamp: Date.now()
    });

    // --- Rooms Coordination ---
    socket.on('project:join', ({ projectId }, ack) => {
      socket.join(`project:${projectId}`);
      const status = userStatuses.get(userId) || {};
      status.currentProject = projectId;
      userStatuses.set(userId, status);

      // Broadcast viewing update
      io.to(`project:${projectId}`).emit('user:viewing', {
        userId,
        name: userName,
        projectId,
        taskId: status.currentTask,
        eventVersion: 1,
        timestamp: Date.now()
      });

      if (ack) ack({ success: true, message: `Joined project:${projectId}` });
    });

    socket.on('project:leave', ({ projectId }, ack) => {
      socket.leave(`project:${projectId}`);
      const status = userStatuses.get(userId) || {};
      if (status.currentProject === projectId) {
        status.currentProject = null;
      }
      userStatuses.set(userId, status);

      if (ack) ack({ success: true });
    });

    // --- Task Viewing Location ---
    socket.on('task:viewing', ({ taskId, projectId }, ack) => {
      const status = userStatuses.get(userId) || {};
      status.currentTask = taskId;
      userStatuses.set(userId, status);

      const targetRoom = projectId ? `project:${projectId}` : null;
      const emitter = targetRoom ? io.to(targetRoom) : io;
      
      emitter.emit('user:viewing', {
        userId,
        name: userName,
        projectId,
        taskId,
        eventVersion: 1,
        timestamp: Date.now()
      });

      if (ack) ack({ success: true });
    });

    // --- Collaborative Editing Locks ---
    socket.on('task:lock', ({ taskId, projectId }, ack) => {
      const existing = editingLocks.get(taskId);
      if (existing && existing.userId !== userId) {
        if (ack) ack({ success: false, message: `Locked by ${existing.name}` });
        return;
      }

      // Clear any existing timeout for this lock
      if (existing && existing.timeoutId) {
        clearTimeout(existing.timeoutId);
      }

      // Schedule auto-unlock timer (e.g. 2 minutes)
      const timeoutId = setTimeout(() => {
        releaseLock(taskId, projectId);
      }, 120000);

      editingLocks.set(taskId, {
        userId,
        name: userName,
        timeoutId
      });

      const targetRoom = projectId ? `project:${projectId}` : null;
      const emitter = targetRoom ? io.to(targetRoom) : io;
      
      emitter.emit('task:lock', {
        taskId,
        userId,
        name: userName,
        eventVersion: 1,
        timestamp: Date.now()
      });

      if (ack) ack({ success: true });
    });

    socket.on('task:unlock', ({ taskId, projectId }, ack) => {
      const existing = editingLocks.get(taskId);
      if (existing && existing.userId === userId) {
        releaseLock(taskId, projectId);
      }
      if (ack) ack({ success: true });
    });

    // --- Typing Indicators ---
    socket.on('user:typing', ({ projectId, taskId, isTyping }, ack) => {
      const status = userStatuses.get(userId) || {};
      status.typingIn = isTyping ? taskId || projectId : null;
      userStatuses.set(userId, status);

      const targetRoom = projectId ? `project:${projectId}` : null;
      const emitter = targetRoom ? io.to(targetRoom) : socket.broadcast;

      emitter.emit('user:typing', {
        userId,
        name: userName,
        projectId,
        taskId,
        isTyping,
        eventVersion: 1,
        timestamp: Date.now()
      });

      if (ack) ack({ success: true });
    });

    // --- Event Acknowledgement Mutators (Simulated client operations pipeline validation) ---
    socket.on('mutation:event', ({ event, payload }, ack) => {
      if (!ack) return;
      try {
        // Validate version and timestamp
        if (!payload.eventVersion || !payload.timestamp) {
          return ack({ success: false, error: 'Stale or unversioned event payload structures' });
        }
        
        // Broadcast the validated mutation update to the project room
        const room = payload.projectId ? `project:${payload.projectId}` : null;
        if (room) {
          socket.to(room).emit(event, payload);
        } else {
          socket.broadcast.emit(event, payload);
        }

        ack({ success: true });
      } catch (e) {
        ack({ success: false, error: e.message });
      }
    });

    // --- Disconnect Hook ---
    socket.on('disconnect', () => {
      const sessions = onlineUsers.get(userId);
      if (sessions) {
        sessions.delete(socket.id);
        if (sessions.size === 0) {
          onlineUsers.delete(userId);
          
          // Clear active user locks
          for (const [taskId, lock] of editingLocks.entries()) {
            if (lock.userId === userId) {
              releaseLock(taskId, null);
            }
          }

          userStatuses.delete(userId);

          // Broadcast presence offline status
          io.emit('user:offline', {
            userId,
            name: userName,
            eventVersion: 1,
            timestamp: Date.now()
          });
        }
      }
    });
  });

  return io;
};

// Internal utility to release edit lock
const releaseLock = (taskId, projectId) => {
  const lock = editingLocks.get(taskId);
  if (lock) {
    if (lock.timeoutId) {
      clearTimeout(lock.timeoutId);
    }
    editingLocks.delete(taskId);

    const emitter = projectId ? io.to(`project:${projectId}`) : io;
    emitter.emit('task:unlock', {
      taskId,
      eventVersion: 1,
      timestamp: Date.now()
    });
  }
};

// Expose socket server getter
export const getIo = () => io;

// Broadcasters helpers
export const broadcastToProject = (projectId, event, payload = {}) => {
  if (!io) return;
  io.to(`project:${projectId}`).emit(event, {
    ...payload,
    projectId,
    eventVersion: payload.eventVersion || 1,
    timestamp: Date.now()
  });
};

export const sendToEmployee = (employeeId, event, payload = {}) => {
  if (!io) return;
  io.to(`employee:${employeeId}`).emit(event, {
    ...payload,
    eventVersion: payload.eventVersion || 1,
    timestamp: Date.now()
  });
};

export const broadcastToAll = (event, payload = {}) => {
  if (!io) return;
  io.emit(event, {
    ...payload,
    eventVersion: payload.eventVersion || 1,
    timestamp: Date.now()
  });
};

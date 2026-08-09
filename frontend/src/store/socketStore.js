import { create } from 'zustand';
import { io } from 'socket.io-client';
import useAssetStore from './assetStore';
import useMaintenanceStore from './maintenanceStore';
import useVendorStore from './vendorStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  viewingUsers: [],
  typingUsers: {}, // taskId -> Set of names
  activeLocks: {}, // taskId -> { userId, name }
  lastReceivedEvent: null,

  connect: (token) => {
    if (get().socket) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      set({ socket: socketInstance, isConnected: true });
      
      // Rejoin general employee room or any active project room saved in state
      const { user } = JSON.parse(localStorage.getItem('auth_session') || '{}');
      if (user) {
        socketInstance.emit('project:join', { projectId: 'dashboard' });
      }
    });

    socketInstance.on('disconnect', () => {
      set({ isConnected: false });
    });

    // --- Presence System Listeners ---
    socketInstance.on('user:online', (data) => {
      const current = get().onlineUsers;
      if (!current.some((u) => u.userId === data.userId)) {
        set({ onlineUsers: [...current, data] });
      }
    });

    socketInstance.on('user:offline', (data) => {
      set({
        onlineUsers: get().onlineUsers.filter((u) => u.userId !== data.userId),
        viewingUsers: get().viewingUsers.filter((u) => u.userId !== data.userId)
      });
    });

    socketInstance.on('user:viewing', (data) => {
      const list = get().viewingUsers.filter((u) => u.userId !== data.userId);
      if (data.taskId || data.projectId) {
        list.push(data);
      }
      set({ viewingUsers: list });
    });

    socketInstance.on('user:typing', (data) => {
      const typingMap = { ...get().typingUsers };
      const key = data.taskId || data.projectId || 'general';
      if (!typingMap[key]) {
        typingMap[key] = new Set();
      } else {
        typingMap[key] = new Set(typingMap[key]);
      }

      if (data.isTyping) {
        typingMap[key].add(data.name);
      } else {
        typingMap[key].delete(data.name);
      }

      set({ typingUsers: typingMap });
    });

    // --- Collaborative Edit Locks ---
    socketInstance.on('task:lock', (data) => {
      const locks = { ...get().activeLocks };
      locks[data.taskId] = { userId: data.userId, name: data.name };
      set({ activeLocks: locks });
    });

    socketInstance.on('task:unlock', (data) => {
      const locks = { ...get().activeLocks };
      delete locks[data.taskId];
      set({ activeLocks: locks });
    });

    // --- Module Update Listeners ---
    socketInstance.on('task:create', (payload) => {
      // Trigger update on assetStore/taskStore dynamically
      set({ lastReceivedEvent: { event: 'task:create', payload } });
    });

    socketInstance.on('task:update', (payload) => {
      set({ lastReceivedEvent: { event: 'task:update', payload } });
    });

    socketInstance.on('task:delete', (payload) => {
      set({ lastReceivedEvent: { event: 'task:delete', payload } });
    });

    socketInstance.on('task:status', (payload) => {
      set({ lastReceivedEvent: { event: 'task:status', payload } });
    });

    socketInstance.on('notification:new', (payload) => {
      set({ lastReceivedEvent: { event: 'notification:new', payload } });
      
      // Dispatch desktop browser toast popup if priority is HIGH or URGENT
      const priority = payload.notification?.priority;
      if (Notification.permission === 'granted' && (priority === 'HIGH' || priority === 'URGENT')) {
        new Notification(payload.notification.title, {
          body: payload.notification.message
        });
      }
    });

    socketInstance.on('asset:update', (payload) => {
      // Refresh asset catalog state dynamically
      useAssetStore.getState().fetchAssets();
      useMaintenanceStore.getState().fetchRecords();
    });

    set({ socket: socketInstance });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinProject: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('project:join', { projectId });
    }
  },

  leaveProject: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('project:leave', { projectId });
    }
  },

  emit: (event, payload, ack) => {
    const { socket } = get();
    if (socket) {
      socket.emit(event, payload, ack);
    } else if (ack) {
      ack({ success: false, error: 'Socket disconnected' });
    }
  }
}));

export default useSocketStore;

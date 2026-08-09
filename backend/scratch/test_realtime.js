import http from 'http';
import express from 'express';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/db.js';
import { initializeSocket } from '../src/utils/socket.js';

async function runRealtimeVerification() {
  console.log('🚀 Starting Phase 16 Real-Time Integration Test Suite...');
  
  const app = express();
  const server = http.createServer(app);
  const io = initializeSocket(server);

  const PORT = 5055;
  
  // Start server
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`📡 Temporary test server running on port ${PORT}`);

  let mockUser = null;
  let client1 = null;
  let client2 = null;

  try {
    // 1. Fetch or create two different test users
    const usersList = await prisma.user.findMany({ take: 2 });
    let mockUser1 = usersList[0];
    let mockUser2 = usersList[1];

    if (!mockUser1) {
      mockUser1 = await prisma.user.create({
        data: {
          name: 'Realtime Tester 1',
          email: `test_realtime1_${Date.now()}@example.com`,
          role: 'ADMIN',
          passwordHash: 'dummy_hash'
        }
      });
    }

    if (!mockUser2) {
      mockUser2 = await prisma.user.create({
        data: {
          name: 'Realtime Tester 2',
          email: `test_realtime2_${Date.now()}@example.com`,
          role: 'ADMIN',
          passwordHash: 'dummy_hash'
        }
      });
    }

    // 2. Generate authentication tokens
    const token1 = jwt.sign({ id: mockUser1.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    const token2 = jwt.sign({ id: mockUser2.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

    // 3. Connect client 1
    client1 = Client(`http://localhost:${PORT}`, {
      auth: { token: token1 },
      transports: ['websocket']
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Client 1 connection timeout')), 5000);
      client1.on('connect', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    console.log('✅ Client 1 connected successfully');

    // 4. Connect client 2
    client2 = Client(`http://localhost:${PORT}`, {
      auth: { token: token2 },
      transports: ['websocket']
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Client 2 connection timeout')), 5000);
      client2.on('connect', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    console.log('✅ Client 2 connected successfully');

    // 5. Test Room Subscription (project:123)
    await new Promise((resolve, reject) => {
      client1.emit('project:join', { projectId: 'project123' }, (res) => {
        if (res && res.success) {
          console.log('✅ Client 1 successfully joined project123 room');
          resolve();
        } else {
          reject(new Error('Failed to join project room'));
        }
      });
    });

    await new Promise((resolve, reject) => {
      client2.emit('project:join', { projectId: 'project123' }, (res) => {
        if (res && res.success) {
          console.log('✅ Client 2 successfully joined project123 room');
          resolve();
        } else {
          reject(new Error('Failed to join project room'));
        }
      });
    });

    // 6. Test Presence & Viewing Updates
    const viewingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Did not receive viewing event')), 5000);
      client2.on('user:viewing', (data) => {
        if (data.userId === mockUser1.id && data.taskId === 'task_abc') {
          console.log('✅ Client 2 successfully received viewing status update from Client 1');
          clearTimeout(timer);
          resolve();
        }
      });
    });

    client1.emit('task:viewing', { taskId: 'task_abc', projectId: 'project123' });
    await viewingPromise;

    // 7. Test Typing Indicators
    const typingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Did not receive typing event')), 5000);
      client2.on('user:typing', (data) => {
        if (data.userId === mockUser1.id && data.isTyping) {
          console.log('✅ Client 2 successfully received typing indicator from Client 1');
          clearTimeout(timer);
          resolve();
        }
      });
    });

    client1.emit('user:typing', { projectId: 'project123', taskId: 'task_abc', isTyping: true });
    await typingPromise;

    // 8. Test Collaborative Edit Locking (task:lock)
    await new Promise((resolve, reject) => {
      client1.emit('task:lock', { taskId: 'task_abc', projectId: 'project123' }, (res) => {
        if (res && res.success) {
          console.log('✅ Client 1 successfully locked task_abc');
          resolve();
        } else {
          reject(new Error('Failed to lock task'));
        }
      });
    });

    // Client 2 attempts to lock the same task -> should be rejected
    await new Promise((resolve, reject) => {
      client2.emit('task:lock', { taskId: 'task_abc', projectId: 'project123' }, (res) => {
        if (res && !res.success) {
          console.log('✅ Client 2 lock request was rejected (Task is currently locked) - Correct Behavior');
          resolve();
        } else {
          reject(new Error('Client 2 lock request should have been rejected'));
        }
      });
    });

    // Client 1 unlocks the task
    await new Promise((resolve, reject) => {
      client1.emit('task:unlock', { taskId: 'task_abc', projectId: 'project123' }, (res) => {
        if (res && res.success) {
          console.log('✅ Client 1 successfully unlocked task_abc');
          resolve();
        } else {
          reject(new Error('Failed to unlock task'));
        }
      });
    });

    // 9. Test Mutation event validations and event versioning checks
    await new Promise((resolve, reject) => {
      client1.emit('mutation:event', {
        event: 'task:move',
        payload: {
          taskId: 'task_abc',
          projectId: 'project123',
          eventVersion: 1,
          timestamp: Date.now()
        }
      }, (res) => {
        if (res && res.success) {
          console.log('✅ Mutation event successfully validated and acknowledged');
          resolve();
        } else {
          reject(new Error('Mutation event validation failed'));
        }
      });
    });

    console.log('🎉 All Socket.io real-time tests passed successfully!');

  } catch (err) {
    console.error('❌ Integration verification tests failed:', err.message);
    process.exit(1);
  } finally {
    // Cleanup connections
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
    
    // Shut down server
    await new Promise((resolve) => server.close(resolve));
    console.log('🛑 Testing server successfully shut down');
  }
}

runRealtimeVerification().then(() => {
  process.exit(0);
});

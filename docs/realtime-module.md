# Real-Time Collaborative Workspace Module (Enterprise Grade)

The Real-Time Collaborative Workspace Module utilizes Socket.IO to provide instant bidirectional state synchronization across all connected team sessions.

## 🔑 1. Connection Authentication

WebSockets connect using handshake authentication parsing either handshake payload values or query parameters:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});
```

The server decodes the JWT token against the system `JWT_SECRET`, resolves the `User` from the database, joins their relationship references (e.g. employeeId), and registers user statuses inside the presence cache.

## 📂 2. WebSocket Subscription Rooms

To maximize synchronization performance and reduce packet overhead, connected sockets partition updates using three logical room channels:

*   `project:${projectId}`: Syncs Kanban moves, column drag-and-drops, title updates, comment feed submissions, and active checklist completions.
*   `employee:${userId}`: Syncs private push notifications directly to the targeted user session.
*   `dashboard`: Syncs analytics updates, roster check-ins, calendar feed updates, recruitment changes, and general team events.

## 🔒 3. Collaborative Edit Locking

To prevent race conditions, the system enforces a strict task metadata editing lock protocol:

*   **Acquisition**: When a user clicks "Edit Metadata", the client requests a lock. If available, the lock is registered in-memory with a 2-minute timeout.
*   **Conflict Prevention**: If a lock is active, other users see a warning label (`EditingIndicator`) and their edit buttons are greyed out.
*   **Automatic Release**: The lock is immediately released on task save, cancel, browser tab closure, client disconnection, or inactivity timeout.

## 📡 4. Real-Time Broadcast Matrix

| Event Key | Sender | Channel | Description |
| :--- | :--- | :--- | :--- |
| `user:online` | Server | Global Broadcast | Pushes active connection signals (`{ userId, name }`) |
| `user:offline` | Server | Global Broadcast | Pushes disconnect signals (`{ userId, name }`) |
| `user:viewing` | Client | `project:${projectId}` | Broadcasts what card path the user is actively viewing |
| `user:typing` | Client | `project:${projectId}` | Syncs typing indicators |
| `task:lock` | Client | `project:${projectId}` | Acquires exclusive card editing lock |
| `task:unlock` | Client | `project:${projectId}` | Releases card editing lock |
| `task:status` | Server | `project:${projectId}` | Triggers instant Kanban card transitions |

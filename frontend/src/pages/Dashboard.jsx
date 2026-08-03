import React from 'react';

export default function Dashboard() {
  const statistics = [
    { title: 'Total Employees', value: '24', change: '+2 this month', icon: '👥', color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Active Projects', value: '8', change: '2 near deadline', icon: '📂', color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Pending Tasks', value: '42', change: '12 high priority', icon: '⏳', color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Completed Tasks', value: '189', change: '+14 this week', icon: '✅', color: 'text-emerald-500 bg-emerald-500/10' }
  ];

  const recentTasks = [
    { id: 1, title: 'Setup Neon DB Server', project: 'Task Portal', assignee: 'Jane Doe', status: 'Completed', priority: 'High' },
    { id: 2, title: 'Integrate Helmet Headers', project: 'Security Suite', assignee: 'John Smith', status: 'In Progress', priority: 'Medium' },
    { id: 3, title: 'Build Landing Banner', project: 'Marketing UI', assignee: 'Alice Green', status: 'To-Do', priority: 'Low' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Dashboard</h1>
        <p className="text-slateDark-400 mt-2">Real-time status updates and workload analytics.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, index) => (
          <div key={index} className="glass rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slateDark-400 text-sm font-semibold">{stat.title}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-xs text-slateDark-400 flex items-center space-x-1">
              <span className="text-emerald-500 font-medium">↑</span>
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Analytics Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white">Project Workload Analysis</h3>
            <span className="text-xs text-brand-400 font-semibold cursor-pointer hover:underline">View reports</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slateDark-300">Engineering Module</span>
                <span className="text-white font-semibold">82%</span>
              </div>
              <div className="w-full bg-slateDark-900 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slateDark-300">Database Optimization</span>
                <span className="text-white font-semibold">45%</span>
              </div>
              <div className="w-full bg-slateDark-900 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slateDark-300">Security Integration</span>
                <span className="text-white font-semibold">60%</span>
              </div>
              <div className="w-full bg-slateDark-900 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Task lists status distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-bold text-lg text-white mb-6">Priority Distribution</h3>
          <div className="flex justify-around items-center h-40">
            {/* Visual HTML progress circles/indicators */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center text-sm font-bold text-white mb-2">12</div>
              <span className="text-xs text-slateDark-400 font-semibold">High Priority</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center text-sm font-bold text-white mb-2">18</div>
              <span className="text-xs text-slateDark-400 font-semibold">Medium</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center text-sm font-bold text-white mb-2">12</div>
              <span className="text-xs text-slateDark-400 font-semibold">Low Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass rounded-xl p-6 overflow-hidden">
        <h3 className="font-bold text-lg text-white mb-6">Recent Work Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slateDark-800 text-slateDark-400 text-sm font-semibold">
                <th className="pb-3">Task Details</th>
                <th className="pb-3">Project</th>
                <th className="pb-3">Assignee</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id} className="border-b border-slateDark-900 last:border-0 hover:bg-slateDark-900/50 transition-colors text-sm text-slateDark-300">
                  <td className="py-4 font-semibold text-white">{task.title}</td>
                  <td className="py-4">{task.project}</td>
                  <td className="py-4">{task.assignee}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      task.status === 'In Progress' ? 'bg-brand-500/10 text-brand-400' : 'bg-slateDark-800 text-slateDark-400'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      task.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                      task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

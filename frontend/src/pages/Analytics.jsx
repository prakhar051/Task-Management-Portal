import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../store/authStore';
import KpiCard from '../components/analytics/KpiCard';
import ChartCard from '../components/analytics/ChartCard';
import TrendChart from '../components/analytics/TrendChart';
import BarChartCard from '../components/analytics/BarChartCard';
import PieChartCard from '../components/analytics/PieChartCard';
import AnalyticsToolbar from '../components/analytics/AnalyticsToolbar';

export default function Analytics() {
  const user = useAuthStore((state) => state.user);

  const overview = useAnalyticsStore((state) => state.overview);
  const employeeStats = useAnalyticsStore((state) => state.employeeStats);
  const deptStats = useAnalyticsStore((state) => state.deptStats);
  const projectStats = useAnalyticsStore((state) => state.projectStats);
  const taskStats = useAnalyticsStore((state) => state.taskStats);
  const productivityStats = useAnalyticsStore((state) => state.productivityStats);

  const filters = useAnalyticsStore((state) => state.filters);
  const setFilters = useAnalyticsStore((state) => state.setFilters);
  const resetFilters = useAnalyticsStore((state) => state.resetFilters);
  const fetchOverview = useAnalyticsStore((state) => state.fetchOverview);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);

  const [trendType, setTrendType] = useState('daily'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const getTrendData = () => {
    if (!productivityStats) return [];
    if (trendType === 'weekly') return productivityStats.weeklyTrend || [];
    if (trendType === 'monthly') return productivityStats.monthlyTrend || [];
    return productivityStats.dailyTrend || [];
  };

  const getTrendXKey = () => {
    if (trendType === 'weekly') return 'week';
    if (trendType === 'monthly') return 'month';
    return 'date';
  };

  // Convert status counts into Recharts-friendly arrays
  const getTaskStatusPieData = () => {
    if (!taskStats) return [];
    return [
      { name: 'Completed', value: taskStats.completedTasks },
      { name: 'Pending', value: taskStats.pendingTasks },
      { name: 'Blocked', value: taskStats.blockedTasks },
      { name: 'Overdue', value: taskStats.overdueTasks }
    ].filter((item) => item.value > 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Analytics</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Executive Dashboard</h1>
        </div>
        <div className="text-xs text-slateDark-400 font-bold bg-slateDark-900 px-3 py-1.5 rounded-xl border border-slateDark-800 font-mono">
          Scope: {user?.role || 'Guest'}
        </div>
      </div>

      {/* Analytics Toolbar */}
      <AnalyticsToolbar
        filters={filters}
        onChange={setFilters}
        onClear={resetFilters}
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {isLoading && !overview && (
        <div className="min-h-[40vh] flex items-center justify-center text-xs animate-pulse text-slateDark-500 font-bold">
          Aggregating database statistics...
        </div>
      )}

      {overview && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'ADMIN' && (
              <>
                <KpiCard
                  title="Total Employees"
                  value={employeeStats?.totalEmployees}
                  icon="👥"
                  colorClass="text-blue-400"
                  subtext={`Active: ${employeeStats?.activeEmployees} | Leave: ${employeeStats?.onLeave}`}
                />
                <KpiCard
                  title="Total Departments"
                  value={deptStats?.totalDepartments}
                  icon="🏢"
                  colorClass="text-indigo-400"
                  subtext="Office locations distribution"
                />
              </>
            )}

            <KpiCard
              title="Active Projects"
              value={projectStats?.activeProjects}
              icon="📂"
              colorClass="text-amber-400"
              subtext={`Total Projects: ${projectStats?.totalProjects} | Avg Progress: ${projectStats?.averageProgress}%`}
            />

            <KpiCard
              title="Completed Tasks"
              value={taskStats?.completedTasks}
              icon="✅"
              colorClass="text-emerald-400"
              subtext={`Total: ${taskStats?.totalTasks} | Overdue: ${taskStats?.overdueTasks} | Avg: ${taskStats?.averageCompletion}%`}
            />
          </div>

          {/* Charts Row 1: Trend and Status Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard
                title="Productivity Trend"
                subtitle="Completed tasks rate timeline overview"
                actions={
                  <div className="flex bg-slateDark-900 border border-slateDark-800 rounded-xl p-0.5 select-none">
                    {['daily', 'weekly', 'monthly'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTrendType(t)}
                        className={`px-3 py-1 text-[10px] font-extrabold capitalize rounded-lg transition-all ${
                          trendType === t
                            ? 'bg-brand-500 text-white shadow-md'
                            : 'text-slateDark-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                }
              >
                {getTrendData().length > 0 ? (
                  <TrendChart data={getTrendData()} xKey={getTrendXKey()} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs italic text-slateDark-500">
                    No productivity logs recorded in this date range
                  </div>
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard title="Task Distributions" subtitle="Division of task logs by progress status">
                {getTaskStatusPieData().length > 0 ? (
                  <PieChartCard data={getTaskStatusPieData()} isDoughnut={true} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs italic text-slateDark-500">
                    No active task logs found
                  </div>
                )}
              </ChartCard>
            </div>
          </div>

          {/* Charts Row 2: Performers & Department counts (ADMIN / MANAGER only) */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Top Performers" subtitle="Completed task headcount rank (Top 10)">
                {productivityStats?.topPerformers?.length > 0 ? (
                  <BarChartCard data={productivityStats.topPerformers} dataKey="tasksCompleted" xKey="name" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs italic text-slateDark-500">
                    No task completions recorded
                  </div>
                )}
              </ChartCard>

              {user?.role === 'ADMIN' && (
                <ChartCard title="Department Productivity" subtitle="Completed task headcount per department">
                  {productivityStats?.departmentProductivity?.length > 0 ? (
                    <BarChartCard data={productivityStats.departmentProductivity} dataKey="tasksCompleted" xKey="name" />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs italic text-slateDark-500">
                      No task completions recorded
                  </div>
                  )}
                </ChartCard>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

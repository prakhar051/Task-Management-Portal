import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/apiClient';

// Import sub-components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCard from '../components/dashboard/StatsCard';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityCard from '../components/dashboard/ActivityCard';
import NotificationCard from '../components/dashboard/NotificationCard';
import QuickActions from '../components/dashboard/QuickActions';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import ErrorState from '../components/dashboard/ErrorState';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API datasets state
  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [charts, setCharts] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Fetch all dashboard panels data in parallel
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOverview, resActivity, resNotifications, resCharts] = await Promise.all([
        apiClient.get('/dashboard/overview'),
        apiClient.get('/dashboard/activity'),
        apiClient.get('/dashboard/notifications'),
        apiClient.get('/dashboard/charts')
      ]);

      setOverview(resOverview.data.data);
      setActivities(resActivity.data.data);
      setNotifications(resNotifications.data.data);
      setCharts(resCharts.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed connecting to the dashboard APIs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Debounced search query handler from header
  const handleSearch = useCallback((query) => {
    setFilterQuery(query);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState errorMsg={error} onRetry={fetchDashboardData} />;
  }

  // Filter lists based on the query if needed
  const filteredActivities = activities.filter((act) =>
    act.details.toLowerCase().includes(filterQuery.toLowerCase()) ||
    act.user.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Stats Card configurations based on user roles
  const getStatsCards = () => {
    if (!overview) return [];

    if (user.role === 'ADMIN') {
      return [
        { title: 'Total Employees', value: overview.totalEmployees, change: '+2 new registers', icon: '👥', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Active Projects', value: overview.activeProjects, change: `${overview.completedProjects} archives`, icon: '📂', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        { title: 'Pending Tasks', value: overview.pendingTasks, change: `${overview.overdueTasks} urgent logs`, icon: '⏳', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Completed Tasks', value: overview.completedTasks, change: '+14 this week', icon: '✅', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
      ];
    } else if (user.role === 'MANAGER') {
      return [
        { title: 'Team Size', value: overview.totalEmployees, change: '1 managed department', icon: '👥', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Managed Projects', value: overview.totalProjects, change: `${overview.activeProjects} active projects`, icon: '📂', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        { title: 'Team Pending Tasks', value: overview.pendingTasks, change: `${overview.overdueTasks} overdue`, icon: '⏳', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Team Completed Tasks', value: overview.completedTasks, change: '+8 this week', icon: '✅', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
      ];
    } else {
      // EMPLOYEE role stats
      return [
        { title: 'My Total Tasks', value: overview.totalTasks, change: 'Assigned checklist', icon: '📋', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'My Pending Tasks', value: overview.pendingTasks, change: `${overview.overdueTasks} overdue alerts`, icon: '⏳', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'My Completed Tasks', value: overview.completedTasks, change: '+3 completed this week', icon: '✅', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Assigned Projects', value: overview.totalProjects, change: 'Active collaborations', icon: '📂', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
      ];
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search and metadata Greeting Header */}
      <DashboardHeader onSearch={handleSearch} />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Quick Action Operations Buttons */}
      <QuickActions />

      {/* Recharts Analytics Displays */}
      {charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Task Lifecycle States" type="pie" data={charts.tasksByStatus} />
          <ChartCard title="Task Urgency priorities" type="doughnut" data={charts.tasksByPriority} />
          <ChartCard title="Performance Trends" type="area" data={charts.monthlyPerformance} />
        </div>
      )}

      {/* Activities and Notifications listings logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard activities={filteredActivities} />
        <NotificationCard notifications={notifications} />
      </div>
    </div>
  );
}

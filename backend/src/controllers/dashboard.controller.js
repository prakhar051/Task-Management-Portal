import { DashboardService } from '../services/dashboard.service.js';

export const getOverview = async (req, res) => {
  const overview = await DashboardService.getOverview(req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Dashboard overview statistics retrieved successfully.',
    data: overview
  });
};

export const getActivity = async (req, res) => {
  const activities = await DashboardService.getActivityLogs(req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Recent dashboard activity logs retrieved successfully.',
    data: activities
  });
};

export const getNotifications = async (req, res) => {
  const notifications = await DashboardService.getNotifications(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Recent user notifications retrieved successfully.',
    data: notifications
  });
};

export const getCharts = async (req, res) => {
  const chartData = await DashboardService.getChartData(req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Dashboard analytics chart datasets retrieved successfully.',
    data: chartData
  });
};

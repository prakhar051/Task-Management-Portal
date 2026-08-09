import React, { useEffect } from 'react';
import useSocketStore from '../../store/socketStore';
import { useTaskStore } from '../../store/taskStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useCandidateStore } from '../../store/candidateStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import useAssetStore from '../../store/assetStore';
import useMaintenanceStore from '../../store/maintenanceStore';
import { useProjectStore } from '../../store/projectStore';

const RealtimeListener = () => {
  const lastEvent = useSocketStore((state) => state.lastReceivedEvent);

  useEffect(() => {
    if (!lastEvent) return;

    const { event, payload } = lastEvent;

    switch (event) {
      // --- Tasks & Kanban ---
      case 'task:create':
      case 'task:delete':
      case 'task:status':
      case 'task:update':
      case 'task:assign':
      case 'task:priority': {
        const taskStore = useTaskStore.getState();
        taskStore.fetchTasks();
        
        const taskId = payload.taskId || payload.task?.id;
        if (taskId && taskStore.currentTask?.id === taskId) {
          taskStore.fetchTaskById(taskId);
        }

        // Keep dashboard/analytics graphs in sync
        const analyticsStore = useAnalyticsStore.getState();
        if (analyticsStore.fetchOverview) {
          analyticsStore.fetchOverview();
        }
        break;
      }

      // --- Comments & Attachments ---
      case 'comment:create':
      case 'comment:update':
      case 'comment:delete':
      case 'task:attachment': {
        const taskStore = useTaskStore.getState();
        const taskId = payload.taskId;
        if (taskId && taskStore.currentTask?.id === taskId) {
          taskStore.fetchTaskById(taskId);
        }
        break;
      }

      // --- Notifications ---
      case 'notification:new':
      case 'notification:update':
      case 'notification:updateAll':
      case 'notification:delete': {
        const notifStore = useNotificationStore.getState();
        notifStore.fetchNotifications();
        notifStore.fetchUnreadCount();
        break;
      }

      // --- Attendance ---
      case 'attendance:update': {
        const attendanceStore = useAttendanceStore.getState();
        attendanceStore.fetchTodayAttendance();

        const analyticsStore = useAnalyticsStore.getState();
        if (analyticsStore.fetchOverview) {
          analyticsStore.fetchOverview();
        }
        break;
      }

      // --- Calendar ---
      case 'calendar:update': {
        const calendarStore = useCalendarStore.getState();
        calendarStore.fetchFeed();
        break;
      }

      // --- Recruitment ---
      case 'candidate:update': {
        const candidateStore = useCandidateStore.getState();
        candidateStore.fetchCandidates();
        break;
      }

      // --- Assets & Maintenance ---
      case 'asset:update': {
        useAssetStore.getState().fetchAssets();
        useMaintenanceStore.getState().fetchRecords();
        break;
      }

      default:
        break;
    }
  }, [lastEvent]);

  return null;
};

export default RealtimeListener;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load dynamic import components to code-split bundles
const Employees = lazy(() => import('./pages/Employees'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
const Departments = lazy(() => import('./pages/Departments'));
const DepartmentDetails = lazy(() => import('./pages/DepartmentDetails'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Tasks = lazy(() => import('./pages/Tasks'));
const TaskDetails = lazy(() => import('./pages/TaskDetails'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Calendar = lazy(() => import('./pages/Calendar'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app workspace panel paths */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default child redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Employee module paths */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Employees />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="employees/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <EmployeeDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Department module paths */}
          <Route
            path="departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Departments />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="departments/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <DepartmentDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Project module paths */}
          <Route
            path="projects"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Projects />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="projects/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <ProjectDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Task module paths */}
          <Route
            path="tasks"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Tasks />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <TaskDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Notification module path */}
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Notifications />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Activity module path */}
          <Route
            path="activity"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <ActivityLogs />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Analytics module path */}
          <Route
            path="analytics"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Analytics />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Reports module path */}
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Calendar module path */}
          <Route
            path="calendar"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Calendar />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Leaves module path */}
          <Route
            path="leaves"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <LeaveManagement />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all navigation */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

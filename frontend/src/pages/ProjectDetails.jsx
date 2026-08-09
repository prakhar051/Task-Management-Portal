import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import useSocketStore from '../store/socketStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/dashboard/ErrorState';

// Components
import ProjectCard from '../components/projects/ProjectCard';
import TimelineCard from '../components/projects/TimelineCard';
import ManagerAssignmentModal from '../components/projects/ManagerAssignmentModal';
import MemberAssignmentModal from '../components/projects/MemberAssignmentModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const joinProject = useSocketStore((state) => state.joinProject);
  const leaveProject = useSocketStore((state) => state.leaveProject);

  const {
    currentProject,
    projectEmployees,
    fetchProjectById,
    fetchProjectMembers,
    loading,
    error
  } = useProjectStore();

  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      joinProject(id);
      return () => {
        leaveProject(id);
      };
    }
  }, [id, joinProject, leaveProject]);

  useEffect(() => {
    fetchProjectById(id);
    fetchProjectMembers(id);
  }, [id, fetchProjectById, fetchProjectMembers]);

  const getAvatarPath = (path) => {
    if (!path) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  if (loading && !currentProject) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/projects" className="text-sm text-slateDark-400 hover:text-white transition-colors">
          ← Back to Projects
        </Link>
        <ErrorState
          errorMsg={error}
          onRetry={() => {
            fetchProjectById(id);
            fetchProjectMembers(id);
          }}
        />
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <div className="space-y-6 pb-12 max-w-5xl select-none">
      {/* Breadcrumbs link navigation */}
      <Link
        to="/projects"
        className="inline-flex items-center space-x-2 text-sm text-slateDark-400 hover:text-white transition-colors"
      >
        <span>←</span>
        <span>Back to Projects Directory</span>
      </Link>

      {/* Grid containing Project Info & Timelines Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProjectCard
            project={currentProject}
            onAssignManagerClick={() => setManagerModalOpen(true)}
          />
        </div>
        <div>
          <TimelineCard
            startDate={currentProject.startDate}
            endDate={currentProject.endDate}
            status={currentProject.status}
          />
        </div>
      </div>

      {/* Project members allocation list panel */}
      <div className="glass rounded-2xl border border-slateDark-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateDark-900 pb-5">
          <div>
            <h3 className="text-lg font-extrabold text-white">Project Assigned Members</h3>
            <p className="text-slateDark-400 text-xs mt-1">
              Active workforce allocations mapped to this project team.
            </p>
          </div>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setMemberModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/10"
            >
              Allocate Members
            </button>
          )}
        </div>

        {projectEmployees.length === 0 ? (
          <div className="text-center py-8 text-slateDark-550 italic text-sm">
            No workforce members assigned as project team.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slateDark-900 bg-slateDark-950/20">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slateDark-900/40 border-b border-slateDark-900 text-xs font-bold text-slateDark-400 uppercase">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Project Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateDark-900">
                {projectEmployees.map((member) => {
                  const emp = member.employee;
                  if (!emp) return null;
                  const fullName = `${emp.firstName} ${emp.lastName}`;
                  const joinedDate = new Date(member.joinedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={member.id} className="hover:bg-slateDark-900/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {emp.avatar ? (
                            <img
                              src={getAvatarPath(emp.avatar)}
                              alt={fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slateDark-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 font-bold flex items-center justify-center text-xs uppercase">
                              {emp.firstName.charAt(0)}
                              {emp.lastName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/employees/${emp.id}`}
                              className="font-bold text-white hover:text-brand-400 transition-colors block"
                            >
                              {fullName}
                            </Link>
                            <span className="text-xs text-slateDark-550 block">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slateDark-400">{emp.employeeCode}</td>
                      <td className="p-4 text-slateDark-300 font-semibold">{emp.designation}</td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-450 border border-brand-500/15 uppercase">
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slateDark-400">{joinedDate}</td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slateDark-900 hover:bg-slateDark-900 hover:text-white transition-colors text-xs font-semibold select-none"
                        >
                          📄 View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manager select assignment modal */}
      {managerModalOpen && (
        <ManagerAssignmentModal
          project={currentProject}
          onClose={() => setManagerModalOpen(false)}
        />
      )}

      {/* Member allocations checklist assignment modal */}
      {memberModalOpen && (
        <MemberAssignmentModal
          project={currentProject}
          onClose={() => setMemberModalOpen(false)}
        />
      )}
    </div>
  );
}

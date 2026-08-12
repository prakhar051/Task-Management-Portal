import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCandidateStore } from '../store/candidateStore';
import { useInterviewStore } from '../store/interviewStore';
import { useOfferStore } from '../store/offerStore';
import { apiClient, API_URL } from '../api/apiClient';
import ResumeViewer from '../components/recruitment/ResumeViewer';
import InterviewScheduler from '../components/recruitment/InterviewScheduler';
import FeedbackModal from '../components/recruitment/FeedbackModal';
import OfferDialog from '../components/recruitment/OfferDialog';
import InterviewPanel from '../components/recruitment/InterviewPanel';

export default function CandidateDetails() {
  const { id } = useParams();

  const activeCandidate = useCandidateStore((state) => state.activeCandidate);
  const fetchCandidateDetails = useCandidateStore((state) => state.fetchCandidateDetails);
  const changeStage = useCandidateStore((state) => state.changeStage);
  const hireCandidate = useCandidateStore((state) => state.hireCandidate);
  const linkDocument = useCandidateStore((state) => state.linkDocument);

  const scheduleInterview = useInterviewStore((state) => state.scheduleInterview);
  const cancelInterview = useInterviewStore((state) => state.cancelInterview);
  const submitFeedback = useInterviewStore((state) => state.submitFeedback);

  const createOffer = useOfferStore((state) => state.createOffer);

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    fetchCandidateDetails(id);
  }, [id, fetchCandidateDetails]);

  const handleStageSelect = async (e) => {
    await changeStage(id, e.target.value);
    await fetchCandidateDetails(id);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', `${activeCandidate.firstName}_Resume`);
    formData.append('category', 'PDF');
    formData.append('entityType', 'RECRUITMENT');
    formData.append('entityId', activeCandidate.id);

    try {
      const response = await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const docId = response.data.data.id;
        await linkDocument(activeCandidate.id, docId, 'RESUME');
        await fetchCandidateDetails(id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload resume.');
    }
  };

  const handleScheduleSubmit = async (payload) => {
    const success = await scheduleInterview(payload);
    if (success) {
      await fetchCandidateDetails(id);
    }
    return success;
  };

  const handleFeedbackSubmit = async (interviewId, payload) => {
    const success = await submitFeedback(interviewId, payload);
    if (success) {
      await fetchCandidateDetails(id);
    }
    return success;
  };

  const handleOfferSubmit = async (payload) => {
    const success = await createOffer(payload);
    if (success) {
      await changeStage(id, 'OFFERED');
      await fetchCandidateDetails(id);
    }
    return success;
  };

  const handleHire = async () => {
    if (!window.confirm('Hire this candidate? This will provision active system logins, create employee directories, and map all documents.')) {
      return;
    }
    setHiring(true);
    try {
      const success = await hireCandidate(id);
      if (success) {
        alert('Hiring transactional flow completed successfully! Onboarding task list and notification logs generated.');
        await fetchCandidateDetails(id);
      }
    } catch (err) {
      alert(err.message || 'Failed to hire applicant.');
    } finally {
      setHiring(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (window.confirm('Cancel this interview round?')) {
      await cancelInterview(interviewId);
      await fetchCandidateDetails(id);
    }
  };

  if (!activeCandidate) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-500 font-semibold italic">
        Loading Candidate details...
      </div>
    );
  }

  const resumeDoc = activeCandidate.documents?.find((d) => d.type === 'RESUME');

  return (
    <div className="space-y-6 select-none pb-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider block">
            👤 Candidate Profile Workspace
          </span>
          <h1 className="text-xl font-black text-white">
            {activeCandidate.firstName} {activeCandidate.lastName}
          </h1>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/recruitment/candidates"
            className="px-4 py-2.5 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            ➔ Applicants List
          </Link>
          {activeCandidate.status === 'OFFERED' && (
            <button
              onClick={handleHire}
              disabled={hiring}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-md"
            >
              {hiring ? 'Hiring...' : '⚡ Finalise Hire'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Timeline */}
        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-5 text-xs font-semibold text-slateDark-300">
          <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Applicant Dossier</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slateDark-500">Target Position:</span>
              <span className="text-white font-bold">{activeCandidate.job?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Email:</span>
              <span className="text-white font-bold">{activeCandidate.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Phone:</span>
              <span className="text-white font-bold">{activeCandidate.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slateDark-500">Stage Status:</span>
              <select
                value={activeCandidate.status}
                onChange={handleStageSelect}
                className="px-2 py-1 bg-slateDark-900 border border-slateDark-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFERED">Offered</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slateDark-900 space-y-3">
            <span className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">
              📁 Resume Attachment
            </span>
            {resumeDoc ? (
              <div className="flex items-center justify-between p-3 bg-slateDark-905 border border-slateDark-850 rounded-2xl">
                <span className="text-white text-xs font-bold font-mono">
                  📄 {resumeDoc.document?.name}
                </span>
                <a
                  href={`${API_URL}/documents/${resumeDoc.documentId}/download`}
                  className="text-brand-400 hover:text-white"
                >
                  Download
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slateDark-500 italic">No resume uploaded</p>
                <label className="px-4 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-white rounded-xl text-xs font-bold text-center block cursor-pointer transition-all">
                  Upload Resume PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic resume viewer / timeline actions */}
        <div className="lg:col-span-2 space-y-6">
          <ResumeViewer candidate={activeCandidate} />

          {/* Interview Logs Section */}
          <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slateDark-900 pb-2">
              <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
                ⏰ Scheduled Interview Rounds
              </h3>
              <button
                onClick={() => setIsSchedulerOpen(true)}
                className="px-3.5 py-1.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all"
              >
                Schedule Round
              </button>
            </div>

            <div className="space-y-4">
              {activeCandidate.interviews?.map((itm) => (
                <div
                  key={itm.id}
                  className="bg-slateDark-905/30 border border-slateDark-900 p-4 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-extrabold text-white">
                        {itm.title} ({itm.type})
                      </h4>
                      <span className="text-[10px] text-slateDark-500 font-semibold font-mono">
                        Date: {new Date(itm.scheduledAt).toLocaleString()} | Status: {itm.status}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {itm.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedInterviewId(itm.id);
                              setIsFeedbackOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[9px] font-black transition-all"
                          >
                            Submit Feedback
                          </button>
                          <button
                            onClick={() => handleCancelInterview(itm.id)}
                            className="px-2.5 py-1.5 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-[9px] font-black transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <InterviewPanel panelMembers={itm.panelMembers} />

                  {/* Feedback logs */}
                  {itm.feedbacks?.length > 0 && (
                    <div className="pt-2 border-t border-slateDark-900/50 space-y-2">
                      <span className="text-[9px] font-black text-slateDark-400 uppercase tracking-wider block">
                        📝 Submitted Evaluations
                      </span>
                      {itm.feedbacks.map((fb) => (
                        <div key={fb.id} className="text-xs leading-relaxed text-slateDark-300">
                          <strong>{fb.interviewer?.firstName}</strong> scored{' '}
                          <span className="font-mono text-white font-bold">{fb.score}/10</span> (
                          <span className="text-brand-400 font-bold uppercase">{fb.result}</span>): "{fb.comments}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {(!activeCandidate.interviews || activeCandidate.interviews.length === 0) && (
                <p className="text-xs text-slateDark-600 italic text-center py-6">No interview sessions scheduled.</p>
              )}
            </div>
          </div>

          {/* Offer Letters Section */}
          <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slateDark-900 pb-2">
              <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
                💼 Offer Proposals
              </h3>
              <button
                onClick={() => setIsOfferOpen(true)}
                className="px-3.5 py-1.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all"
              >
                Draft Offer Letter
              </button>
            </div>

            <div className="space-y-3">
              {activeCandidate.offers?.map((o) => (
                <div
                  key={o.id}
                  className="bg-slateDark-905/30 border border-slateDark-900 p-4 rounded-2xl flex justify-between items-center"
                >
                  <div className="text-xs font-semibold text-slateDark-300">
                    <span className="text-slateDark-500">Gross Monthly:</span>{' '}
                    <span className="text-white font-mono font-bold">${o.grossSalary.toFixed(2)}</span>
                    <div className="text-[10px] text-slateDark-500 mt-1">
                      Status: <span className="uppercase text-white font-bold">{o.status}</span>
                    </div>
                  </div>
                </div>
              ))}

              {(!activeCandidate.offers || activeCandidate.offers.length === 0) && (
                <p className="text-xs text-slateDark-600 italic text-center py-6">No offer letters drafted.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <InterviewScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        candidateId={id}
        onSubmit={handleScheduleSubmit}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        interviewId={selectedInterviewId}
        onSubmit={handleFeedbackSubmit}
      />

      <OfferDialog
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        candidate={activeCandidate}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import CalendarFilters from '../components/calendar/CalendarFilters';
import CalendarGrid from '../components/calendar/CalendarGrid';
import UpcomingEvents from '../components/calendar/UpcomingEvents';
import HolidayCard from '../components/calendar/HolidayCard';
import LeaveRequestModal from '../components/calendar/LeaveRequestModal';
import { useLeaveStore } from '../store/leaveStore';

export default function Calendar() {
  const user = useAuthStore((state) => state.user);

  const events = useCalendarStore((state) => state.events);
  const currentView = useCalendarStore((state) => state.currentView);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const filters = useCalendarStore((state) => state.filters);

  const fetchFeed = useCalendarStore((state) => state.fetchFeed);
  const moveEvent = useCalendarStore((state) => state.moveEvent);
  const setView = useCalendarStore((state) => state.setView);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setFilters = useCalendarStore((state) => state.setFilters);
  const resetFilters = useCalendarStore((state) => state.resetFilters);
  const createEvent = useCalendarStore((state) => state.createEvent);

  const submitLeave = useLeaveStore((state) => state.submitLeaveRequest);
  const leaveLoading = useLeaveStore((state) => state.isLoading);
  const leaveError = useLeaveStore((state) => state.error);

  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  
  // Custom event creation local state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('DAILY');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [eventError, setEventError] = useState('');
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, selectedDate, currentView]);

  const handleNavigate = (direction) => {
    const nextDate = new Date(selectedDate);
    if (currentView === 'month') {
      nextDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : direction === 'prev' ? -1 : 0));
    } else if (currentView === 'week') {
      nextDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : direction === 'prev' ? -7 : 0));
    } else if (currentView === 'day') {
      nextDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : direction === 'prev' ? -1 : 0));
    }

    if (direction === 'today') {
      setSelectedDate(new Date());
    } else {
      setSelectedDate(nextDate);
    }
  };

  const handleEventMove = (id, type, newStart, newEnd) => {
    moveEvent(id, type, newStart, newEnd);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventStart || !eventEnd) {
      setEventError('Please fill out all required event parameters.');
      return;
    }
    
    setEventError('');
    setEventLoading(true);
    try {
      const payload = {
        title: eventTitle,
        description: eventDesc,
        startDate: eventStart,
        endDate: eventEnd,
        type: 'CUSTOM'
      };

      if (isRecurring) {
        payload.recurrenceRule = recurrenceRule;
        if (recurrenceEnd) payload.recurrenceEndDate = recurrenceEnd;
      }

      await createEvent(payload);
      setIsEventOpen(false);
      setEventTitle('');
      setEventDesc('');
      setEventStart('');
      setEventEnd('');
      setIsRecurring(false);
    } catch (err) {
      setEventError(err.response?.data?.message || 'Failed to create calendar event.');
    } finally {
      setEventLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Calendar</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Calendar & Scheduling</h1>
        </div>
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setIsLeaveOpen(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 border border-purple-500 hover:border-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 hover:shadow-purple-500/20"
          >
            🌴 Request Leave
          </button>
          <button
            onClick={() => setIsEventOpen(true)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20"
          >
            ➕ Schedule Event
          </button>
        </div>
      </div>

      {/* Calendar toolbar navigation */}
      <CalendarToolbar
        selectedDate={selectedDate}
        view={currentView}
        onViewChange={setView}
        onNavigate={handleNavigate}
      />

      <CalendarFilters
        filters={filters}
        onChange={setFilters}
        onClear={resetFilters}
      />

      {/* Main Grid area layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <CalendarGrid
            view={currentView}
            selectedDate={selectedDate}
            events={events}
            onEventMove={handleEventMove}
          />
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <UpcomingEvents />
          <HolidayCard />
        </div>
      </div>

      {/* Leave Request Form Dialog Modal */}
      <LeaveRequestModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onSubmit={submitLeave}
        isLoading={leaveLoading}
        apiError={leaveError}
      />

      {/* Custom Event Creation Modal */}
      {isEventOpen && (
        <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md bg-slateDark-950 border border-slateDark-900 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsEventOpen(false)}
              className="absolute top-4 right-4 text-slateDark-500 hover:text-white"
            >
              ✕
            </button>

            <div className="border-b border-slateDark-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Schedule Custom Event</h3>
              <p className="text-slateDark-500 text-xs mt-0.5">Register a meeting, deadline, or general calendar coordinate.</p>
            </div>

            {eventError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
                ⚠️ {eventError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event title or subject..."
                  className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Start Date/Time</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">End Date/Time</label>
                  <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Notes, agenda details, or coordinates..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Recurrence Fields Toggle */}
              <div className="border-t border-slateDark-900/60 pt-3 space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded bg-slateDark-900 border-slateDark-800 text-brand-500 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[10.5px] font-bold text-white">Repeat Event (Recurring Schedule)</span>
                </label>

                {isRecurring && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-black text-slateDark-400 uppercase tracking-wider block">Frequency</label>
                      <select
                        value={recurrenceRule}
                        onChange={(e) => setRecurrenceRule(e.target.value)}
                        className="w-full px-3 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-black text-slateDark-400 uppercase tracking-wider block">Until Date</label>
                      <input
                        type="date"
                        value={recurrenceEnd}
                        onChange={(e) => setRecurrenceEnd(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventOpen(false)}
                  className="px-4 py-2 bg-slateDark-905 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventLoading}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {eventLoading ? 'Scheduling...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

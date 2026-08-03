import React from 'react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

export default function CalendarGrid({ view, selectedDate, events, onEventMove }) {
  switch (view) {
    case 'week':
      return (
        <WeekView
          selectedDate={selectedDate}
          events={events}
          onEventMove={onEventMove}
        />
      );
    case 'day':
      return (
        <DayView
          selectedDate={selectedDate}
          events={events}
          onEventMove={onEventMove}
        />
      );
    default:
      return (
        <MonthView
          selectedDate={selectedDate}
          events={events}
          onEventMove={onEventMove}
        />
      );
  }
}

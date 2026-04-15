import { useState, useEffect } from 'react';
import type { Event } from '../types';
import { fetchEvents } from '../services/eventsService';
import staticEventsData from '../data/facebook-events.json';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>(staticEventsData as Event[]);

  useEffect(() => {
    let cancelled = false;

    fetchEvents().then(data => {
      if (!cancelled) {
        setEvents(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}

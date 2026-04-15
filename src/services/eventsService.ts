import type { Event } from '../types';
import staticEventsData from '../data/facebook-events.json';

const CDN_EVENTS_URL =
  'https://perhit-cdn.materiallab.io/fb-events/events.json';
const CACHE_KEY = 'perhitsiksha_events_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedEvents {
  data: Event[];
  timestamp: number;
}

function getCachedEvents(): Event[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedEvents = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedEvents(events: Event[]): void {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: events, timestamp: Date.now() })
    );
  } catch {
    // sessionStorage full or unavailable
  }
}

export async function fetchEvents(): Promise<Event[]> {
  const cached = getCachedEvents();
  if (cached) return cached;

  try {
    const response = await fetch(CDN_EVENTS_URL, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const events: Event[] = await response.json();
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Invalid events data');
    }

    setCachedEvents(events);
    return events;
  } catch (error) {
    console.warn('CDN events fetch failed, using static fallback:', error);
    return staticEventsData as Event[];
  }
}

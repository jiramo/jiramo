import { api } from '../lib/api';

export interface ProjectStats {
  summary: {
    visitors: number;
    visits: number;
    views: number;
    bounce_rate: number;
  };
  events: Array<{
    event_name: string;
    count: number;
  }>;
}

export interface RealtimeStats {
  active_visitors: number;
  as_of: string;
}

export interface TrackPayload {
  project_id: string;
  url: string;
  referrer?: string;
  title?: string;
  prev_path?: string;
  prev_created_at?: string;
}

export interface EventPayload {
  project_id: string;
  url: string;
  event_name: string;
  event_data?: string;
}

export const analyticsService = {
  getProjectStats(id: string, from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return api.get<ProjectStats>(`/api/projects/${id}/analytics${qs ? `?${qs}` : ''}`);
  },

  getRealtimeStats(id: string) {
    return api.get<RealtimeStats>(`/api/projects/${id}/analytics/realtime`);
  },

  track(payload: TrackPayload) {
    return api.postNoAuth<{ session_id: string; view_id: string; new_session: boolean }>('/api/analytics/track', payload);
  },

  trackEvent(payload: EventPayload) {
    return api.postNoAuth<{ event_id: string }>('/api/analytics/event', payload);
  },
};

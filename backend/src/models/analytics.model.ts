// src/models/analytics.model.ts
export interface AnalyticsRecord {
  id: string;
  user_id: string;
  event: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

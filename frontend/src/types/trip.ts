import type { Place } from '../api/tourApi';

export interface ApiResult<T> {
  success: boolean;
  timestamp: string;
  traceId: string;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface TripRequest {
  prompt: string;
  userContext?: any;
}

export interface TripResponse {
  title: string;
  summary: string;
  totalDuration: string;
  plans: DayPlan[];
}

export interface DayPlan {
  day: number;
  items: TripItem[];
}

/**
 * Normalized Trip Item
 * Combines standard Place data with AI-specific context
 */
export interface TripItem extends Place {
  aiMetadata?: {
    time: string;         // 방문 예정 시간 (예: "14:00")
    reason: string;       // AI의 추천 이유
    avgStay: string;      // 예상 체류 시간
    travelTimeNext?: string; // 다음 장소까지 이동 시간
  };
}

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

export interface TripItem {
  location: string;
  lat: number;
  lng: number;
  time: string;
  description: string;
  reason: string;      // AI의 추천 이유
  avgStay: string;     // 예상 체류 시간
  travelTimeNext?: string; // 다음 장소까지 이동 시간
}

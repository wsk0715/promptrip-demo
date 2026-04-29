export interface ApiResult<T> {
  success: boolean;
  timestamp: string;
  requestId: string;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface TripRequest {
  prompt: string;
}

export interface TripResponse {
  id: string;
  title: string;
  plans?: DailyPlan[];
}

export interface DailyPlan {
  day: number;
  items: ScheduleItem[];
}

export interface ScheduleItem {
  time: string;
  location: string;
  description: string;
}

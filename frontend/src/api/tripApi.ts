import api from './api';
import { createEventSource } from './event';
import type { ApiResult, TripRequest, TripResponse } from '../types/trip';

export const postTripRequest = async (request: TripRequest): Promise<ApiResult<TripResponse>> => {
  const response = await api.post<ApiResult<TripResponse>>('/api/trips', request);
  return response.data;
};

export const subscribeToTripEvents = (tripId: string, onMessage: (msg: string) => void, onError: (err: any) => void) => {
  const eventSource = createEventSource(`/api/trips/events/${tripId}`, {
    withCredentials: false
  });
  
  eventSource.onmessage = (event) => {
    onMessage(event.data);
  };

  eventSource.onerror = (err) => {
    onError(err);
    eventSource.close();
  };

  return () => eventSource.close();
};

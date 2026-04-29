import api from './axios';

export interface PingResponse {
  status: string;
  message: string;
}

export const fetchPing = async (): Promise<PingResponse> => {
  const response = await api.get<PingResponse>('/api/ping');
  return response.data;
};

import { BASE_URL } from './api';

export const createEventSource = (path: string, options?: EventSourceInit) => {
  return new EventSource(`${BASE_URL}${path}`, options);
};

import { ref } from 'vue';
import { postTripRequest, subscribeToTripEvents } from '../api/tripApi';
import type { TripResponse } from '../types/trip';

export const useTripPlanner = () => {
  const currentTrip = ref<TripResponse | null>(null);
  const logs = ref<string[]>([]);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  const startPlanning = async (prompt: string) => {
    isProcessing.value = true;
    logs.value = [];
    error.value = null;
    currentTrip.value = null;

    try {
      logs.value.push('Initiating request...');
      const result = await postTripRequest({ prompt });
      
      if (result.success) {
        currentTrip.value = result.data;
        logs.value.push(`Trip created with ID: ${result.data.id}`);
        
        // Subscribe to SSE
        subscribeToTripEvents(
          result.data.id,
          (msg) => {
            if (msg.startsWith('RESULT: ')) {
              try {
                const jsonStr = msg.replace('RESULT: ', '');
                const finalPlan = JSON.parse(jsonStr);
                currentTrip.value = { ...currentTrip.value, ...finalPlan };
                isProcessing.value = false;
              } catch (e) {
                console.error('Failed to parse result JSON', e);
              }
            } else {
              logs.value.push(msg);
            }
          },
          (err) => {
            // Only set error if we are still processing and it's NOT a normal closure
            const target = err.target as EventSource;
            if (isProcessing.value && target.readyState !== 2) { // 2 is CLOSED
              console.error('SSE Error:', err);
              error.value = 'Lost connection to real-time updates.';
              isProcessing.value = false;
            }
          }
        );

        // Optional: auto-unsubscribe handled by component unmount
      } else {
        error.value = result.error?.message || 'Failed to create trip';
        isProcessing.value = false;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Error occurred while planning';
      isProcessing.value = false;
    }
    // Removed finally { isProcessing.value = false; } to wait for SSE
  };

  return {
    currentTrip,
    logs,
    isProcessing,
    error,
    startPlanning,
  };
};

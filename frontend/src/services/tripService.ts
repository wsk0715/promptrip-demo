import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TripResponse } from '../types/trip';
import type { Place } from '../api/tourApi';
import { historyApi } from '../api/historyApi';

export interface VisitRecord {
  tripId: string;
  placeId: string;
  timestamp: string;
  rating: number;
  emotion: string;
  comment: string;
  photo?: string;
}

export interface HistoryTrip extends TripResponse {
  id: string;
  completedAt: string;
  visits: VisitRecord[];
}

export interface CommunityTrip extends TripResponse {
  id: string;
  authorName: string;
  authorImage: string;
  likes: number;
  tags: string[];
  visits?: { title: string; emotion: string }[];
}

export const useTripStore = defineStore('trip', () => {
  const currentTrip = ref<HistoryTrip | null>(null); // Active trip with visit tracking
  const pendingTrip = ref<TripResponse | null>(null);
  const logs = ref<string[]>([]);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const prompt = ref('');
  const recentTrips = ref<TripResponse[]>([]);
  const historyTrips = ref<HistoryTrip[]>([]);
  const visitedPlaces = ref<VisitRecord[]>([]);

  const communityTrips = ref<CommunityTrip[]>([]);

  /**
   * Fetch community trips from API
   */
  const fetchCommunityTrips = async () => {
    try {
      const data = await historyApi.getCommunityTrips();
      communityTrips.value = data;
    } catch (e) {
      error.value = "커뮤니티 여정을 불러오는데 실패했습니다.";
    }
  };

  /**
   * Import a trip from community to my pending plan
   */
  const importCommunityTrip = (trip: CommunityTrip) => {
    // Clone the community trip structure to my pending plan
    pendingTrip.value = {
      title: `${trip.title} (복사됨)`,
      summary: trip.summary,
      totalDuration: trip.totalDuration,
      plans: JSON.parse(JSON.stringify(trip.plans)) // Deep clone to avoid mutations
    };
    
    // Auto-add to recent list
    addToRecent(pendingTrip.value);
  };

  /**
   * Share current completed trip to community
   */
  const shareTripToCommunity = async (trip: HistoryTrip) => {
    isProcessing.value = true;
    try {
      const success = await historyApi.shareTrip(trip);
      if (success) {
        console.log('Successfully shared trip');
      }
    } catch (e) {
      error.value = "여정 공유에 실패했습니다.";
    } finally {
      isProcessing.value = false;
    }
  };

  const addToRecent = (trip: TripResponse) => {
    // Prevent duplicate titles in recent list
    const exists = recentTrips.value.findIndex(t => t.title === trip.title);
    if (exists !== -1) {
      recentTrips.value.splice(exists, 1);
    }
    
    // Add to front and limit to 5 items
    recentTrips.value.unshift({ ...trip });
    if (recentTrips.value.length > 5) {
      recentTrips.value.pop();
    }
  };

  const startPlanning = async (query: string) => {
    prompt.value = query;
    isProcessing.value = true;
    logs.value = [];
    currentTrip.value = null;
    pendingTrip.value = null;

    const steps = [
      "사용자 취향 분석 중...",
      "서울시청 주변 저매출 구역 데이터 조회 중...",
      "안티-허브 추천 알고리즘 가동...",
      "최적의 이동 동선 계산 중...",
      "맞춤형 여행 코스 생성 완료!"
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      logs.value.push(step);
    }

    pendingTrip.value = {
      title: query.length > 10 ? `${query.substring(0, 10)}... 코스` : `${query} 코스`,
      summary: "인파를 피해 여유로운 돌담길을 걷고, 을지로의 빈티지한 감성을 즐기는 완벽한 반나절 코스입니다.",
      totalDuration: "약 4시간",
      plans: [
        {
          day: 1,
          items: [
            {
              contentId: "ai_1",
              contentTypeId: "12",
              title: "덕수궁 돌담길",
              addr1: "서울특별시 중구 세종대로 99",
              mapX: 126.9751,
              mapY: 37.5658,
              firstImage: "https://images.unsplash.com/photo-1578912995000-601c0f065366?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "14:00",
                reason: "현재 혼잡도가 매우 낮아 조용한 힐링에 최적입니다.",
                avgStay: "40분",
                travelTimeNext: "도보 10분"
              }
            },
            {
              contentId: "ai_2",
              contentTypeId: "39",
              title: "명동 로컬 맛집",
              addr1: "서울특별시 중구 명동길",
              mapX: 126.9842,
              mapY: 37.5635,
              firstImage: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "15:00",
                reason: "유명 관광 식당보다 평점이 높고 대기가 적은 현지인 추천 장소입니다.",
                avgStay: "1시간",
                travelTimeNext: "도보 15분"
              }
            },
            {
              contentId: "ai_3",
              contentTypeId: "39",
              title: "을지로 빈티지 카페",
              addr1: "서울특별시 중구 을지로",
              mapX: 126.9910,
              mapY: 37.5661,
              firstImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "16:30",
                reason: "사용자님의 커피 취향에 맞는 조용한 다락방 스타일의 카페입니다.",
                avgStay: "1시간 30분"
              }
            }
          ]
        }
      ]
    };

    if (pendingTrip.value) {
      addToRecent(pendingTrip.value);
    }
    isProcessing.value = false;
  };

  const confirmTrip = () => {
    if (pendingTrip.value) {
      currentTrip.value = { 
        ...pendingTrip.value,
        id: `trip_${Date.now()}`,
        completedAt: '',
        visits: []
      };
    }
  };

  const recordVisit = (visit: Omit<VisitRecord, 'timestamp' | 'tripId'>) => {
    if (!currentTrip.value) return;
    
    const newRecord: VisitRecord = {
      ...visit,
      tripId: currentTrip.value.id,
      timestamp: new Date().toISOString()
    };
    
    // Add to current trip's visits
    currentTrip.value.visits.push(newRecord);
    
    // Add to global visited list
    visitedPlaces.value.push(newRecord);
    
    // If all places visited, complete the trip
    const allPlaces = currentTrip.value.plans.flatMap(p => p.items);
    if (currentTrip.value.visits.length === allPlaces.length) {
      currentTrip.value.completedAt = new Date().toISOString();
      historyTrips.value.unshift({ ...currentTrip.value });
    }
  };

  const isPlaceVisited = (placeId: string) => {
    return currentTrip.value?.visits.some(v => v.placeId === placeId) || false;
  };

  const removeItemFromPending = (index: number) => {
    if (pendingTrip.value && pendingTrip.value.plans.length > 0) {
      pendingTrip.value.plans[0].items.splice(index, 1);
    }
  };

  const addPlaceToPending = (place: Place) => {
    if (!pendingTrip.value) {
      // Create a basic trip structure if none exists
      pendingTrip.value = {
        title: "내가 만든 커스텀 코스",
        summary: "직접 선택한 장소들로 구성된 코스입니다.",
        totalDuration: "계산 중",
        plans: [{ day: 1, items: [] }]
      };
    }
    
    if (pendingTrip.value.plans.length > 0) {
      pendingTrip.value.plans[0].items.push({
        ...place,
        aiMetadata: {
          reason: "사용자가 직접 추가한 장소입니다.",
          time: "방문 예정"
        }
      });
    }
  };

  const resetPlanner = () => {
    currentTrip.value = null;
    pendingTrip.value = null;
    logs.value = [];
    isProcessing.value = false;
    error.value = null;
    prompt.value = '';
  };

  return {
    currentTrip,
    pendingTrip,
    logs,
    isProcessing,
    error,
    prompt,
    recentTrips,
    historyTrips,
    communityTrips,
    visitedPlaces,
    startPlanning,
    addToRecent,
    confirmTrip,
    recordVisit,
    isPlaceVisited,
    removeItemFromPending,
    addPlaceToPending,
    resetPlanner,
    fetchCommunityTrips,
    importCommunityTrip,
    shareTripToCommunity
  };
});

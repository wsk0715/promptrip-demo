import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TripResponse } from '../types/trip';
import type { Place } from '../api/tourApi';
import { historyApi } from '../api/historyApi';
import { calculateDistance, estimateTravelInfo } from '../utils/geoUtils';
import type { TravelInfo } from '../utils/geoUtils';

export interface VisitRecord {
  tripId: string;
  placeId: string;
  timestamp: string;
  rating: number;
  emotion: string;
  comment: string;
  photo?: string;
  color?: string;
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
  const currentTrip = ref<HistoryTrip | null>(null);
  const pendingTrip = ref<TripResponse | null>(null);
  const logs = ref<string[]>([]);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const prompt = ref('');
  const recentTrips = ref<TripResponse[]>([]);
  const historyTrips = ref<HistoryTrip[]>([]);
  const visitedPlaces = ref<VisitRecord[]>([]);
  const pendingVisitPlace = ref<Place | null>(null);
  const preferences = ref({
    natureCity: 0.5,
    healingParty: 0.5,
    traditionTrend: 0.5
  });

  const communityTrips = ref<CommunityTrip[]>([]);

  // API Methods
  const fetchCommunityTrips = async () => {
    try {
      const data = await historyApi.getCommunityTrips();
      communityTrips.value = data;
    } catch (e) {
      error.value = "커뮤니티 여정을 불러오는데 실패했습니다.";
    }
  };

  const importCommunityTrip = (trip: CommunityTrip) => {
    pendingTrip.value = {
      title: `${trip.title} (복사됨)`,
      summary: trip.summary,
      totalDuration: trip.totalDuration,
      plans: JSON.parse(JSON.stringify(trip.plans))
    };
    addToRecent(pendingTrip.value);
  };

  const shareTripToCommunity = async (trip: HistoryTrip) => {
    isProcessing.value = true;
    try {
      const success = await historyApi.shareTrip(trip);
      if (success) console.log('Successfully shared trip');
    } catch (e) {
      error.value = "여정 공유에 실패했습니다.";
    } finally {
      isProcessing.value = false;
    }
  };

  // Logic Methods
  const filterPlacesByDistrict = (district: any, places: Place[]): Place[] => {
    if (!district || !places) return [];
    return places.filter(place => {
      const dist = calculateDistance(district.lat, district.lng, place.mapY, place.mapX);
      return dist <= district.radius;
    });
  };

  const getTravelInfoBetweenItems = (trip: TripResponse | null, fromIdx: number, toIdx: number): TravelInfo | null => {
    if (!trip || !trip.plans[0]) return null;
    const items = trip.plans[0].items;
    const from = items[fromIdx];
    const to = items[toIdx];
    if (!from || !to) return null;
    const dist = calculateDistance(from.mapY, from.mapX, to.mapY, to.mapX);
    return estimateTravelInfo(dist);
  };

  const addToRecent = (trip: TripResponse) => {
    const exists = recentTrips.value.findIndex(t => t.title === trip.title);
    if (exists !== -1) recentTrips.value.splice(exists, 1);
    recentTrips.value.unshift({ ...trip });
    if (recentTrips.value.length > 5) recentTrips.value.pop();
  };

  const startPlanning = async (query: string) => {
    prompt.value = query;
    isProcessing.value = true;
    logs.value = [];
    currentTrip.value = null;
    pendingTrip.value = null;

    logs.value.push("사용자 취향 분석 중...");
    await new Promise(r => setTimeout(r, 800));
    logs.value.push(`취향 벡터 계산 완료 (${prompt.value})`);
    await new Promise(r => setTimeout(r, 600));
    logs.value.push("주변 데이터 및 저매출 구역 필터링 중...");
    await new Promise(r => setTimeout(r, 1000));
    
    logs.value.push("최종 여행 코스 구성 완료!");

    pendingTrip.value = {
      title: query.length > 10 ? `${query.substring(0, 10)}... 코스` : `${query} 코스`,
      summary: "시원한 바다 바람을 맞으며 해운대 해변을 걷고, 더베이 101의 화려한 야경을 즐기는 완벽한 부산 반나절 코스입니다.",
      totalDuration: "3:30",
      plans: [
        {
          day: 1,
          items: [
            {
              contentId: "ai_1",
              contentTypeId: "12",
              title: "해운대 해수욕장 & 블루라인파크",
              addr1: "부산광역시 해운대구 달맞이길62번길 13",
              mapX: 129.1762,
              mapY: 35.1592,
              firstImage: "https://images.unsplash.com/photo-1598124808304-40656a81f337?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "15:00",
                reason: "해변 열차를 타고 부산의 푸른 바다를 가장 가까이서 감상할 수 있습니다.",
                avgStay: "1시간"
              }
            },
            {
              contentId: "ai_2",
              contentTypeId: "12",
              title: "더베이 101",
              addr1: "부산광역시 해운대구 동백로 52",
              mapX: 129.1552,
              mapY: 35.1565,
              firstImage: "https://images.unsplash.com/photo-1541018939203-36eeab6d5721?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "16:30",
                reason: "마린시티의 화려한 스카이라인을 배경으로 인생샷을 남기기 좋습니다.",
                avgStay: "1시간"
              }
            },
            {
              contentId: "ai_3",
              contentTypeId: "39",
              title: "달맞이길 감성 카페",
              addr1: "부산광역시 해운대구 달맞이길",
              mapX: 129.1725,
              mapY: 35.1610,
              firstImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
              aiMetadata: {
                time: "18:00",
                reason: "사용자님의 취향에 맞는 조용하고 바다전망 카페입니다.",
                avgStay: "1시간"
              }
            }
          ]
        }
      ]
    };

    if (pendingTrip.value) addToRecent(pendingTrip.value);
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
      pendingTrip.value = null; // Clear pending trip once it becomes current
    }
  };

  const recordVisit = (visit: Omit<VisitRecord, 'timestamp' | 'tripId'>) => {
    if (!currentTrip.value) return;
    const newRecord: VisitRecord = {
      ...visit,
      tripId: currentTrip.value.id,
      timestamp: new Date().toISOString()
    };
    currentTrip.value.visits.push(newRecord);
    visitedPlaces.value.push(newRecord);
    const allPlaces = currentTrip.value.plans.flatMap(p => p.items);
    if (currentTrip.value.visits.length === allPlaces.length) {
      currentTrip.value.completedAt = new Date().toISOString();
      historyTrips.value.unshift({ ...currentTrip.value });
      currentTrip.value = null; // Clear active trip upon completion
      pendingTrip.value = null; // Ensure pending trip is also cleared
    }
  };

  const quickRecordVisit = (placeId: string) => {
    if (!currentTrip.value || isPlaceVisited(placeId)) return;
    recordVisit({
      placeId,
      rating: 5,
      emotion: '😊 좋아요',
      comment: '데모 방문 처리 완료!'
    });
  };

  const stopNavigation = () => {
    currentTrip.value = null;
    pendingTrip.value = null;
  };

  const isPlaceVisited = (placeId: string) => {
    return currentTrip.value?.visits.some(v => v.placeId === placeId) || false;
  };

  const removeItemFromPending = (index: number) => {
    if (pendingTrip.value && pendingTrip.value.plans.length > 0) {
      pendingTrip.value.plans[0].items.splice(index, 1);
    }
  };

  const reorderPendingTrip = (oldIndex: number, newIndex: number) => {
    if (pendingTrip.value && pendingTrip.value.plans.length > 0) {
      const items = pendingTrip.value.plans[0].items;
      if (oldIndex < 0 || oldIndex >= items.length || newIndex < 0 || newIndex >= items.length) return;
      const [movedItem] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, movedItem);
    }
  };

  const addPlaceToPending = (place: Place) => {
    if (!pendingTrip.value) {
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

  const reRecommend = async () => {
    if (prompt.value) await startPlanning(prompt.value);
  };

  const replaceItemWithAlternative = (index: number) => {
    if (!pendingTrip.value || !pendingTrip.value.plans[0]) return;
    const items = pendingTrip.value.plans[0].items;
    if (items[index]) {
      const alternatives = [
        { title: '근처 다른 카페', addr1: '부산광역시 해운대구 우동', mapX: 129.159, mapY: 35.158 },
        { title: '숨겨진 조망 명소', addr1: '부산광역시 해운대구 중동', mapX: 129.165, mapY: 35.162 }
      ];
      items[index] = {
        ...items[index],
        ...alternatives[Math.floor(Math.random() * alternatives.length)],
        contentId: `alt-${Date.now()}`
      };
    }
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
    pendingVisitPlace,
    preferences,
    fetchCommunityTrips,
    importCommunityTrip,
    shareTripToCommunity,
    filterPlacesByDistrict,
    getTravelInfoBetweenItems,
    addToRecent,
    startPlanning,
    confirmTrip,
    recordVisit,
    quickRecordVisit,
    stopNavigation,
    isPlaceVisited,
    removeItemFromPending,
    reorderPendingTrip,
    addPlaceToPending,
    resetPlanner,
    reRecommend,
    replaceItemWithAlternative
  };
});

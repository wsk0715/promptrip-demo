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
  const visitedPlaces = ref<VisitRecord[]>([]);
  const pendingVisitPlace = ref<Place | null>(null);
  const preferences = ref({
    natureCity: 0.5,
    healingParty: 0.5,
    traditionTrend: 0.5
  });

  const historyTrips = ref<HistoryTrip[]>([
    {
      id: 'hist_1',
      title: '🌸 부산 벚꽃 엔딩 투어',
      summary: '해운대 달맞이길부터 남천동 벚꽃터널까지, 부산의 봄을 온전히 만끽했던 하루입니다.',
      totalDuration: '5:30',
      completedAt: '2026-04-12T18:30:00Z',
      plans: [{ 
        day: 1, 
        items: [
          { contentId: 'p1', title: '해운대 달맞이길', addr1: '부산 해운대구 달맞이길', mapX: 129.1762, mapY: 35.1592, firstImage: 'https://images.unsplash.com/photo-1598124808304-40656a81f337?q=80&w=800' },
          { contentId: 'p2', title: '남천동 삼익비치 벚꽃길', addr1: '부산 수영구 남천동', mapX: 129.1124, mapY: 35.1435, firstImage: 'https://images.unsplash.com/photo-1541018939203-36eeab6d5721?q=80&w=800' }
        ] 
      }],
      visits: [
        { tripId: 'hist_1', placeId: 'p1', timestamp: '2026-04-12T14:00:00Z', rating: 5, emotion: '🌸 설렘', comment: '벚꽃이 정말 흐드러지게 피었어요. 내년에 또 오고 싶네요.' },
        { tripId: 'hist_1', placeId: 'p2', timestamp: '2026-04-12T16:30:00Z', rating: 4, emotion: '☕ 여유', comment: '꽃비가 내리는 길을 걷는 기분은 정말 환상적이었습니다.' }
      ]
    },
    {
      id: 'hist_2',
      title: '🌊 부산 바다 정복기',
      summary: '송정에서 시작해 광안리 야경으로 마무리한 완벽한 해안선 투어입니다.',
      totalDuration: '8:00',
      completedAt: '2026-05-01T21:00:00Z',
      plans: [{ 
        day: 1, 
        items: [
          { contentId: 'p3', title: '송정 해수욕장', addr1: '부산 해운대구 송정동', mapX: 129.1989, mapY: 35.1786, firstImage: 'https://images.unsplash.com/photo-1620050861803-34676100c598?q=80&w=800' },
          { contentId: 'p4', title: '광안리 해수욕장', addr1: '부산 수영구 광안동', mapX: 129.1189, mapY: 35.1532, firstImage: 'https://images.unsplash.com/photo-1598124808304-40656a81f337?q=80&w=800' }
        ] 
      }],
      visits: [
        { tripId: 'hist_2', placeId: 'p3', timestamp: '2026-05-01T11:00:00Z', rating: 5, emotion: '🏄 활기', comment: '송정 서핑은 언제나 옳아요! 파도가 정말 좋았습니다.' },
        { tripId: 'hist_2', placeId: 'p4', timestamp: '2026-05-01T19:00:00Z', rating: 5, emotion: '✨ 감동', comment: '광안대교 드론쇼는 정말 장관이었어요. 잊지 못할 밤입니다.' }
      ]
    }
  ]);

  const communityTrips = ref<CommunityTrip[]>([
    {
      id: 'comm_1',
      title: '📸 인스타 감성 부산 핫플',
      summary: '전포동 카페거리부터 영도 흰여울마을까지, 사진 찍기 좋은 곳만 모았습니다.',
      totalDuration: '6:45',
      authorName: 'TravelLog',
      authorImage: 'https://i.pravatar.cc/150?u=1',
      likes: 1240,
      tags: ['감성', '인생샷', '부산핫플'],
      plans: [
        {
          day: 1,
          items: [
            { contentId: 'c1', title: '흰여울문화마을', addr1: '부산 영도구 영선동', mapX: 129.0434, mapY: 35.0789, firstImage: 'https://images.unsplash.com/photo-1620050861803-34676100c598?q=80&w=800' },
            { contentId: 'c2', title: '전포 카페거리', addr1: '부산진구 전포동', mapX: 129.0632, mapY: 35.1555, firstImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800' }
          ]
        }
      ]
    },
    {
      id: 'comm_2',
      title: '🍜 로컬이 추천하는 부산 미식',
      summary: '관광객용 식당 말고, 진짜 부산 사람들이 줄 서서 먹는 맛집 투어입니다.',
      totalDuration: '4:20',
      authorName: 'BusanLocal',
      authorImage: 'https://i.pravatar.cc/150?u=2',
      likes: 856,
      tags: ['맛집', '로컬추천', '국밥'],
      plans: [
        {
          day: 1,
          items: [
            { contentId: 'c3', title: '해운대 소문난 암소갈비', addr1: '부산 해운대구 중동', mapX: 129.1642, mapY: 35.1612, firstImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800' },
            { contentId: 'c4', title: '본전돼지국밥', addr1: '부산 동구 초량동', mapX: 129.0394, mapY: 35.1147, firstImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800' }
          ]
        }
      ]
    }
  ]);

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

    const steps = [
      "사용자 취향 벡터 분석 중...",
      `"${query}" 기반 로컬 데이터 필터링...`,
      "저매출 구역 가중치 최적화 완료",
      "AI 에이전트 맞춤형 코스 구성 완료!"
    ];

    for (const step of steps) {
      logs.value.push(step);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
    }

    // Rich Pool of Places with VALID Coordinates
    const placePool = {
      healing: [
        { title: '해운대 블루라인파크', addr: '해운대구', img: 'https://images.unsplash.com/photo-1598124808304-40656a81f337', lat: 35.1592, lng: 129.1762, reason: '푸른 바다를 따라 달리는 낭만적인 해변 열차입니다.' },
        { title: '오륙도 스카이워크', addr: '남구', img: 'https://images.unsplash.com/photo-1620050861803-34676100c598', lat: 35.1018, lng: 129.1245, reason: '투명한 유리 바닥 아래로 펼쳐지는 아찔한 바다 비경입니다.' },
        { title: '이기대 수변공원', addr: '남구', img: 'https://images.unsplash.com/photo-1541018939203-36eeab6d5721', lat: 35.1242, lng: 129.1154, reason: '해안 절벽을 따라 걷는 부산 최고의 트레킹 코스입니다.' }
      ],
      foodie: [
        { title: '부평 깡통시장', addr: '중구', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', lat: 35.1022, lng: 129.0274, reason: '부산의 온갖 먹거리가 모여있는 활기찬 전통시장입니다.' },
        { title: '민락 수변공원', addr: '수영구', img: 'https://images.unsplash.com/photo-1541018939203-36eeab6d5721', lat: 35.1552, lng: 129.1352, reason: '광안대교 야경을 보며 신선한 회를 즐길 수 있는 로컬 성지입니다.' },
        { title: '전포 카페거리', addr: '부산진구', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', lat: 35.1555, lng: 129.0632, reason: '개성 넘치는 카페와 맛집들이 즐비한 부산의 핫플레이스입니다.' }
      ],
      night: [
        { title: '더베이 101', addr: '해운대구', img: 'https://images.unsplash.com/photo-1541018939203-36eeab6d5721', lat: 35.1565, lng: 129.1552, reason: '마린시티의 화려한 야경이 물결에 비치는 환상적인 장소입니다.' },
        { title: '황령산 봉수대', addr: '남구', img: 'https://images.unsplash.com/photo-1620050861803-34676100c598', lat: 35.1587, lng: 129.0825, reason: '부산의 동서남북 야경을 한눈에 담을 수 있는 최고의 조망점입니다.' },
        { title: '광안리 해수욕장', addr: '수영구', img: 'https://images.unsplash.com/photo-1598124808304-40656a81f337', lat: 35.1532, lng: 129.1189, reason: '화려한 광안대교 조명과 파도 소리가 어우러진 낭만적인 밤바다입니다.' }
      ]
    };

    // Randomized selection logic
    let selectedPool = [...placePool.healing, ...placePool.foodie, ...placePool.night];
    let titlePrefix = "부산 종합";
    
    if (query.includes('바다') || query.includes('산책') || query.includes('힐링')) {
      selectedPool = placePool.healing;
      titlePrefix = "🌊 바다 힐링";
    } else if (query.includes('먹거리') || query.includes('카페') || query.includes('맛집')) {
      selectedPool = placePool.foodie;
      titlePrefix = "🍜 부산 미식";
    } else if (query.includes('야경') || query.includes('밤')) {
      selectedPool = placePool.night;
      titlePrefix = "✨ 시티 나이트";
    }

    // Shuffle and pick 2-3 items
    const shuffled = selectedPool.sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, Math.min(shuffled.length, 3));

    const summaries = [
      "사용자님의 취향을 반영하여 구성한 부산의 매력을 가득 담은 코스입니다.",
      "번잡함을 피해 부산의 진면목을 발견할 수 있는 특별한 여정을 제안합니다.",
      "짧은 시간 동안 부산의 정취를 가장 효율적으로 느낄 수 있는 알찬 코스입니다."
    ];

    pendingTrip.value = {
      title: `${titlePrefix} 탐방 코스`,
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      totalDuration: `${Math.floor(Math.random() * 2) + 3}:${Math.floor(Math.random() * 6) * 10}`,
      plans: [
        {
          day: 1,
          items: selectedItems.map((item, idx) => ({
            contentId: `ai_${Math.random().toString(36).substr(2, 9)}`,
            contentTypeId: "12",
            title: item.title,
            addr1: `부산광역시 ${item.addr}`,
            mapX: item.lng, 
            mapY: item.lat, 
            firstImage: `${item.img}?auto=format&fit=crop&q=80&w=800`,
            aiMetadata: {
              time: `${14 + (idx * 2)}:00`,
              reason: item.reason,
              avgStay: "1시간 30분"
            }
          }))
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
      pendingTrip.value = null; 
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
      currentTrip.value = null; 
      pendingTrip.value = null; 
    }
  };

  const quickRecordVisit = (placeId: string) => {
    if (!currentTrip.value || isPlaceVisited(placeId)) return;
    const emotions = ['😊 만족', '✨ 감동', '🌊 시원함', '🔥 활기', '😋 맛있음'];
    recordVisit({
      placeId,
      rating: 4 + Math.floor(Math.random() * 2),
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      comment: '오늘의 부산 여행 중 가장 기억에 남는 순간이네요!'
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

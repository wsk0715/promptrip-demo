import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TripResponse } from '../types/trip';

export const useTripStore = defineStore('trip', () => {
  const currentTrip = ref<TripResponse | null>(null);
  const logs = ref<string[]>([]);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const prompt = ref('');

  const startPlanning = async (query: string) => {
    prompt.value = query;
    isProcessing.value = true;
    logs.value = [];
    currentTrip.value = null;

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

    currentTrip.value = {
      title: "덕수궁-을지로 힐링 산책 코스",
      summary: "인파를 피해 여유로운 돌담길을 걷고, 을지로의 빈티지한 감성을 즐기는 완벽한 반나절 코스입니다.",
      totalDuration: "약 4시간",
      plans: [
        {
          day: 1,
          items: [
            {
              location: "덕수궁 돌담길",
              lat: 37.5658,
              lng: 126.9751,
              time: "14:00",
              description: "고즈넉한 돌담길을 따라 걷는 여유로운 산책",
              reason: "현재 혼잡도가 매우 낮아 조용한 힐링에 최적입니다.",
              avgStay: "40분",
              travelTimeNext: "도보 10분"
            },
            {
              location: "명동 로컬 맛집",
              lat: 37.5635,
              lng: 126.9842,
              time: "15:00",
              description: "숨겨진 로컬 맛집에서의 늦은 점심",
              reason: "유명 관광 식당보다 평점이 높고 대기가 적은 현지인 추천 장소입니다.",
              avgStay: "1시간",
              travelTimeNext: "도보 15분"
            },
            {
              location: "을지로 빈티지 카페",
              lat: 37.5661,
              lng: 126.9910,
              time: "16:30",
              description: "빈티지한 인테리어와 핸드드립 커피",
              reason: "사용자님의 커피 취향에 맞는 조용한 다락방 스타일의 카페입니다.",
              avgStay: "1시간 30분"
            }
          ]
        }
      ]
    };

    isProcessing.value = false;
  };

  const resetPlanner = () => {
    currentTrip.value = null;
    logs.value = [];
    isProcessing.value = false;
    error.value = null;
    prompt.value = '';
  };

  return {
    currentTrip,
    logs,
    isProcessing,
    error,
    prompt,
    startPlanning,
    resetPlanner
  };
});

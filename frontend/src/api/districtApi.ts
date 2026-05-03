import type { ApiResult } from '../types/trip';
import type { District } from '../types/district';

/**
 * 추천 구역(Glow) 목록 조회
 * 색상별 의미: 노란빛(#FFD700)-방문권장, 파란빛(#4F46E5)-조용함, 보라빛(#8A2BE2)-문화/전시
 */
export const getRecommendedDistricts = async (): Promise<ApiResult<District[]>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockDistricts: District[] = [
    {
      id: "mock-1",
      name: "명동 로컬 감성 골목",
      lat: 37.5635,
      lng: 126.9842,
      radius: 250,
      color: "#FFD700", // 노란빛 (방문 권장)
      intensity: 9,
      description: "최근 방문은 적지만 감성 카페와 로컬 맛집이 숨어 있는 구역입니다.",
      status: "RECOMMENDED",
      keywords: ["카페", "야경", "로컬맛집"],
      // 추가 상세 데이터 (MVP용)
      reason: "사용자님의 평소 선호하는 카페 스타일과 일치하며, 주변 혜택 매장이 5곳 존재합니다.",
      avgTime: "약 1시간 30분",
      congestion: "보통"
    },
    {
      id: "mock-2",
      name: "덕수궁 돌담길 숲",
      lat: 37.5658,
      lng: 126.9751,
      radius: 300,
      color: "#4F46E5", // 파란빛 (조용한 힐링)
      intensity: 6,
      description: "인파를 피해 고즈넉한 돌담길을 따라 조용히 산책할 수 있는 힐링 지역입니다.",
      status: "QUIET",
      keywords: ["자연", "힐링", "산책"],
      reason: "혼잡도가 매우 낮아 여유로운 여행을 원하시는 오늘 조건에 최적입니다.",
      avgTime: "약 40분",
      congestion: "여유"
    },
    {
      id: "mock-3",
      name: "을지로 빈티지 아카이브",
      lat: 37.5661,
      lng: 126.9910,
      radius: 350,
      color: "#8A2BE2", // 보라빛 (문화/전시)
      intensity: 8,
      description: "오래된 골목 사이 예술가들의 전시 공간이 가득한 문화 중심 지구입니다.",
      status: "CULTURE",
      keywords: ["빈티지", "전시", "힙지로"],
      reason: "현재 진행 중인 '로컬 팝업 전시'가 3곳 있어 볼거리가 풍부합니다.",
      avgTime: "약 2시간",
      congestion: "약간 혼잡"
    }
  ];

  return {
    success: true,
    timestamp: new Date().toISOString(),
    traceId: "mock-seoul-trace",
    data: mockDistricts
  };
};

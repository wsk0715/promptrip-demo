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
      name: "해운대 마린시티 로컬",
      lat: 35.1545,
      lng: 129.1435,
      radius: 500,
      color: "#FFD700", // 노란빛 (방문 권장)
      intensity: 9,
      description: "화려한 고층 빌딩 숲 사이 숨겨진 감성 바다 산책로와 테라스 카페가 가득합니다.",
      status: "RECOMMENDED",
      keywords: ["야경", "바다산책", "인생샷"],
      reason: "현재 사용자님의 취향과 일치하는 오션뷰 카페의 혼잡도가 낮아 방문을 추천합니다.",
      avgTime: "약 1시간 30분",
      congestion: "보통"
    },
    {
      id: "mock-2",
      name: "광안리 민락 수변공원",
      lat: 35.1542,
      lng: 129.1303,
      radius: 300,
      color: "#4F46E5", // 파란빛 (조용한 힐링)
      intensity: 6,
      description: "인파를 피해 광안대교를 가장 가까이서 조용히 감상할 수 있는 힐링 명소입니다.",
      status: "QUIET",
      keywords: ["광안대교", "힐링", "바람"],
      reason: "지금 시간대에 가장 한적하여 바다 소리를 들으며 조용히 생각에 잠기기 좋습니다.",
      avgTime: "약 40분",
      congestion: "여유"
    },
    {
      id: "mock-3",
      name: "감천문화마을 아카이브",
      lat: 35.0975,
      lng: 129.0105,
      radius: 350,
      color: "#8A2BE2", // 보라빛 (문화/전시)
      intensity: 8,
      description: "골목 사이 예술가들의 벽화와 소품샵이 가득한 살아있는 문화 박물관입니다.",
      status: "CULTURE",
      keywords: ["벽화마을", "예술", "역사"],
      reason: "현재 로컬 작가들의 '골목 전시회'가 열리고 있어 볼거리가 매우 풍부합니다.",
      avgTime: "약 2시간",
      congestion: "약간 혼잡"
    }
  ];

  return {
    success: true,
    timestamp: new Date().toISOString(),
    traceId: "mock-busan-trace",
    data: mockDistricts
  };
};

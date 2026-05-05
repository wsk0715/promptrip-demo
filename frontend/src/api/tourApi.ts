import type { ApiResult } from '../types/trip';

export interface Place {
  contentId: string;
  title: string;
  addr1: string;
  addr2?: string;
  firstImage?: string;
  firstImage2?: string;
  mapX: number;
  mapY: number;
  tel?: string;
  contentTypeId: string;
  dist?: number; // Distance in meters
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
}

/**
 * 주변 장소 조회 API 모킹
 * 부산 지역의 실제 관광지/맛집 데이터를 반환합니다.
 */
export const getNearbyPlaces = async (_lat: number, _lng: number, _radius: number = 3000): Promise<ApiResult<Place[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const mockPlaces: Place[] = [
    {
      contentId: "p1",
      title: "해운대 해수욕장",
      addr1: "부산광역시 해운대구 우동",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1598124808304-40656a81f337?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 129.1604,
      mapY: 35.1587,
      tel: "051-749-5700",
      contentTypeId: "12",
      dist: 150,
      rating: 4.8,
      reviewCount: 15400,
      isOpen: true
    },
    {
      contentId: "p2",
      title: "광안리 해수욕장",
      addr1: "부산광역시 수영구 광안해변로 219",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1590303648538-dc1604a1b025?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 129.1189,
      mapY: 35.1531,
      tel: "051-622-4251",
      contentTypeId: "12",
      dist: 850,
      rating: 4.9,
      reviewCount: 12800,
      isOpen: true
    },
    {
      contentId: "p3",
      title: "더베이 101",
      addr1: "부산광역시 해운대구 동백로 52",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1541018939203-36eeab6d5721?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 129.1552,
      mapY: 35.1565,
      tel: "051-726-8801",
      contentTypeId: "39",
      dist: 400,
      rating: 4.5,
      reviewCount: 3500,
      isOpen: true
    },
    {
      contentId: "p4",
      title: "자갈치 시장",
      addr1: "부산광역시 중구 자갈치해안로 52",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1571167530330-8442436402ec?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 129.0306,
      mapY: 35.0968,
      tel: "051-245-2594",
      contentTypeId: "12",
      dist: 3500,
      rating: 4.3,
      reviewCount: 8900,
      isOpen: true
    },
    {
      contentId: "p5",
      title: "부산시립미술관",
      addr1: "부산광역시 해운대구 APEC로 58",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 129.1356,
      mapY: 35.1661,
      tel: "051-744-2602",
      contentTypeId: "14",
      dist: 1200,
      rating: 4.6,
      reviewCount: 1100,
      isOpen: true
    }
  ];

  return {
    success: true,
    timestamp: new Date().toISOString(),
    traceId: "mock-places-trace",
    data: mockPlaces
  };
};

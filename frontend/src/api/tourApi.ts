import type { ApiResult } from '../types/trip';

export interface Place {
  contentId: string;
  title: string;
  addr1: string;
  addr2: string;
  firstImage: string;
  firstImage2: string;
  mapX: number;
  mapY: number;
  tel: string;
  contentTypeId: string;
  dist?: number; // Distance in meters
}

/**
 * 주변 장소 조회 API 모킹
 * 서울시청 주변의 실제 관광지/맛집 데이터를 반환합니다.
 */
export const getNearbyPlaces = async (lat: number, lng: number, radius: number = 3000): Promise<ApiResult<Place[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const mockPlaces: Place[] = [
    {
      contentId: "p1",
      title: "덕수궁",
      addr1: "서울특별시 중구 세종대로 99",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1624233790933-7d84f8806297?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 126.9751,
      mapY: 37.5658,
      tel: "02-771-9951",
      contentTypeId: "12",
      dist: 150
    },
    {
      contentId: "p2",
      title: "명동성당",
      addr1: "서울특별시 중구 명동길 74",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 126.9873,
      mapY: 37.5632,
      tel: "02-774-1784",
      contentTypeId: "12",
      dist: 850
    },
    {
      contentId: "p3",
      title: "커피한약방 (을지로)",
      addr1: "서울특별시 중구 삼일대로12길 16-6",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 126.9912,
      mapY: 37.5662,
      tel: "02-773-9363",
      contentTypeId: "39",
      dist: 1100
    },
    {
      contentId: "p4",
      title: "남대문시장",
      addr1: "서울특별시 중구 남대문시장4길 21",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 126.9772,
      mapY: 37.5592,
      tel: "02-753-2805",
      contentTypeId: "12",
      dist: 900
    },
    {
      contentId: "p5",
      title: "서울시립미술관",
      addr1: "서울특별시 중구 덕수궁길 61",
      addr2: "",
      firstImage: "https://images.unsplash.com/photo-1518998053574-53ee81eb8a91?auto=format&fit=crop&w=400&q=80",
      firstImage2: "",
      mapX: 126.9739,
      mapY: 37.5641,
      tel: "02-2124-8800",
      contentTypeId: "14",
      dist: 450
    }
  ];

  return {
    success: true,
    timestamp: new Date().toISOString(),
    traceId: "mock-places-trace",
    data: mockPlaces
  };
};

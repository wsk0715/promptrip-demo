import type { HistoryTrip, CommunityTrip } from '../services/tripService';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API layer for History & Community related tasks.
 * Currently uses mocked data but structured for real API integration.
 */
export const historyApi = {
  /**
   * Fetch user's own travel history
   */
  async getMyHistory(): Promise<HistoryTrip[]> {
    await delay(500);
    return JSON.parse(localStorage.getItem('my_history') || '[]');
  },

  /**
   * Fetch shared trips from the community
   */
  async getCommunityTrips(): Promise<CommunityTrip[]> {
    await delay(600);
    return [
      {
        id: 'c1',
        authorName: '서울방랑자',
        authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        title: '익선동의 밤은 당신의 낮보다 아름답다',
        summary: '익선동 한옥마을과 창덕궁을 잇는 고즈넉한 서울의 밤 산책 코스입니다.',
        totalDuration: '3시간',
        likes: 128,
        tags: ['야경', '익선동', '고궁'],
        visits: [
          { title: '익선동 한옥마을', emotion: 'happy' },
          { title: '창덕궁 달빛기행', emotion: 'peaceful' },
        ],
        plans: [
          {
            day: 1,
            items: [
              { 
                contentId: 'm1', 
                title: '익선동 한옥마을', 
                contentTypeId: '12', 
                addr1: '서울특별시 종로구 익선동',
                mapX: 126.989,
                mapY: 37.574,
                firstImage: 'https://images.unsplash.com/photo-1590615365490-13ad83832742?w=500' 
              },
              { 
                contentId: 'm2', 
                title: '창덕궁', 
                contentTypeId: '12', 
                addr1: '서울특별시 종로구 율곡로 99',
                mapX: 126.991,
                mapY: 37.579,
                firstImage: 'https://images.unsplash.com/photo-1578330132822-01966e395e5b?w=500' 
              }
            ]
          }
        ]
      },
      {
        id: 'c2',
        authorName: '카페사냥꾼',
        authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        title: '성수동 팝업스토어 도장깨기 코스',
        summary: '트렌디한 팝업스토어와 감성 카페가 가득한 성수동 연무장길 정복 코스입니다.',
        totalDuration: '4시간',
        likes: 256,
        tags: ['성수동', '팝업스토어', '카페'],
        visits: [
          { title: '성수동 연무장길', emotion: 'happy' },
          { title: '블루보틀 성수', emotion: 'peaceful' },
        ],
        plans: [
          {
            day: 1,
            items: [
              { 
                contentId: 'm3', 
                title: '성수동 팝업스토어', 
                contentTypeId: '38', 
                addr1: '서울특별시 성동구 연무장길',
                mapX: 127.054,
                mapY: 37.544,
                firstImage: 'https://images.unsplash.com/photo-1534960121710-c24737af13a5?w=500' 
              },
              { 
                contentId: 'm4', 
                title: '블루보틀 성수', 
                contentTypeId: '39', 
                addr1: '서울특별시 성동구 아차산로 7',
                mapX: 127.044,
                mapY: 37.548,
                firstImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500' 
              }
            ]
          }
        ]
      }
    ];
  },

  /**
   * Share a trip to the community
   */
  async shareTrip(trip: HistoryTrip): Promise<boolean> {
    await delay(800);
    console.log('Sharing trip to community:', trip);
    return true;
  }
};

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
        authorName: '부산갈매기',
        authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        title: '해운대 달맞이길 감성 투어',
        summary: '바다 전망이 보이는 카페와 조용한 산책로를 잇는 해운대만의 고즈넉한 코스입니다.',
        totalDuration: '3시간',
        likes: 124,
        tags: ['바다뷰', '카페투어', '힐링'],
        visits: [],
        plans: [
          {
            day: 1,
            items: [
              {
                contentId: 'h1',
                title: '달맞이길 산책로',
                addr1: '부산광역시 해운대구 달맞이길',
                mapX: 129.1725,
                mapY: 35.161,
                firstImage: ''
              },
              {
                contentId: 'h2',
                title: '광안리 해변바다',
                addr1: '부산광역시 수영구 광안해변로',
                mapX: 129.1189,
                mapY: 35.1531,
                firstImage: ''
              }
            ]
          }
        ]
      },
      {
        id: 'c2',
        authorName: '마린시티즌',
        authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        title: '마린시티 화려한 야경 코스',
        summary: '부산의 스카이라인을 가장 화려하게 즐길 수 있는 야경 중심 코스입니다.',
        totalDuration: '2시간 30분',
        likes: 89,
        tags: ['야경', '데이트', '인생샷'],
        visits: [],
        plans: [
          {
            day: 1,
            items: [
              {
                contentId: 'h3',
                title: '더베이 101',
                addr1: '부산광역시 해운대구 동백로 52',
                mapX: 129.1552,
                mapY: 35.1565,
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

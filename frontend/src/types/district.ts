export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  intensity: number;
  description: string;
  status: string;
  keywords: string[];
  // Extended fields for MVP
  reason?: string;
  avgStay?: string;
  avgTime?: string;
  congestion?: string;
}

/**
 * GeoUtils
 * Pure functions for geographic calculations
 */

/**
 * Calculates the Haversine distance between two points in meters
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Estimates travel info (type, distance text, time text)
 */
export interface TravelInfo {
  type: 'walk' | 'car';
  dist: string;
  time: string;
}

export const estimateTravelInfo = (distance: number): TravelInfo => {
  if (distance < 1000) {
    const walkingTime = Math.round(distance / 60); // Roughly 1m/s
    return { 
      type: 'walk', 
      dist: `${Math.round(distance)}m`, 
      time: `${walkingTime > 0 ? walkingTime : 1}분` 
    };
  } else {
    const drivingTime = Math.round((distance / 1000) * 4) + 2; // Roughly 15km/h avg in city + base time
    return { 
      type: 'car', 
      dist: `${(distance / 1000).toFixed(1)}km`, 
      time: `${drivingTime}분` 
    };
  }
};

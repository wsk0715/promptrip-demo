/**
 * FormatUtils
 * Pure functions for data formatting and mapping
 */

/**
 * Formats ISO date string to Korean locale string
 */
export const formatDate = (iso: string): string => {
  if (!iso) return '진행 중';
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Maps emotion keys to emojis
 */
export const getEmotionIcon = (emotionId: string) => {
  const icons: Record<string, string> = {
    joy: '😊',
    peace: '☁️',
    healing: '🌿',
    inspiration: '✨',
    excitement: '🔥'
  };
  return icons[emotionId] || '📍';
};

export const getEmotionColor = (emotionId: string) => {
  const colors: Record<string, string> = {
    joy: '#FBBF24',        // Amber/Gold
    peace: '#3B82F6',      // Blue
    healing: '#10B981',    // Emerald
    inspiration: '#8B5CF6', // Violet
    excitement: '#F59E0B'   // Orange/Star
  };
  return colors[emotionId] || '#6366F1';
};

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, length: number): string => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

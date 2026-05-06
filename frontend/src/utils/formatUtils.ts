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
export const getEmotionIcon = (emotion: string): string => {
  const icons: Record<string, string> = {
    happy: '😊',
    peaceful: '🧘',
    excited: '🤩',
    melancholy: '🌧️'
  };
  return icons[emotion] || '✨';
};

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, length: number): string => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Formats a number with K/M/B suffixes for large values
 * @param value The number to format
 * @returns Formatted string with appropriate suffix
 */
export function formatNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toString();
} 
export function formatNumber(value: number, fractionDigits = 1): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(fractionDigits)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(fractionDigits)}K`;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}


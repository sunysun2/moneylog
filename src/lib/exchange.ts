export const USD_TO_KRW_RATE = 1350;

export function usdToKrw(usd: number): number {
  return Math.round(usd * USD_TO_KRW_RATE);
}

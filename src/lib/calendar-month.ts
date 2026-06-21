/** 접속 시점 기준 달력상 "당월" 범위 계산 (Asia/Seoul) */

import {
  formatSeoulCalendarMonthLabel,
  formatSeoulMonthKey,
  getSeoulCalendarMonthRange,
  getSeoulCalendarThreeMonthRange,
  getSeoulDateParts,
  getSeoulReferenceDateIso,
  parseSeoulReferenceDate,
  seoulPartsToDate,
} from "@/lib/seoul-time";

export function getReferenceDateIso(referenceDate: Date = new Date()): string {
  return getSeoulReferenceDateIso(referenceDate);
}

export function parseReferenceDate(value?: string | null): Date | null {
  if (!value) return null;

  const parts = parseSeoulReferenceDate(value);
  if (!parts) return null;

  return seoulPartsToDate(parts);
}

export function formatMonthKey(referenceDate: Date): string {
  return formatSeoulMonthKey(referenceDate);
}

/** referenceDate가 속한 달의 1일 00:00 KST ~ 다음 달 1일 00:00 KST (미포함) */
export function getCalendarMonthRange(referenceDate: Date) {
  const parts = getSeoulDateParts(referenceDate);
  return getSeoulCalendarMonthRange(parts.year, parts.month);
}

/** referenceDate가 속한 달을 마지막 달로 하는 최근 3개 달 */
export function getCalendarThreeMonthRange(referenceDate: Date) {
  const parts = getSeoulDateParts(referenceDate);
  return getSeoulCalendarThreeMonthRange(parts);
}

export function formatCalendarMonthLabel(referenceDate: Date): string {
  return formatSeoulCalendarMonthLabel(getSeoulDateParts(referenceDate));
}

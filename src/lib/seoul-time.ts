export const SEOUL_TIME_ZONE = "Asia/Seoul";

export interface SeoulDateParts {
  year: number;
  month: number;
  day: number;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getSeoulDateParts(date: Date = new Date()): SeoulDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

export function getSeoulReferenceDateIso(date: Date = new Date()): string {
  const { year, month, day } = getSeoulDateParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function formatSeoulMonthKey(date: Date = new Date()): string {
  const { year, month } = getSeoulDateParts(date);
  return `${year}-${pad(month)}`;
}

export function parseSeoulReferenceDate(value: string): SeoulDateParts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1) return null;

  const lastDay = getSeoulLastDayOfMonth(year, month);
  if (day > lastDay) return null;

  return { year, month, day };
}

export function seoulPartsToDate(parts: SeoulDateParts): Date {
  return new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T12:00:00+09:00`);
}

export function getSeoulLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getSeoulEffectiveSendDay(
  dayOfMonth: number,
  year: number,
  month: number
): number {
  return Math.min(dayOfMonth, getSeoulLastDayOfMonth(year, month));
}

/** 설정일(또는 말일 보정일) 이후이면 발송 시도 가능 — 실패 시 다음 날 재시도 */
export function shouldAttemptSeoulMonthlySend(
  dayOfMonth: number,
  parts: SeoulDateParts = getSeoulDateParts()
): boolean {
  const effectiveDay = getSeoulEffectiveSendDay(dayOfMonth, parts.year, parts.month);
  return parts.day >= effectiveDay;
}

export function getSeoulCalendarMonthRange(year: number, month: number) {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    start: new Date(`${year}-${pad(month)}-01T00:00:00+09:00`),
    end: new Date(`${nextYear}-${pad(nextMonth)}-01T00:00:00+09:00`),
  };
}

export function getSeoulCalendarThreeMonthRange(parts: SeoulDateParts) {
  const end = getSeoulCalendarMonthRange(parts.year, parts.month).end;

  let startYear = parts.year;
  let startMonth = parts.month - 2;
  while (startMonth < 1) {
    startMonth += 12;
    startYear -= 1;
  }

  return {
    start: getSeoulCalendarMonthRange(startYear, startMonth).start,
    end,
  };
}

export function formatSeoulCalendarMonthLabel(parts: SeoulDateParts): string {
  return `${parts.year}년 ${parts.month}월`;
}

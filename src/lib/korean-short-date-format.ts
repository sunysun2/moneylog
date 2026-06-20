const MAX_MONTH = 12;
const MAX_DAY = 31;

/** 입력 중 월(≤12), 일(≤31) 범위를 벗어나는 숫자는 받지 않습니다. */
function sanitizeKoreanShortDateDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.length > 6) {
    digits = digits.slice(0, 6);
  }

  if (digits.length >= 3) {
    const monthFirst = digits[2];
    if (monthFirst > "1") {
      digits = digits.slice(0, 2);
    }
  }

  if (digits.length >= 4) {
    const month = Number(digits.slice(2, 4));
    if (month === 0 || month > MAX_MONTH) {
      digits = digits.slice(0, 3);
    }
  }

  if (digits.length >= 5) {
    const dayFirst = digits[4];
    if (dayFirst > "3") {
      digits = digits.slice(0, 4);
    }
  }

  if (digits.length >= 6) {
    const day = Number(digits.slice(4, 6));
    if (day === 0 || day > MAX_DAY) {
      digits = digits.slice(0, 5);
    }
  }

  return digits;
}

/** 입력값을 `YY년. MM월. DD일` 형식으로 포맷합니다. (연·월·일 각 2자리) */
export function formatKoreanShortDateInput(value: string): string {
  const digits = sanitizeKoreanShortDateDigits(value);
  if (!digits) return "";

  const year = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const day = digits.slice(4, 6);

  if (digits.length <= 2) {
    return `${year}년.`;
  }
  if (digits.length <= 4) {
    return `${year}년. ${month}월.`;
  }
  return `${year}년. ${month}월. ${day}일`;
}

/** ISO 날짜(YYYY-MM-DD)를 `YY년. MM월. DD일` 형식으로 변환합니다. */
export function isoToKoreanShortDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";

  const [, yyyy, mm, dd] = match;
  return `${yyyy.slice(-2)}년. ${mm}월. ${dd}일`;
}

/** `YY년. MM월. DD일` 형식을 ISO(YYYY-MM-DD)로 변환합니다. */
export function koreanShortDateToIso(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 6) return undefined;

  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));

  if (mm < 1 || mm > MAX_MONTH || dd < 1 || dd > MAX_DAY) return undefined;

  const yyyy = 2000 + yy;
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== yyyy ||
    date.getMonth() + 1 !== mm ||
    date.getDate() !== dd
  ) {
    return undefined;
  }

  return iso;
}

const MOBILE_PREFIX = "010";
const MOBILE_SUFFIX_LENGTH = 8;
const PADDED_INCOMPLETE_SUFFIX = "00000000";

/** 010 뒤에 입력된 숫자 개수 */
export function getKoreanPhoneSuffixLength(value: string): number {
  let digits = value.replace(/\D/g, "");
  if (!digits) return 0;

  if (digits.startsWith(MOBILE_PREFIX)) {
    digits = digits.slice(MOBILE_PREFIX.length);
  }

  return digits.length;
}

/** 010 뒤 1~6자리 미완성 번호 */
export function isIncompleteKoreanPhone(value: string): boolean {
  const suffixLength = getKoreanPhoneSuffixLength(value);
  return suffixLength >= 1 && suffixLength <= 6;
}

/** 010 뒤 0자리(공란·010만 입력) */
export function isBlankKoreanPhone(value: string): boolean {
  return getKoreanPhoneSuffixLength(value) === 0;
}

/** 010 고정 + 뒤 7~8자리 입력 (7자리: 010-XXX-XXXX, 8자리: 010-XXXX-XXXX) */
export function formatKoreanPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith(MOBILE_PREFIX)) {
    digits = digits.slice(MOBILE_PREFIX.length);
  }

  digits = digits.slice(0, MOBILE_SUFFIX_LENGTH);
  if (!digits) return "";

  if (digits.length <= 3) {
    return `${MOBILE_PREFIX}-${digits}`;
  }

  if (digits.length <= 7) {
    return `${MOBILE_PREFIX}-${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${MOBILE_PREFIX}-${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
}

function paddedKoreanPhoneForSave(): string {
  return formatKoreanPhone(`${MOBILE_PREFIX}${PADDED_INCOMPLETE_SUFFIX}`);
}

function normalizeCompleteKoreanPhone(value: string): string | undefined {
  const suffixLength = getKoreanPhoneSuffixLength(value);
  if (suffixLength === 7 || suffixLength === 8) {
    return formatKoreanPhone(value);
  }

  return undefined;
}

/** 저장용: 0~6자리(공란 포함) → 010-0000-0000, 7~8자리는 그대로 */
export function normalizeKoreanPhoneForSave(value: string): string | undefined {
  const suffixLength = getKoreanPhoneSuffixLength(value);

  if (suffixLength <= 6) {
    return paddedKoreanPhoneForSave();
  }

  return normalizeCompleteKoreanPhone(value);
}

/** 저장 버튼: 0~6자리(공란 포함) → 010-0000-0000 */
export function finalizeKoreanPhoneOnSave(value: string): string {
  return normalizeKoreanPhoneForSave(value) ?? paddedKoreanPhoneForSave();
}

/** 포커스 아웃: 미완성 번호는 공란, 완성 번호만 유지 */
export function finalizeKoreanPhoneInput(value: string): string {
  if (isIncompleteKoreanPhone(value) || isBlankKoreanPhone(value)) return "";
  return normalizeCompleteKoreanPhone(value) ?? "";
}

export function stripPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** 검색어·저장 번호 모두 하이픈 등 비숫자를 제거한 뒤 부분 일치 비교 */
export function matchesPhoneNumberSearch(phone: string, query: string): boolean {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  const queryDigits = stripPhoneDigits(trimmedQuery);
  if (queryDigits) {
    return stripPhoneDigits(phone).includes(queryDigits);
  }

  return phone.toLowerCase().includes(trimmedQuery.toLowerCase());
}

/** @deprecated finalizeKoreanPhoneOnSave 또는 finalizeKoreanPhoneInput 사용 */
export function resolvePhoneFormField(value: string): string {
  return finalizeKoreanPhoneOnSave(value);
}

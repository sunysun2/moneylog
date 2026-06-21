import {
  LOGIN_ID_PATTERN,
  NICKNAME_MAX,
  NICKNAME_MIN,
} from "@/lib/auth-constants";

export function normalizeLoginId(value: string): string {
  return value.trim().toLowerCase();
}

export function validateLoginId(value: string): string | null {
  const loginId = normalizeLoginId(value);
  if (!LOGIN_ID_PATTERN.test(loginId)) {
    return "아이디는 영문, 숫자, 밑줄(_)만 3~20자로 입력해 주세요.";
  }
  return null;
}

export function validateNickname(value: string): string | null {
  const nickname = value.trim();
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return `디하클 닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요.`;
  }
  return null;
}

export function validatePasswordPair(
  password: string,
  confirm: string
): string | null {
  if (password.length < 8) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }
  if (password !== confirm) {
    return "비밀번호가 일치하지 않습니다.";
  }
  return null;
}

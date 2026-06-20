/** 유튜브 핸들 입력 시 맨 앞에 @를 자동으로 붙입니다. */
export function formatYoutubeHandle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutAt = trimmed.replace(/^@+/, "");
  if (!withoutAt) return "@";
  return `@${withoutAt}`;
}

export function verifyCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${expected}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === expected;
}

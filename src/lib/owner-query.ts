import { Types } from "mongoose";

export interface OwnerContext {
  ownerId: string;
  isAdmin: boolean;
}

export function toOwnerObjectId(ownerId: string): Types.ObjectId {
  return new Types.ObjectId(ownerId);
}

/** 회원은 본인 데이터만, 관리자는 본인 + ownerId 없는 기존 데이터 포함 */
export function ownerFilter(ownerId: string, isAdmin: boolean) {
  const own = { ownerId: toOwnerObjectId(ownerId) };
  if (!isAdmin) return own;

  return {
    $or: [own, { ownerId: { $exists: false } }],
  };
}

export function mergeOwnerFilter(
  query: Record<string, unknown>,
  ownerId: string,
  isAdmin: boolean
): Record<string, unknown> {
  const owner = ownerFilter(ownerId, isAdmin);
  if ("$or" in owner) {
    return Object.keys(query).length === 0 ? owner : { $and: [query, owner] };
  }
  return { ...query, ...owner };
}

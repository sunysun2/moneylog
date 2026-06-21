"use client";

import { FreelancerRow } from "./FreelancerRow";
import type { FreelancerData } from "./types";

interface FreelancerTableProps {
  freelancers: FreelancerData[];
  activeId: string | null;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FreelancerTable({
  freelancers,
  activeId,
  onEdit,
  onView,
  onDelete,
}: FreelancerTableProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-body-sm">
          <thead>
            <tr className="border-b border-border-subtle text-label-caps text-on-surface-variant">
              <th className="px-3 py-3 font-semibold">이름</th>
              <th className="px-3 py-3 font-semibold">전화번호</th>
              <th className="px-3 py-3 font-semibold">카톡 ID</th>
              <th className="px-3 py-3 font-semibold">은행</th>
              <th className="px-3 py-3 font-semibold">계좌번호</th>
              <th className="px-3 py-3 font-semibold">채널</th>
              <th className="px-3 py-3 text-right font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {freelancers.map((freelancer) => (
              <FreelancerRow
                key={freelancer.id}
                freelancer={freelancer}
                isActive={activeId === freelancer.id}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {freelancers.length === 0 && (
        <div className="px-6 py-12 text-center text-body-sm text-on-surface-variant">
          등록된 프리랜서가 없습니다. 상단에서 프리랜서를 등록해 주세요.
        </div>
      )}
    </div>
  );
}

"use client";

import { RowActionButton, RowActionGroup, SensitiveData } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FreelancerData } from "./types";

interface FreelancerRowProps {
  freelancer: FreelancerData;
  isActive: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FreelancerRow({
  freelancer,
  isActive,
  onEdit,
  onView,
  onDelete,
}: FreelancerRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border-subtle/60 transition",
        isActive && "bg-primary/5"
      )}
    >
      <td className="px-3 py-3 font-medium text-text-primary">{freelancer.name}</td>
      <td className="px-3 py-3">
        <SensitiveData>{freelancer.phone || "—"}</SensitiveData>
      </td>
      <td className="px-3 py-3 text-on-surface-variant">{freelancer.kakaoId || "—"}</td>
      <td className="px-3 py-3 text-on-surface-variant">{freelancer.bank || "—"}</td>
      <td className="px-3 py-3">
        <SensitiveData>{freelancer.accountNumber || "—"}</SensitiveData>
      </td>
      <td className="px-3 py-3 text-on-surface-variant">{freelancer.channel || "—"}</td>
      <td className="px-3 py-3">
        <RowActionGroup>
          <RowActionButton variant="view" onClick={() => onView(freelancer.id)}>
            보기
          </RowActionButton>
          <RowActionButton variant="edit" onClick={() => onEdit(freelancer.id)}>
            편집
          </RowActionButton>
          <RowActionButton variant="delete" onClick={() => onDelete(freelancer.id)}>
            삭제
          </RowActionButton>
        </RowActionGroup>
      </td>
    </tr>
  );
}

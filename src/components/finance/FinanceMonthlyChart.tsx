"use client";

import type { MonthlyTrendPoint } from "@/lib/transaction-service";
import { formatKrw } from "./types";

interface FinanceMonthlyChartProps {
  data: MonthlyTrendPoint[];
  loading?: boolean;
}

const CHART_HEIGHT = 160;
const PADDING = { top: 12, right: 16, bottom: 32, left: 56 };
const BASE_STEP_MAN = 250;
const TEN_MILLION_MAN = 1000;
const MAX_GRID_CELLS = 4;

function toManwon(value: number) {
  return value / 10_000;
}

function formatAxisManwon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}만`;
}

function roundToNiceStep(minStep: number): number {
  const niceSteps = [250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000];
  for (const step of niceSteps) {
    if (step >= minStep) return step;
  }
  return Math.ceil(minStep / 1000) * 1000;
}

function computeYAxisScale(maxManwon: number) {
  const safeMax = Math.max(maxManwon, 1);
  let stepMan = BASE_STEP_MAN;

  if (safeMax > TEN_MILLION_MAN) {
    stepMan = roundToNiceStep(Math.ceil(safeMax / MAX_GRID_CELLS));
  }

  const gridCells = Math.min(
    MAX_GRID_CELLS,
    Math.max(1, Math.ceil(safeMax / stepMan))
  );
  const topMan = stepMan * gridCells;

  const yTicks = Array.from({ length: gridCells + 1 }, (_, index) => ({
    ratio: index / gridCells,
    value: stepMan * index,
  }));

  return { topMan, yTicks };
}

export function FinanceMonthlyChart({ data, loading }: FinanceMonthlyChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
        그래프 불러오는 중...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface px-6 py-12 text-center text-body-sm text-on-surface-variant">
        표시할 월별 데이터가 없습니다.
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((point) => [point.income, point.expense]),
    1
  );
  const maxManwon = toManwon(maxValue);
  const { topMan, yTicks } = computeYAxisScale(maxManwon);
  const chartWidth = Math.max(320, data.length * 72 + PADDING.left + PADDING.right);
  const innerWidth = chartWidth - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const groupWidth = innerWidth / data.length;
  const barWidth = Math.min(18, groupWidth / 3);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-body-lg font-semibold text-text-primary">월별 수입 · 지출 변화</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            선택한 조회 기간의 월별 금액 추이 (만원)
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-body-sm">
          <span className="inline-flex items-center gap-2 text-on-surface-variant">
            <span className="h-3 w-3 rounded-sm bg-primary-container" />
            수입
          </span>
          <span className="inline-flex items-center gap-2 text-on-surface-variant">
            <span className="h-3 w-3 rounded-sm bg-warning" />
            지출
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="min-w-full"
          role="img"
          aria-label="월별 수입 지출 그래프"
        >
          {yTicks.map((tick) => {
            const y = PADDING.top + innerHeight - innerHeight * tick.ratio;
            return (
              <g key={tick.value}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={chartWidth - PADDING.right}
                  y2={y}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray={tick.ratio === 0 ? undefined : "4 4"}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-on-surface-variant text-[11px]"
                >
                  {formatAxisManwon(tick.value)}
                </text>
              </g>
            );
          })}

          {data.map((point, index) => {
            const groupX = PADDING.left + index * groupWidth + groupWidth / 2;
            const incomeHeight = (toManwon(point.income) / topMan) * innerHeight;
            const expenseHeight = (toManwon(point.expense) / topMan) * innerHeight;
            const baseY = PADDING.top + innerHeight;

            return (
              <g key={point.month}>
                <rect
                  x={groupX - barWidth - 2}
                  y={baseY - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  rx={4}
                  fill="var(--color-primary-container)"
                >
                  <title>{`${point.label} 수입: ${formatKrw(point.income)}`}</title>
                </rect>
                <rect
                  x={groupX + 2}
                  y={baseY - expenseHeight}
                  width={barWidth}
                  height={expenseHeight}
                  rx={4}
                  fill="var(--color-warning)"
                >
                  <title>{`${point.label} 지출: ${formatKrw(point.expense)}`}</title>
                </rect>
                <text
                  x={groupX}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-on-surface-variant text-[11px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

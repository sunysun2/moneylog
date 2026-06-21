"use client";

import { useState } from "react";
import type { MonthlyTrendPoint } from "@/lib/transaction-service";
import { cn } from "@/lib/cn";
import { type TypeFilter } from "./types";

interface FinanceMonthlyChartProps {
  data: MonthlyTrendPoint[];
  loading?: boolean;
  typeFilter?: TypeFilter;
}

const CHART_HEIGHT = 168;
const PADDING = { top: 12, right: 16, bottom: 32, left: 56 };
const MAX_GRID_CELLS = 4;
const TOOLTIP_WIDTH = 76;
const TOOLTIP_GAP = 4;

function toManwon(value: number) {
  return value / 10_000;
}

function formatAxisManwon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}만`;
}

function roundToNiceStep(minStep: number): number {
  const niceSteps = [
    1, 2, 5, 10, 20, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000,
  ];
  for (const step of niceSteps) {
    if (step >= minStep) return step;
  }
  return Math.ceil(minStep);
}

function computeYAxisScale(maxManwon: number) {
  const safeMax = Math.max(maxManwon, 1);
  const stepMan = roundToNiceStep(Math.ceil(safeMax / MAX_GRID_CELLS));

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

function chartTitle(typeFilter: TypeFilter): string {
  switch (typeFilter) {
    case "income":
      return "월별 수입 변화";
    case "expense":
      return "월별 지출 변화";
    default:
      return "월별 수입 · 지출 변화";
  }
}

function chartAriaLabel(typeFilter: TypeFilter): string {
  switch (typeFilter) {
    case "income":
      return "월별 수입 그래프";
    case "expense":
      return "월별 지출 그래프";
    default:
      return "월별 수입 지출 그래프";
  }
}

function formatTooltipManwon(valueKrw: number): string {
  const man = Math.round(valueKrw / 10_000);
  return `${man.toLocaleString("ko-KR")}만원`;
}

function barTopY(
  valueKrw: number,
  baseY: number,
  topMan: number,
  innerHeight: number
): number {
  return baseY - (toManwon(valueKrw) / topMan) * innerHeight;
}

function tooltipHeight(showIncome: boolean, showExpense: boolean) {
  if (showIncome && showExpense) return 32;
  return 22;
}

function computePlotTop(tooltipH: number): number {
  return tooltipH + TOOLTIP_GAP + PADDING.top;
}

function computeTooltipTop(anchorY: number, tooltipH: number): number {
  return anchorY - tooltipH - TOOLTIP_GAP;
}

function computeBarAnchorY(
  point: MonthlyTrendPoint,
  baseY: number,
  topMan: number,
  innerHeight: number,
  showIncome: boolean,
  showExpense: boolean
): number {
  let anchorY = baseY;

  if (showIncome && point.income > 0) {
    anchorY = Math.min(anchorY, barTopY(point.income, baseY, topMan, innerHeight));
  }
  if (showExpense && point.expense > 0) {
    anchorY = Math.min(anchorY, barTopY(point.expense, baseY, topMan, innerHeight));
  }

  return anchorY;
}

export function FinanceMonthlyChart({
  data,
  loading,
  typeFilter = "all",
}: FinanceMonthlyChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const showIncome = typeFilter === "all" || typeFilter === "income";
  const showExpense = typeFilter === "all" || typeFilter === "expense";

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
    ...data.flatMap((point) => [
      showIncome ? point.income : 0,
      showExpense ? point.expense : 0,
    ]),
    1
  );
  const maxManwon = toManwon(maxValue);
  const { topMan, yTicks } = computeYAxisScale(maxManwon);
  const tooltipH = tooltipHeight(showIncome, showExpense);
  const plotTop = computePlotTop(tooltipH);
  const chartWidth = Math.max(320, data.length * 72 + PADDING.left + PADDING.right);
  const innerWidth = chartWidth - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - plotTop - PADDING.bottom;
  const groupWidth = innerWidth / data.length;
  const barCount = (showIncome ? 1 : 0) + (showExpense ? 1 : 0);
  const barWidth = Math.min(18, groupWidth / (barCount + 1));
  const baseY = plotTop + innerHeight;
  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX =
    hoveredIndex !== null ? PADDING.left + hoveredIndex * groupWidth + groupWidth / 2 : 0;
  const barAnchorY =
    hoveredPoint !== null
      ? computeBarAnchorY(
          hoveredPoint,
          baseY,
          topMan,
          innerHeight,
          showIncome,
          showExpense
        )
      : baseY;
  const tooltipTop =
    hoveredPoint !== null ? computeTooltipTop(barAnchorY, tooltipH) : 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-body-lg font-semibold text-text-primary">{chartTitle(typeFilter)}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            선택한 조회 기간의 월별 금액 추이 (만원)
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-body-sm">
          {showIncome && (
            <span className="inline-flex items-center gap-2 text-on-surface-variant">
              <span className="h-3 w-3 rounded-sm bg-primary-container" />
              수입
            </span>
          )}
          {showExpense && (
            <span className="inline-flex items-center gap-2 text-on-surface-variant">
              <span className="h-3 w-3 rounded-sm bg-warning" />
              지출
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="min-w-full"
          role="img"
          aria-label={chartAriaLabel(typeFilter)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {yTicks.map((tick) => {
            const y = plotTop + innerHeight - innerHeight * tick.ratio;
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

          <g
            pointerEvents="none"
            className={cn(
              "transition-opacity duration-200 ease-out",
              hoveredPoint ? "opacity-100" : "opacity-0"
            )}
          >
            {hoveredPoint && (
              <>
                <rect
                  x={hoveredX - TOOLTIP_WIDTH / 2}
                  y={tooltipTop}
                  width={TOOLTIP_WIDTH}
                  height={tooltipH}
                  rx={4}
                  fill="var(--color-surface-container-highest)"
                  stroke="var(--color-border-subtle)"
                />
                <text
                  x={hoveredX}
                  y={tooltipTop + 10}
                  textAnchor="middle"
                  className="fill-text-primary text-[8px] font-semibold"
                >
                  {hoveredPoint.label}
                </text>
                {showIncome && (
                  <text
                    x={hoveredX}
                    y={tooltipTop + (showExpense ? 20 : 18)}
                    textAnchor="middle"
                    style={{ fill: "var(--color-primary-container)" }}
                    className="text-[8px]"
                  >
                    수입 {formatTooltipManwon(hoveredPoint.income)}
                  </text>
                )}
                {showExpense && (
                  <text
                    x={hoveredX}
                    y={tooltipTop + (showIncome ? 29 : 18)}
                    textAnchor="middle"
                    style={{ fill: "var(--color-warning)" }}
                    className="text-[8px]"
                  >
                    지출 {formatTooltipManwon(hoveredPoint.expense)}
                  </text>
                )}
              </>
            )}
          </g>

          {data.map((point, index) => {
            const groupX = PADDING.left + index * groupWidth + groupWidth / 2;
            const isHovered = hoveredIndex === index;

            return (
              <g key={point.month}>
                <rect
                  x={PADDING.left + index * groupWidth}
                  y={plotTop}
                  width={groupWidth}
                  height={innerHeight + 18}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
                {showIncome && (
                  <rect
                    x={showExpense ? groupX - barWidth - 2 : groupX - barWidth / 2}
                    y={baseY - (toManwon(point.income) / topMan) * innerHeight}
                    width={barWidth}
                    height={(toManwon(point.income) / topMan) * innerHeight}
                    rx={4}
                    fill="var(--color-primary-container)"
                    className={cn(
                      "pointer-events-none transition-opacity duration-200",
                      isHovered ? "opacity-100" : "opacity-90"
                    )}
                  />
                )}
                {showExpense && (
                  <rect
                    x={showIncome ? groupX + 2 : groupX - barWidth / 2}
                    y={baseY - (toManwon(point.expense) / topMan) * innerHeight}
                    width={barWidth}
                    height={(toManwon(point.expense) / topMan) * innerHeight}
                    rx={4}
                    fill="var(--color-warning)"
                    className={cn(
                      "pointer-events-none transition-opacity duration-200",
                      isHovered ? "opacity-100" : "opacity-90"
                    )}
                  />
                )}
                <text
                  x={groupX}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  className={cn(
                    "pointer-events-none fill-on-surface-variant text-[11px] transition-colors duration-200",
                    isHovered && "fill-text-primary font-semibold"
                  )}
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

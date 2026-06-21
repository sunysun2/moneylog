"use client";

import type { DashboardNetProfitPoint } from "./types";
import { formatKrw, formatManwon } from "@/components/finance/types";

interface DashboardNetProfitChartProps {
  data: DashboardNetProfitPoint[];
}

const CHART_HEIGHT = 160;
const PADDING = { top: 28, right: 48, bottom: 32, left: 56 };
const POINT_LABEL_OFFSET = 4;
const POINT_RADIUS = 4;
const AMOUNT_LABEL_COLOR = "#ffffff";
const MAX_PLOT_WIDTH = 580;

function toManwon(value: number) {
  return value / 10_000;
}

function formatAxisManwon(value: number) {
  const prefix = value < 0 ? "-" : "";
  return `${prefix}${Math.abs(Math.round(value)).toLocaleString("ko-KR")}만`;
}

function computeYAxisScale(values: number[]) {
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);
  const maxManwon = toManwon(maxAbs);
  const stepMan = maxManwon <= 250 ? 250 : Math.ceil(maxManwon / 4 / 250) * 250;
  const topMan = stepMan * Math.max(1, Math.ceil(maxManwon / stepMan));
  const bottomMan = minValue < 0 ? -topMan : 0;
  const rangeMan = topMan - bottomMan;

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = bottomMan + rangeMan * ratio;
    return { ratio, value };
  });

  return { topMan, bottomMan, rangeMan, yTicks };
}

export function DashboardNetProfitChart({ data }: DashboardNetProfitChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-border-subtle bg-bg-surface px-6 py-10 text-center text-body-sm text-on-surface-variant">
        표시할 순이익 추이가 없습니다.
      </div>
    );
  }

  const values = data.map((point) => point.netProfit);
  const { bottomMan, rangeMan, yTicks } = computeYAxisScale(values);
  const innerWidth = Math.min(
    MAX_PLOT_WIDTH,
    Math.max(200, (data.length - 1) * 44)
  );
  const chartWidth = PADDING.left + PADDING.right + innerWidth;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = innerWidth / Math.max(data.length - 1, 1);

  const points = data.map((point, index) => {
    const x = PADDING.left + index * stepX;
    const valueMan = toManwon(point.netProfit);
    const ratio = rangeMan === 0 ? 0.5 : (valueMan - bottomMan) / rangeMan;
    const y = PADDING.top + innerHeight - ratio * innerHeight;
    return { ...point, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-bg-surface p-5">
      <h2 className="text-body-lg font-semibold text-text-primary">월별 순이익 추이</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">최근 12개월 (만원)</p>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="max-w-full"
          style={{ width: "100%", height: CHART_HEIGHT }}
          role="img"
          aria-label="월별 순이익 추이"
        >
          <line
            x1={PADDING.left}
            y1={PADDING.top + innerHeight / 2}
            x2={chartWidth - PADDING.right}
            y2={PADDING.top + innerHeight / 2}
            stroke="var(--color-border-subtle)"
            strokeDasharray="4 4"
          />

          {yTicks.map((tick) => {
            const y = PADDING.top + innerHeight - tick.ratio * innerHeight;
            return (
              <g key={tick.value}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={chartWidth - PADDING.right}
                  y2={y}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="4 4"
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

          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary-container)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.month}>
              {point.netProfit > 0 && (
                <text
                  x={point.x}
                  y={point.y - POINT_RADIUS - POINT_LABEL_OFFSET}
                  textAnchor="middle"
                  className="text-[11px] font-medium"
                  fill={AMOUNT_LABEL_COLOR}
                >
                  {formatManwon(point.netProfit)}
                </text>
              )}
              <circle cx={point.x} cy={point.y} r={4} fill="var(--color-primary-container)">
                <title>{`${point.label} 순이익: ${formatKrw(point.netProfit)}`}</title>
              </circle>
              <text
                x={point.x}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                className="fill-on-surface-variant text-[11px]"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

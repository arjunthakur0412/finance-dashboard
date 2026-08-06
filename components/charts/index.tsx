"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/money";

const COLORS = ["#5b8def", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#fb7185", "#2dd4bf", "#94a3b8"];

const tooltipStyle = {
  backgroundColor: "#111113",
  border: "1px solid #27272a",
  borderRadius: 12,
  fontSize: 12,
};

export function MoneyAreaChart({
  data,
  dataKey = "value",
  xKey = "label",
  color = "#5b8def",
  height = 280,
}: {
  data: Record<string, string | number>[];
  dataKey?: string;
  xKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moneyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} stroke="#71717a" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => formatINR(Number(v), { compact: true })}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => formatINR(Number(v))}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill="url(#moneyFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MoneyBarChart({
  data,
  dataKey = "value",
  xKey = "label",
  color = "#5b8def",
  height = 280,
}: {
  data: Record<string, string | number>[];
  dataKey?: string;
  xKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} stroke="#71717a" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => formatINR(Number(v), { compact: true })}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(Number(v))} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AllocationDonut({
  data,
  height = 280,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(Number(v))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

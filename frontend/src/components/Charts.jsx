import { Bar, BarChart, CartesianGrid, Cell, Legend, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const passFailColors = ["#3ee47f", "#ff4d66"];
const defectColors = ["#ff9f2f", "#ff4d66", "#f9d949", "#b96cff"];

function ChartShell({ title, children }) {
  return (
    <section className="chart-panel rounded-2xl bg-white shadow-sm p-4">
      <h3>{title}</h3>
      <div className="chart-box">{children}</div>
    </section>
  );
}

export function PassFailPie({ data = [] }) {
  const passed = (data?.find((d) => /pass/i.test(d.name)) || data[0] || {}).value || 0;
  const failed = (data?.find((d) => /fail/i.test(d.name)) || data[1] || {}).value || 0;
  const total = passed + failed || 1;
  const pct = Math.round((passed / total) * 100);

  // Animated circular progress ring using SVG for premium look
  const stroke = 12;
  const size = 180;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <ChartShell title="Pass / Fail Ratio">
      <div className="chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="pfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00BFFF" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform={`translate(${size/2}, ${size/2})`}>
              <circle r={radius} fill="#f3f7fb" />
              <circle r={radius} fill="none" stroke="rgba(2,6,23,0.06)" strokeWidth={stroke} />
              <circle
                r={radius}
                fill="none"
                stroke="url(#pfGradient)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease, filter 0.5s' }}
                filter="url(#glow)"
                transform="rotate(-90)"
              />
            </g>
          </svg>

          <div className="donut-center">
            <div className="donut-pct">{pct}%</div>
            <div className="donut-label">Passed</div>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}

export function DefectBar({ data = [] }) {
  const filteredData = data.filter((entry) => {
    const name = String(entry?.name || "").trim().toLowerCase();
    return name !== "proper fill";
  });

  return (
    <ChartShell title="Defect Counts">
      <ResponsiveContainer>
        <BarChart data={filteredData} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" vertical={false} />
          <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#475569" allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              borderRadius: 12,
              color: "#0f172a",
            }}
            formatter={(value) => [value, "Count"]}
          />
          <Bar dataKey="value" radius={[10, 10, 10, 10]} animationDuration={1000} barSize={36}>
            {filteredData.map((entry, index) => (
              <Cell key={index} fill={defectColors[index % defectColors.length]} />
            ))}
            <LabelList dataKey="value" position="top" style={{ fill: '#0f172a', fontWeight: 700, fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function TrendLine({ data = [] }) {
  const normalizedData = data
    .map((item, index) => {
      const rawName = item.name || item.timestamp || `Point ${index + 1}`;
      const parsedName = typeof rawName === "string" ? rawName : String(rawName);
      const total = Number(item.total ?? item.inspections ?? ((item.passed ?? 0) + (item.failed ?? 0))) || 0;
      const parsedTime = Date.parse(parsedName);
      const label = !Number.isNaN(parsedTime)
        ? new Date(parsedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : parsedName;

      return {
        ...item,
        name: parsedName,
        label,
        total,
      };
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.name);
      const bTime = Date.parse(b.name);
      if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
        return aTime - bTime;
      }
      return String(a.name).localeCompare(String(b.name));
    });

  return (
    <ChartShell title="Inspection Trend">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={normalizedData} margin={{ top: 18, right: 16, left: -10, bottom: 6 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#475569"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval="preserveEnd"
            minTickGap={16}
          />
          <YAxis
            stroke="#475569"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={34}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              borderRadius: 12,
              color: "#0f172a",
              boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            }}
            formatter={(value, name) => [value, "Bottles"]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#2563eb" }}
            animationDuration={800}
            animationEasing="ease"
            connectNulls
            strokeLinecap="round"
            strokeLinejoin="round"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

import type { AvailabilitySummary, StatusHistoryPoint } from "../status/types";

const STATUS_COLORS = {
  operational: "#34c785",
  degraded: "#f0a51a",
  partial_outage: "#ec7a35",
  major_outage: "#e05267",
  maintenance: "#4aa8ff",
  unknown: "#6f7a8a",
} as const;

const STATUS_HEIGHTS = {
  operational: 100,
  degraded: 70,
  partial_outage: 40,
  major_outage: 8,
  maintenance: 100,
  unknown: 20,
} as const;

const WIDTH = 720;
const LEFT = 42;
const RIGHT = 28;
const TOP = 14;
const CHART_HEIGHT = 92;
const BOTTOM = TOP + CHART_HEIGHT;

function pointLabel(point: StatusHistoryPoint) {
  const response = point.latencyMs === undefined ? "no response duration" : `${point.latencyMs} ms`;
  return `${new Date(point.checkedAt).toLocaleString()}: ${point.state}, ${response}`;
}

function chartX(index: number, count: number) {
  if (count === 1) return (LEFT + WIDTH - RIGHT) / 2;
  return LEFT + (index / (count - 1)) * (WIDTH - LEFT - RIGHT);
}

function timeLabel(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function StatusBars({ history }: { history: StatusHistoryPoint[] }) {
  const slotWidth = (WIDTH - LEFT - RIGHT) / history.length;
  const barWidth = Math.max(2, Math.min(13, slotWidth * 0.68));

  return (
    <svg viewBox={`0 0 ${WIDTH} 128`} role="img" aria-label="Observed status samples">
      {[0, 25, 50, 75, 100].map((value) => {
        const y = BOTTOM - (value / 100) * CHART_HEIGHT;
        return <g key={value}>
          <line x1={LEFT} x2={WIDTH - RIGHT} y1={y} y2={y} className="grid-line" />
          <text x={LEFT - 8} y={y + 3} textAnchor="end">{value}</text>
        </g>;
      })}
      {history.map((point, index) => {
        const height = (STATUS_HEIGHTS[point.state] / 100) * CHART_HEIGHT;
        return <g key={point.checkedAt}>
          <title>{pointLabel(point)}</title>
          <rect
            className="status-bar"
            x={chartX(index, history.length) - barWidth / 2}
            y={BOTTOM - height}
            width={barWidth}
            height={height}
            rx="1"
            fill={STATUS_COLORS[point.state]}
          />
        </g>;
      })}
    </svg>
  );
}

function LatencyChart({ history }: { history: StatusHistoryPoint[] }) {
  const measured = history.filter((point) => point.latencyMs !== undefined);
  if (measured.length === 0) return null;

  const maximum = Math.max(250, Math.ceil(Math.max(...measured.map((point) => point.latencyMs!)) / 50) * 50);
  const path = measured.map((point, index) => {
    const x = chartX(index, measured.length);
    const y = BOTTOM - (point.latencyMs! / maximum) * CHART_HEIGHT;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const labelIndexes = [...new Set([0, Math.floor((measured.length - 1) / 3), Math.floor(((measured.length - 1) * 2) / 3), measured.length - 1])];

  return <svg viewBox={`0 0 ${WIDTH} 145`} role="img" aria-label="Measured response latency">
    {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
      const value = Math.round(maximum * fraction);
      const y = BOTTOM - fraction * CHART_HEIGHT;
      return <g key={fraction}>
        <line x1={LEFT} x2={WIDTH - RIGHT} y1={y} y2={y} className="grid-line" />
        <text x={LEFT - 8} y={y + 3} textAnchor="end">{value}</text>
      </g>;
    })}
    {labelIndexes.map((index) => <text key={index} x={chartX(index, measured.length)} y="124" textAnchor="middle">
      {timeLabel(measured[index].checkedAt)}
    </text>)}
    <path d={path} pathLength="1" className="latency-line" />
    {(() => {
      const index = measured.length - 1;
      const point = measured[index];
      return <circle
        cx={chartX(index, measured.length)}
        cy={BOTTOM - (point.latencyMs! / maximum) * CHART_HEIGHT}
        r="3.5"
        className="latency-point"
      ><title>{pointLabel(point)}</title></circle>;
    })()}
  </svg>;
}

export default function StatusHistory({ history, availability }: {
  history?: StatusHistoryPoint[];
  availability?: AvailabilitySummary;
}) {
  if (!history || !availability || history.length === 0) return <p>No measured history yet.</p>;

  return <section className="history">
    <header className="history-heading">
      <span>24h status history</span>
      <span>{availability.coverage === "complete"
        ? `${availability.operationalTimeRate}% observed availability`
        : availability.coverage === "partial"
          ? `${availability.monitoringCoveragePercent}% monitoring coverage — gaps detected`
          : `${availability.observedSamples} real sample${availability.observedSamples === 1 ? "" : "s"} — history still building`}</span>
    </header>
    <div className="charts">
      <h2>Observed availability [%]</h2>
      <StatusBars history={history} />
      <h2>Response latency [ms]</h2>
      <LatencyChart history={history} />
    </div>
  </section>;
}


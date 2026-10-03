import type { StatusHistoryPoint } from "./types";

export const HISTORY_CHART_BUCKET_MS = 5 * 60 * 1000;

const STATE_SEVERITY: Record<StatusHistoryPoint["state"], number> = {
  operational: 0,
  maintenance: 1,
  unknown: 2,
  degraded: 3,
  partial_outage: 4,
  major_outage: 5,
};

export function downsampleHistoryForChart(
  history: StatusHistoryPoint[],
  windowStart: Date,
  bucketMs = HISTORY_CHART_BUCKET_MS,
): StatusHistoryPoint[] {
  const buckets = new Map<number, StatusHistoryPoint>();

  for (const point of history) {
    const timestamp = Date.parse(point.checkedAt);
    if (!Number.isFinite(timestamp)) continue;

    const bucketIndex = Math.max(0, Math.floor((timestamp - windowStart.getTime()) / bucketMs));
    const existing = buckets.get(bucketIndex);

    if (!existing) {
      buckets.set(bucketIndex, point);
      continue;
    }

    const existingTimestamp = Date.parse(existing.checkedAt);
    const pointSeverity = STATE_SEVERITY[point.state];
    const existingSeverity = STATE_SEVERITY[existing.state];

    if (
      pointSeverity > existingSeverity ||
      (pointSeverity === existingSeverity && timestamp > existingTimestamp)
    ) {
      buckets.set(bucketIndex, point);
    }
  }

  return [...buckets.values()].sort(
    (a, b) => Date.parse(a.checkedAt) - Date.parse(b.checkedAt),
  );
}


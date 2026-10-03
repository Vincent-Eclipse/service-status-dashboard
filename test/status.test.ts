import { describe, expect, it } from "vitest";
import { downsampleHistoryForChart } from "../src/status/history";
import { deriveOverallState } from "../src/status/overallStatus";

describe("overall status", () => {
  it("uses the most severe active state", () => {
    expect(deriveOverallState(["operational", "degraded", "major_outage"])).toBe("major_outage");
  });

  it("does not claim operational when no measurements exist", () => {
    expect(deriveOverallState([])).toBe("monitoring_not_connected");
  });
});

describe("history downsampling", () => {
  it("keeps the worst observation in each bucket", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const result = downsampleHistoryForChart([
      { checkedAt: "2026-01-01T00:01:00.000Z", state: "operational", latencyMs: 90 },
      { checkedAt: "2026-01-01T00:02:00.000Z", state: "degraded", latencyMs: 400 },
      { checkedAt: "2026-01-01T00:06:00.000Z", state: "operational", latencyMs: 80 },
    ], start);

    expect(result.map((point) => point.state)).toEqual(["degraded", "operational"]);
  });
});


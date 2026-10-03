export type ServiceState =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

export interface StatusHistoryPoint {
  checkedAt: string;
  state: ServiceState;
  latencyMs?: number;
}

export type AvailabilitySummary =
  | { periodHours: 24; observedSamples: number; coverage: "insufficient" }
  | {
      periodHours: 24;
      observedSamples: number;
      coverage: "partial";
      monitoringCoveragePercent: number;
    }
  | {
      periodHours: 24;
      observedSamples: number;
      coverage: "complete";
      monitoringCoveragePercent: 100;
      operationalTimeRate: number;
    };

export type OverallState =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "monitoring_not_connected"
  | "status_unavailable";


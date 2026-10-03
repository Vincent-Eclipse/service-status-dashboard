import type { OverallState, ServiceState } from "./types";

const INCIDENT_PRECEDENCE: ServiceState[] = [
  "major_outage",
  "partial_outage",
  "degraded",
  "maintenance",
];

export function deriveOverallState(states: ServiceState[]): OverallState {
  for (const candidate of INCIDENT_PRECEDENCE) {
    if (states.includes(candidate)) return candidate as OverallState;
  }
  if (states.length > 0 && states.every((state) => state === "operational")) {
    return "operational";
  }
  return "monitoring_not_connected";
}

export function describeOverallState(state: OverallState): string {
  switch (state) {
    case "operational": return "All systems operational";
    case "degraded": return "Degraded performance";
    case "partial_outage": return "Partial outage";
    case "major_outage": return "Major outage";
    case "maintenance": return "Maintenance";
    case "monitoring_not_connected": return "Some services are not reporting";
    case "status_unavailable": return "Status unavailable";
  }
}


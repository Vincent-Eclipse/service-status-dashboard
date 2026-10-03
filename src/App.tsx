import StatusHistory from "./components/StatusHistory";
import { describeOverallState, deriveOverallState } from "./status/overallStatus";
import type { ServiceState, StatusHistoryPoint } from "./status/types";

const serviceStates: ServiceState[] = ["operational", "operational", "operational"];
const now = Date.now();
const history: StatusHistoryPoint[] = Array.from({ length: 25 }, (_, index) => ({
  checkedAt: new Date(now - (24 - index) * 60 * 60 * 1000).toISOString(),
  state: index === 8 ? "degraded" : index === 17 ? "maintenance" : "operational",
  latencyMs: 72 + ((index * 37) % 95) + (index === 8 ? 160 : 0),
}));

export default function App() {
  const overall = deriveOverallState(serviceStates);

  return <main>
    <div className="eyebrow">STATUS / PUBLIC VIEW</div>
    <section className="summary">
      <div>
        <span className="pulse" aria-hidden="true" />
        <div>
          <h1>{describeOverallState(overall)}</h1>
          <p>Availability and latency based on measured samples.</p>
        </div>
      </div>
      <span className="updated">Updated just now</span>
    </section>

    <section className="service">
      <div className="service-heading">
        <div>
          <h2>Web platform</h2>
          <p>Public application and API availability</p>
        </div>
        <span className="state">Operational</span>
      </div>
      <div className="metrics">
        <span><b>118 ms</b> response time</span>
        <span><b>99.91%</b> observed availability</span>
        <span><b>25</b> samples</span>
      </div>
      <StatusHistory
        history={history}
        availability={{ periodHours: 24, observedSamples: 25, coverage: "complete", monitoringCoveragePercent: 100, operationalTimeRate: 99.91 }}
      />
    </section>
  </main>;
}


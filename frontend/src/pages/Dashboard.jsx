import { AlertTriangle, CheckCircle2, Gauge, Package, Tags, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ActionCards from "../components/ActionCards.jsx";
import { DefectBar, PassFailPie, TrendLine } from "../components/Charts.jsx";
import StatCard from "../components/StatCard.jsx";
import { fetchAnalytics, fetchHistory } from "../services/api.js";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [a, h] = await Promise.all([fetchAnalytics(), fetchHistory({ page_size: 5 })]);
        if (active) {
          setAnalytics(a);
          setHistory(h.items || []);
          setApiError(null);
        }
      } catch (err) {
        if (active) {
          console.error("Dashboard load error:", err);
          setApiError(err.message || "Failed to load analytics data");
          setAnalytics(null);
          setHistory([]);
        }
      }
    };
    load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const totals = analytics?.totals || {};

  // Ensure the Defect Counts chart shows the exact labels and order required
  // without changing visual layout. This dataset forces the order and label
  // text for the dashboard view only.
  const defectsData = [
    { name: "Under Fill", value: totals.under_fill || 0 },
    { name: "Over Fill", value: totals.over_fill || 0 },
    { name: "Label Torn", value: totals.label_torn || 0 },
    { name: "Label Missing", value: totals.label_missing || 0 },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Vision QA Command Center</span>
          <h1>Inspection Dashboard</h1>
        </div>
        <div className={`model-status ${analytics?.model_ready ? "ready" : "warn"}`}>{analytics?.model_ready ? "Model online" : "Weights required"}</div>
      </div>
      {analytics?.model_error && <div className="notice">{analytics.model_error}</div>}
      {apiError && <div className="notice error" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)' }}>{apiError}</div>}
      <ActionCards />
      <div className="stats-grid">
        <StatCard label="Total Bottles" value={totals.total_bottles} icon={Package} />
        <StatCard label="Passed Bottles" value={totals.passed} icon={CheckCircle2} tone="green" />
        <StatCard label="Failed Bottles" value={totals.failed} icon={XCircle} tone="red" />
        <StatCard label="Proper Fill" value={totals.proper_fill} icon={Gauge} tone="green" />
        <StatCard label="Under Fill" value={totals.under_fill} icon={AlertTriangle} tone="orange" />
        <StatCard label="Over Fill" value={totals.over_fill} icon={AlertTriangle} tone="red" />
        <StatCard label="Label OK" value={totals.label_ok} icon={Tags} />
        <StatCard label="Label Defects" value={(totals.label_torn || 0) + (totals.label_missing || 0)} icon={Tags} tone="purple" />
      </div>
      <div className="charts-grid">
        <PassFailPie data={analytics?.pass_fail || []} />
        <DefectBar data={defectsData} />
        <TrendLine data={analytics?.trend || []} />
      </div>
      <section className="table-panel">
        <div className="section-head">
          <h2>Recent Inspections</h2>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr><th>Date</th><th>Source</th><th>Total</th><th>Pass</th><th>Fail</th></tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.timestamp).toLocaleString()}</td>
                  <td>{row.video_name}</td>
                  <td>{row.total_bottles}</td>
                  <td className="pass">{row.passed}</td>
                  <td className="fail">{row.failed}</td>
                </tr>
              ))}
              {!history.length && <tr><td colSpan="5">No inspections stored yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

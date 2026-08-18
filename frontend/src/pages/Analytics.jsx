import { AlertTriangle, CheckCircle2, Gauge, Package, Tags, XCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DefectBar, PassFailPie, TrendLine } from "../components/Charts.jsx";
import StatCard from "../components/StatCard.jsx";
import Toast from "../components/Toast.jsx";
import { fetchAnalytics, clearAnalytics } from "../services/api.js";
import { useLocation } from "react-router-dom";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnalytics();
        if (active) {
          setAnalytics(data);
        }
      } catch (err) {
        if (active) {
          console.error("Analytics fetch error:", err);
          setAnalytics(null);
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        if (active) setLoading(false);
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

  // Build defects dataset in the exact order/labels required by the design
  const defectsData = [
    { name: "Under Fill", value: totals.under_fill || 0 },
    { name: "Over Fill", value: totals.over_fill || 0 },
    { name: "Torn Label", value: totals.label_torn || 0 },
    { name: "Missing Label", value: totals.label_missing || 0 },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Quality intelligence</span>
          <h1>Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="clear-analytics-btn"
            type="button"
            onClick={(event) => {
              try { console.log('[Click] Analytics Clear button', { target: event.target, from: location.pathname }); } catch (e) {}
              setShowConfirmModal(true);
            }}
            title="Clear analytics"
            disabled={loading}
          >
            <Trash2 size={16} />
            <span style={{ marginLeft: 8 }}>Clear Analytics</span>
          </button>
        </div>
      </div>
      {error && <div className="notice error" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', marginBottom: 12 }}>{error}</div>}
      <div className="stats-grid">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="stat-card-skeleton glass-panel" />
          ))
        ) : (
          <>
            <StatCard label="Total Bottles" value={totals.total_bottles} icon={Package} />
            <StatCard label="Passed Bottles" value={totals.passed} icon={CheckCircle2} tone="green" />
            <StatCard label="Failed Bottles" value={totals.failed} icon={XCircle} tone="red" />
            <StatCard label="Proper Fill Count" value={totals.proper_fill} icon={Gauge} tone="green" />
            <StatCard label="Under Fill Count" value={totals.under_fill} icon={AlertTriangle} tone="orange" />
            <StatCard label="Over Fill Count" value={totals.over_fill} icon={AlertTriangle} tone="red" />
            <StatCard label="Label OK Count" value={totals.label_ok} icon={Tags} />
            <StatCard label="Torn Label Count" value={totals.label_torn} icon={Tags} tone="orange" />
            <StatCard label="Missing Label Count" value={totals.label_missing} icon={Tags} tone="purple" />
          </>
        )}
      </div>
      <div className="charts-grid analytics">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="chart-panel skeleton" style={{ height: 260 }} />
          ))
        ) : (
          <>
            <PassFailPie data={analytics?.pass_fail || []} />
            <DefectBar data={defectsData} />
            <TrendLine data={analytics?.trend || []} />
          </>
        )}
      </div>

      {showConfirmModal && (
          <div className="modal-backdrop" style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 1000 }} onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}>
          <div className="confirm-modal glass-panel" style={{ zIndex: 1001 }} onClick={(e) => e.stopPropagation()}>
            <h3>Clear analytics?</h3>
            <p>Are you sure you want to permanently clear all analytics data? This will reset KPI counts to zero.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="button" type="button" onClick={() => {
                  setShowConfirmModal(false);
                }}>Cancel</button>
                <button
                  className="button danger"
                  type="button"
                  onClick={async (event) => {
                    try {
                      setShowConfirmModal(false);
                      setLoading(true);
                      await clearAnalytics();
                      const fresh = await fetchAnalytics();
                      setAnalytics(fresh);
                      setToast('Analytics cleared successfully');
                    } catch (err) {
                      setToast('Failed to clear analytics');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >Confirm</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

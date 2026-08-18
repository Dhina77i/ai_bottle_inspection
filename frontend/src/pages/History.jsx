import { Download, Search } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { API_URL, fetchHistory, reportUrl } from "../services/api.js";

export default function History() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistory({ page, search, source, page_size: 8 });
        if (active) {
          setRows(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (active) {
          console.error("History fetch error:", err);
          setRows([]);
          setTotal(0);
          setError(err.message || "Failed to load history");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
  }, [page, search, source]);

  const pages = Math.max(Math.ceil(total / 8), 1);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><span className="eyebrow">Stored inspections</span><h1>Inspection History</h1></div>
        <a className="button ghost" href={`${API_URL}/export-csv`}><Download size={18} /> Export CSV</a>
      </div>
      {error && <div className="notice error" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', marginBottom: 12 }}>{error}</div>}
      <section className="filter-row">
        <div className="search-box"><Search size={18} /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search by video name" /></div>
        <select value={source} onChange={(event) => { setPage(1); setSource(event.target.value); }}>
          <option value="">All sources</option>
          <option value="upload">Uploaded videos</option>
          <option value="live">Live camera</option>
        </select>
      </section>
      <section className="table-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Video name</th><th>Total bottles</th><th>Passed</th><th>Failed</th><th>Defects</th><th>Report</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.timestamp).toLocaleString()}</td>
                  <td>{row.video_name}</td>
                  <td>{row.total_bottles}</td>
                  <td className="pass">{row.passed}</td>
                  <td className="fail">{row.failed}</td>
                  <td>{row.under_fill + row.over_fill + row.label_torn + row.label_missing}</td>
                  <td>
                    <a
                      className="table-action"
                      href={reportUrl(row.id)}
                      onClick={async (e) => {
                        // Prevent navigation; perform a controlled fetch to force download and preserve filename
                        e.preventDefault();
                        try {
                          const url = reportUrl(row.id);
                          const res = await fetch(url, { method: 'GET' });
                          if (!res.ok) {
                            // Fail silently but log to console for debugging
                            console.error('Report fetch failed', res.status, res.statusText);
                            return;
                          }
                          const blob = await res.blob();
                          const filename = (() => {
                            const cd = res.headers.get('Content-Disposition') || '';
                            const match = /filename\*?=(?:UTF-8''")?"?([^";]+)"?/.exec(cd);
                            return match ? decodeURIComponent(match[1]) : `inspection_${row.id}.csv`;
                          })();
                          const objectUrl = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = objectUrl;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(objectUrl);
                        } catch (err) {
                          // Do not change UI; just log for developers
                          console.error('Download error', err);
                        }
                      }}
                    ><Download size={16} /> CSV</a>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="7">No matching inspections found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}

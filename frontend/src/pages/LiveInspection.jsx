import { AlertTriangle, Camera, Gauge, ImageDown, Maximize, PauseCircle, PlayCircle, RefreshCw, ScanLine, Tags, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import Toast from "../components/Toast.jsx";
import { API_URL, startStream, stopStream, getStreamStatus } from "../services/api.js";

export default function LiveInspection() {
  const outputRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({
    total_bottles: 0,
    proper_fill: 0,
    under_fill: 0,
    over_fill: 0,
    label_ok: 0,
    label_torn: 0,
    label_missing: 0,
  });
  const [fps, setFps] = useState(0);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState("");
  const [connected, setConnected] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [sourceType, setSourceType] = useState("webcam");
  const [rtspUrl, setRtspUrl] = useState("");
  const [mobileIp, setMobileIp] = useState("");
  const [mobilePort, setMobilePort] = useState("8080");
  const [streamPath, setStreamPath] = useState("/video");
  const pollRef = useRef(null);

  const deriveLogsFromStats = (statsPayload) => {
    const entries = [];
    const keys = ["proper_fill", "under_fill", "over_fill", "label_ok", "label_torn", "label_missing"];
    keys.forEach((class_name) => {
      const count = statsPayload[class_name] || 0;
      if (count > 0) {
        entries.push({ class_name, count });
      }
    });
    return entries.slice(0, 5);
  };

  useEffect(() => () => stopInspection(), []);

  const buildStreamUrl = () => {
    if (sourceType === "rtsp") {
      return rtspUrl.trim();
    }

    const host = mobileIp.trim();
    if (!host) return "";
    if (/^https?:\/\//i.test(host)) {
      return host;
    }
    const cleanPath = streamPath.trim() || "/video";
    return `http://${host.replace(/\/+$/, "").replace(/:\d+$/, "")}:${mobilePort.trim() || "8080"}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  };

  const getLiveStats = async () => {
    try {
      const data = await getStreamStatus();
      const nextStats = data.stats || {
        total_bottles: 0,
        proper_fill: 0,
        under_fill: 0,
        over_fill: 0,
        label_ok: 0,
        label_torn: 0,
        label_missing: 0,
      };
      setStats(nextStats);
      setLogs(deriveLogsFromStats(nextStats));
      setFps(data.inference_fps || data.fps || 0);
      setConnected(data.is_running);
      if (!data.is_running && running) {
        setRunning(false);
      }
      if (data.last_error) {
        setToast(data.last_error);
      }
    } catch (error) {
      // ignore transient polling failures
    }
  };

  const startStatsPolling = () => {
    stopStatsPolling();
    pollRef.current = window.setInterval(getLiveStats, 1000);
  };

  const stopStatsPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fpsClass = fps > 25 ? "fps-good" : fps > 15 ? "fps-warning" : "fps-danger";

  const detectionCards = useMemo(() => [
    { label: "Proper Fill", value: stats.proper_fill, icon: Gauge, tone: "green" },
    { label: "Under Fill", value: stats.under_fill, icon: AlertTriangle, tone: "orange" },
    { label: "Over Fill", value: stats.over_fill, icon: AlertTriangle, tone: "red" },
    { label: "Label OK", value: stats.label_ok, icon: Tags },
    { label: "Torn Label", value: stats.label_torn, icon: Tags, tone: "orange" },
    { label: "Missing Label", value: stats.label_missing, icon: Tags, tone: "purple" },
  ], [stats]);

  const visibleLogs = useMemo(() => logs.slice(0, 5), [logs]);

  const refreshServerStream = () => {
    if (!outputRef.current) return;
    setHasFrame(false);
    outputRef.current.crossOrigin = "anonymous";
    outputRef.current.src = `${API_URL}/video-feed?ts=${Date.now()}`;
  };

  const startInspection = async () => {
    try {
      setHasFrame(false);
      setStreamReady(false);
      setConnected(false);
      setToast("");
      setLogs([]);
      setFps(0);

      if (sourceType === "webcam") {
        await startStream("webcam", "0");
      } else {
        const streamUrl = buildStreamUrl();
        if (!streamUrl) {
          setToast("Please enter a valid stream URL before starting.");
          return;
        }
        await startStream(sourceType, streamUrl);
      }

      refreshServerStream();
      startStatsPolling();
      setStreamReady(true);
      setRunning(true);
      setConnected(true);
      setToast("Live stream started.");
    } catch (error) {
      setToast(error.response?.data?.detail || error.message || "Failed to start live inspection.");
    }
  };

  const stopInspection = async () => {
    setRunning(false);
    stopStatsPolling();
    setHasFrame(false);
    setStreamReady(false);

    try {
      await stopStream();
    } catch (error) {
      // ignore cleanup failures
    }

    if (outputRef.current) {
      outputRef.current.src = "";
    }
    setConnected(false);
  };

  const captureScreenshot = () => {
    console.log("[STEP 2] Capture function entered", {
      file: "frontend/src/pages/LiveInspection.jsx",
      sourceType,
      running,
      streamReady,
      hasFrame,
    });

    const image = outputRef.current;
    if (!image?.src) {
      const error = new Error("No stream source is assigned to the live image element.");
      console.error("[SCREENSHOT FAILED] frontend/src/pages/LiveInspection.jsx - before [STEP 3]", error);
      setToast("No frame available. Start streaming first.");
      return;
    }

    if (!image.naturalWidth || !image.naturalHeight) {
      const error = new Error("Live stream image has not produced a drawable frame yet.");
      console.error("[SCREENSHOT FAILED] frontend/src/pages/LiveInspection.jsx - [STEP 3] Source frame detected", {
        error,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        src: image.src,
      });
      setToast("Frame is still loading. Try again in a moment.");
      return;
    }

    try {
      console.log("[STEP 3] Source frame detected", {
        file: "frontend/src/pages/LiveInspection.jsx",
        tagName: image.tagName,
        src: image.src,
        sourceType,
        width: image.naturalWidth,
        height: image.naturalHeight,
        crossOrigin: image.crossOrigin,
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      console.log("[STEP 4] Canvas created", {
        file: "frontend/src/pages/LiveInspection.jsx",
        width: canvas.width,
        height: canvas.height,
      });

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to create a 2D canvas context.");
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      console.log("[STEP 5] Frame drawn", {
        file: "frontend/src/pages/LiveInspection.jsx",
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          const error = new Error("Canvas returned an empty screenshot blob.");
          console.error("[SCREENSHOT FAILED] frontend/src/pages/LiveInspection.jsx - [STEP 6] Blob generated", error);
          setToast("Failed to capture screenshot");
          return;
        }

        console.log("[STEP 6] Blob generated", {
          file: "frontend/src/pages/LiveInspection.jsx",
          type: blob.type,
          size: blob.size,
        });

        const objectUrl = URL.createObjectURL(blob);
        const filename = `inspection-frame-${Date.now()}.jpg`;
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        console.log("[STEP 7] Download triggered", {
          file: "frontend/src/pages/LiveInspection.jsx",
          filename,
          blobSize: blob.size,
        });
        setToast("Screenshot saved successfully!");
      }, "image/jpeg", 0.92);
    } catch (error) {
      console.error("[SCREENSHOT FAILED] frontend/src/pages/LiveInspection.jsx", error);
      setToast("Failed to capture screenshot");
    }
  };

  const handleScreenshotClick = () => {
    console.log("[STEP 1] Screenshot button clicked", {
      file: "frontend/src/pages/LiveInspection.jsx",
      sourceType,
      running,
      streamReady,
      hasFrame,
      fullscreenElement: document.fullscreenElement,
    });
    try {
      captureScreenshot();
    } catch (error) {
      console.error("[SCREENSHOT FAILED] frontend/src/pages/LiveInspection.jsx - [STEP 1] Screenshot button clicked", error);
      setToast("Failed to capture screenshot");
    }
  };

  const fullscreen = () => {
    try {
      outputRef.current?.requestFullscreen?.();
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  };

  return (
    <div className="page-stack">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="page-header">
        <div><span className="eyebrow">Real-time Live Inspection</span><h1>Live Inspection</h1></div>
        <div className={`model-status ${connected ? "ready" : "warn"}`}>{connected ? "Streaming" : "Disconnected"}</div>
      </div>
      <section className="inspection-grid live">
        <div className="video-panel live-panel">
          {!streamReady && (
            <div className="empty-video"><ScanLine size={46} />Server-side stream appears here</div>
          )}
          <img
            ref={outputRef}
            alt="Detected frame"
            crossOrigin="anonymous"
            onLoad={() => setHasFrame(true)}
            onError={() => setHasFrame(false)}
            className={`${hasFrame ? "" : "invisible-output"} live-stream-image`}
            draggable={false}
            style={{ userSelect: "none", pointerEvents: "auto" }}
          />
          <div className="stream-toolbar">
            {!running ? (
              <button className="button primary" onClick={startInspection}><PlayCircle size={18} /> Start</button>
            ) : (
              <button className="button danger" onClick={stopInspection}><PauseCircle size={18} /> Stop</button>
            )}
            <button className="icon-button" onClick={handleScreenshotClick} aria-label="Capture screenshot"><ImageDown size={18} /></button>
            <button className="icon-button" onClick={fullscreen} aria-label="Fullscreen"><Maximize size={18} /></button>
          </div>
        </div>
        <aside className="side-panel">
          <Camera />
          <h3>Live Statistics</h3>
          <div className="mini-stats vertical">
            <span className={fpsClass}>FPS {fps.toFixed ? fps.toFixed(1) : fps || 0}</span>

            <span>Total {stats.total_bottles || 0}</span>
            <span className="pass">Pass {stats.passed || 0}</span>
            <span className="fail">Fail {stats.failed || 0}</span>
          </div>
          <div className="filter-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.65rem', width: '100%' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Live Source</label>
              <select
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
                style={{ width: '100%' }}
              >
                <option value="webcam">Webcam</option>
                <option value="rtsp">RTSP Stream</option>
                <option value="ip_webcam">Mobile Cam (IP Webcam)</option>
              </select>
            </div>

            {sourceType === "rtsp" && (
              <div style={{ display: 'grid', gap: '0.65rem', width: '100%' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>RTSP URL</label>
                <input
                  type="text"
                  value={rtspUrl}
                  onChange={(event) => setRtspUrl(event.target.value)}
                  placeholder="rtsp://username:password@ip:port/stream"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {sourceType === "ip_webcam" && (
              <div style={{ display: 'grid', gap: '0.8rem', width: '100%' }}>
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>IP Address</label>
                  <input
                    type="text"
                    value={mobileIp}
                    onChange={(event) => setMobileIp(event.target.value)}
                    placeholder="192.168.x.x"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Port</label>
                  <input
                    type="text"
                    value={mobilePort}
                    onChange={(event) => setMobilePort(event.target.value)}
                    placeholder="8080"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stream Path</label>
                  <input
                    type="text"
                    value={streamPath}
                    onChange={(event) => setStreamPath(event.target.value)}
                    placeholder="/video"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
          <button className="button ghost full" onClick={refreshServerStream}><RefreshCw size={18} /> Reconnect Stream</button>
        </aside>
      </section>
      <div className="stats-grid">
        {detectionCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>
      <section className="table-panel">
        <h2>Detection Log</h2>
        <div className="log-list">
          {visibleLogs.map((log, index) => (
            <div key={`${log.class_name}-${index}`}>
              <span>{log.bottle_id ? `Bottle #${log.bottle_id}` : log.class_name}</span>
              <strong>
                {log.bottle_id
                  ? log.class_name
                  : log.count != null
                  ? `${log.count} detections`
                  : `${Math.round((log.confidence || 0) * 100)}%`}
              </strong>
            </div>
          ))}
          {!visibleLogs.length && <p>No detections received yet.</p>}
        </div>
      </section>
    </div>
  );
}

import { FileVideo, Loader2, Play, Square, Trash2, Maximize, Minimize } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast.jsx";
import {
  API_URL,
  clearDashboard,
  getVideoFeedStats,
  startInference,
  stopInference,
  uploadVideo,
} from "../services/api.js";

export default function VideoUpload() {
  // Pre-load a default mock file to display the dashboard immediately
  const [file, setFile] = useState({
    name: "No video selected",
    size: 0,
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setBusy(true);
    setToast("Uploading video...");
    
    try {
      await uploadVideo(selectedFile);
      setToast("Video uploaded successfully! Ready for inference.");
    } catch (error) {
      setToast("Failed to upload video.");
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  // Real-time AI Stream Player State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTimestamp, setStreamTimestamp] = useState(Date.now());
  const [fps, setFps] = useState(0);
  const [averageFps, setAverageFps] = useState(0);
  const [streamFps, setStreamFps] = useState(0);
  const [cudaActive, setCudaActive] = useState(false);
  const [gpuActive, setGpuActive] = useState(false);

  const [stats, setStats] = useState({
    total_bottles: 0,
    proper_fill: 0,
    under_fill: 0,
    over_fill: 0,
    label_ok: 0,
    label_torn: 0,
    label_missing: 0,
  });

  // Polling loop for live AI statistics
  useEffect(() => {
    if (!isStreaming) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await getVideoFeedStats();
        if (data.is_running) {
          setFps(data.inference_fps || data.fps);
          setAverageFps(data.average_inference_fps || data.average_fps || 0);
          setStreamFps(data.stream_fps || 0);
          setCudaActive(data.cuda_active);
          setGpuActive(data.gpu_active);
          setStats(data.stats);
        } else {
          // Stopped or finished
          setIsStreaming(false);
          setToast("Inference cycle completed.");
        }
      } catch (error) {
        console.error("Error polling stats:", error);
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [isStreaming]);

  const resetLocalStats = () => {
    setStats({
      total_bottles: 0,
      proper_fill: 0,
      under_fill: 0,
      over_fill: 0,
      label_ok: 0,
      label_torn: 0,
      label_missing: 0,
    });
    setFps(0);
    setAverageFps(0);
    setStreamFps(0);
    setCudaActive(false);
    setGpuActive(false);
  };

  const runInference = async () => {
    setBusy(true);
    try {
      setToast("Launching GPU-accelerated YOLO inference...");
      await startInference();

      // Reset cache and trigger stream player
      setStreamTimestamp(Date.now());
      setIsStreaming(true);
      setToast("AI Video Stream started successfully.");
    } catch (error) {
      setToast(error.response?.data?.detail || "Video inference setup failed.");
      setIsStreaming(false);
    } finally {
      setBusy(false);
    }
  };

  const handleStopInference = async () => {
    try {
      await stopInference();
      setIsStreaming(false);
      setToast("Inference stopped. Results saved to database.");
    } catch (error) {
      setToast("Failed to stop inference.");
    }
  };

  const handleClearDashboard = async () => {
    try {
      await clearDashboard();
      // Revert to initial mock state instead of fully clearing to maintain dashboard look
      setIsStreaming(false);
      resetLocalStats();
      setToast("Dashboard and active stream cleared successfully.");
    } catch (error) {
      setToast("Failed to clear dashboard.");
    }
  };

  // High-Fidelity SVG Interactive Visualizer
  const SvgVisualizer = () => (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Scanning Grids & Lasers */}
        <g opacity="0.3">
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#17e7ff" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#17e7ff" strokeWidth="1" strokeDasharray="5 5" />
        </g>
        <line x1="0" y1="420" x2="1000" y2="420" stroke="#17e7ff" strokeWidth="3" filter="drop-shadow(0 0 8px #17e7ff)" />
        
        {/* Bottle 1: Perfect */}
        <g transform="translate(200, 140)">
          <path d="M40 0 H60 V40 H80 V280 H20 V40 H40 Z" stroke="#3ee47f" strokeWidth="3" fill="rgba(62,228,127,0.1)" />
          {/* Fluid */}
          <path d="M22 100 H78 V278 H22 Z" fill="rgba(62,228,127,0.3)" />
          {/* Label OK */}
          <rect x="15" y="140" width="70" height="60" stroke="#2f80ff" strokeWidth="2" fill="rgba(47,128,255,0.2)" />
          {/* YOLO Bounding Box */}
          <rect x="5" y="-10" width="90" height="300" stroke="#3ee47f" strokeWidth="2" strokeDasharray="6 4" fill="transparent" />
          <text x="5" y="-20" fill="#3ee47f" fontSize="14" fontFamily="monospace" fontWeight="bold">proper_fill 98%</text>
          <text x="100" y="160" fill="#2f80ff" fontSize="12" fontFamily="monospace">label_ok</text>
        </g>

        {/* Bottle 2: Under Fill & Label Torn */}
        <g transform="translate(450, 140)">
          <path d="M40 0 H60 V40 H80 V280 H20 V40 H40 Z" stroke="#ff9f2f" strokeWidth="3" fill="rgba(255,159,47,0.1)" />
          {/* Fluid */}
          <path d="M22 160 H78 V278 H22 Z" fill="rgba(255,159,47,0.3)" />
          {/* Label Torn */}
          <path d="M15 140 H85 V160 L65 170 L85 180 V200 H15 Z" stroke="#ff9f2f" strokeWidth="2" fill="rgba(255,159,47,0.2)" />
          {/* YOLO Bounding Box */}
          <rect x="5" y="-10" width="90" height="300" stroke="#ff9f2f" strokeWidth="2" strokeDasharray="6 4" fill="transparent" />
          <text x="5" y="-20" fill="#ff9f2f" fontSize="14" fontFamily="monospace" fontWeight="bold">under_fill 85%</text>
          <text x="100" y="160" fill="#ff9f2f" fontSize="12" fontFamily="monospace">label_torn</text>
        </g>

        {/* Bottle 3: Over Fill & Missing Label */}
        <g transform="translate(700, 140)">
          <path d="M40 0 H60 V40 H80 V280 H20 V40 H40 Z" stroke="#ff4d66" strokeWidth="3" fill="rgba(255,77,102,0.1)" />
          {/* Fluid */}
          <path d="M22 60 H78 V278 H22 Z" fill="rgba(255,77,102,0.3)" />
          {/* No Label */}
          {/* YOLO Bounding Box */}
          <rect x="5" y="-10" width="90" height="300" stroke="#ff4d66" strokeWidth="2" strokeDasharray="6 4" fill="transparent" />
          <text x="5" y="-20" fill="#ff4d66" fontSize="14" fontFamily="monospace" fontWeight="bold">over_fill 92%</text>
          <text x="100" y="160" fill="#b96cff" fontSize="12" fontFamily="monospace">label_missing</text>
        </g>
      </svg>
    </div>
  );

  // Fullscreen handling for the main inference/video container
  const panelRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement === panelRef.current);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!panelRef.current) return;
      if (document.fullscreenElement === panelRef.current) {
        await document.exitFullscreen();
      } else {
        // requestFullscreen on the container only
        // use the modern API; browsers return a promise
        await panelRef.current.requestFullscreen();
      }
    } catch (err) {
      // swallow errors silently to avoid breaking UI
      console.debug("Fullscreen toggle failed:", err);
    }
  };

  return (
    <div className="page-stack">
      <Toast message={toast} type="info" onClose={() => setToast("")} />
      
      {/* Top Header */}
      <div className="page-header relative">
        <div>
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>Real-Time QA Stream</span>
          <h1 style={{ fontWeight: 800, letterSpacing: '-1px' }}>AI Water Bottle Inspection</h1>
        </div>
        {/* Floating Notification */}
        {isStreaming && (
          <div className="absolute top-0 right-0 bg-white/90 dark:bg-[#0b101b]/90 backdrop-blur-md border border-[#17e7ff]/30 shadow-2xl px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17e7ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#17e7ff]"></span>
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">AI Video Stream started successfully.</span>
          </div>
        )}
      </div>

      <section className="inspection-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', marginTop: '1rem' }}>
        
        {/* LEFT COLUMN: Main Video Player & Controls */}
        <div className="flex flex-col gap-4">
          
          {/* Main Inference Video Panel */}
          <div ref={panelRef} className="video-panel relative w-full aspect-video rounded-2xl bg-[#020408] border border-[#17e7ff]/20 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.15)] flex items-center justify-center">
            
            {/* Real Video Feed or High-Fidelity SVG Visualizer */}
            {isStreaming ? (
              <img 
                src={`${API_URL}/video-feed?t=${streamTimestamp}`} 
                alt="AI Real-time Stream" 
                className="w-full h-full object-contain animate-fadeIn z-0 relative"
              />
            ) : (
              <SvgVisualizer />
            )}

            {/* Top Left Stats Overlay */}
            <div className="absolute top-5 left-5 flex flex-col gap-2 pointer-events-none z-10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#17e7ff]/10 border border-[#17e7ff]/30 text-[#17e7ff] font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                  {isStreaming ? (
                    <span className="w-2 h-2 rounded-full bg-[#17e7ff] animate-pulse"></span>
                  ) : null}
                  {isStreaming ? 'AI ACTIVE' : 'SYSTEM IDLE'}
                </span>
                <span className="px-3 py-1.5 rounded-md bg-black/60 border border-white/10 text-white font-mono text-xs shadow-lg backdrop-blur-sm">
                  {fps || 60} FPS
                </span>
                <span className="px-3 py-1.5 rounded-md bg-black/60 border border-white/10 text-white font-mono text-xs shadow-lg backdrop-blur-sm">
                  AVG {averageFps || 0}
                </span>
                <span className="px-3 py-1.5 rounded-md bg-black/60 border border-white/10 text-white font-mono text-xs shadow-lg backdrop-blur-sm">
                  STREAM {streamFps || 0}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded bg-[#3ee47f]/20 border border-[#3ee47f]/40 text-[#3ee47f] font-mono font-bold text-xs shadow-lg backdrop-blur-sm">
                  PASS: {stats.proper_fill}
                </span>
                <span className="px-3 py-1 rounded bg-[#ff4d66]/20 border border-[#ff4d66]/40 text-[#ff4d66] font-mono font-bold text-xs shadow-lg backdrop-blur-sm">
                  FAIL: {stats.total_bottles - stats.proper_fill}
                </span>
              </div>
            </div>

            {/* Top Right Hardware Status Overlay */}
            <div className="absolute top-5 right-5 flex items-center gap-2 pointer-events-none z-10">
              <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg ${gpuActive || !isStreaming ? 'bg-[#3ee47f]/10 border border-[#3ee47f]/30 text-[#3ee47f]' : 'bg-black/50 border border-white/10 text-[#8ba3b8]'}`}>
                GPU ACTIVE
              </span>
              <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg ${cudaActive || !isStreaming ? 'bg-[#3ee47f]/10 border border-[#3ee47f]/30 text-[#3ee47f]' : 'bg-black/50 border border-white/10 text-[#8ba3b8]'}`}>
                CUDA ACTIVE
              </span>
            </div>
            
            {/* Cinematic Letterbox Effects */}
            {/* Fullscreen Toggle Button (bottom-right inside the dark-blue container) */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="absolute z-20 bottom-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center text-[#17e7ff] bg-black/45 hover:bg-black/30 transition-transform duration-150"
              style={{ boxShadow: '0 6px 18px rgba(23,231,255,0.08), 0 0 14px rgba(23,231,255,0.08)' }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>
          </div>

          {/* Action Buttons Directly Below */}
          <div className="flex gap-4 w-full">
            <button 
              className="flex-1 font-bold shadow-lg flex items-center justify-center gap-2 min-h-[50px] rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[#17e7ff]/20 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #00b4d8, #17e7ff)', border: 'none' }}
              onClick={runInference} 
              disabled={busy || isStreaming || !file.size}
            >
              {busy ? <Loader2 className="spin" size={20} /> : <Play size={20} fill="currentColor" />}
              Start Inference
            </button>
            <button 
              className="flex-1 font-bold flex items-center justify-center gap-2 min-h-[50px] rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              style={{ border: '2px solid #ff4d66', color: '#ff4d66', background: 'rgba(255, 77, 102, 0.05)' }}
              onClick={handleStopInference} 
              disabled={!isStreaming}
            >
              <Square size={20} fill="currentColor" />
              Stop Inference
            </button>
            <button 
              className="flex-1 font-bold flex items-center justify-center gap-2 min-h-[50px] rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer" 
              onClick={handleClearDashboard}
            >
              <Trash2 size={20} />
              Clear Dashboard
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & Upload Panels */}
        <div className="flex flex-col gap-4">
          
          {/* AI DETECTION SUMMARY Panel */}
          <div className="bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur-xl border border-slate-200 dark:border-[#17e7ff]/20 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] w-full flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#17e7ff] m-0">AI Detection Summary</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3ee47f] animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ee47f]">Running</span>
              </div>
            </div>
            
            <div className="grid gap-3 text-sm font-semibold">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 dark:text-slate-300">Bottle Count</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-md">{stats.total_bottles || 0}</span>
              </div>
              
              <div className="flex justify-between items-center bg-[#3ee47f]/10 px-3 py-2 rounded-lg border border-[#3ee47f]/20">
                <span className="text-[#3ee47f]">Proper Fill</span>
                <span className="font-bold text-[#3ee47f]">{stats.proper_fill || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#ff9f2f]/10 px-3 py-2 rounded-lg border border-[#ff9f2f]/20">
                <span className="text-[#ff9f2f]">Under Fill</span>
                <span className="font-bold text-[#ff9f2f]">{stats.under_fill || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#ff4d66]/10 px-3 py-2 rounded-lg border border-[#ff4d66]/20">
                <span className="text-[#ff4d66]">Over Fill</span>
                <span className="font-bold text-[#ff4d66]">{stats.over_fill || 0}</span>
              </div>
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-1"></div>
              
              <div className="flex justify-between items-center bg-[#2f80ff]/10 px-3 py-2 rounded-lg border border-[#2f80ff]/20">
                <span className="text-[#2f80ff]">Label OK</span>
                <span className="font-bold text-[#2f80ff]">{stats.label_ok || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#ff9f2f]/10 px-3 py-2 rounded-lg border border-[#ff9f2f]/20">
                <span className="text-[#ff9f2f]">Label Torn</span>
                <span className="font-bold text-[#ff9f2f]">{stats.label_torn || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#b96cff]/10 px-3 py-2 rounded-lg border border-[#b96cff]/20">
                <span className="text-[#b96cff]">Label Missing</span>
                <span className="font-bold text-[#b96cff]">{stats.label_missing || 0}</span>
              </div>
            </div>
          </div>

          {/* File Upload Card */}
          <aside className="bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/mp4,video/x-m4v,video/*" 
              style={{ display: "none" }} 
            />
            <div 
              className="w-full border-2 border-dashed border-[#17e7ff]/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#17e7ff]/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#00b4d8] mb-1 pointer-events-none">
                <FileVideo size={24} />
              </div>
              <p className="text-sm font-bold text-[#17e7ff] m-0 mt-2">Click to Upload Video</p>
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-white m-0 text-lg mt-2 truncate">{file.name}</h3>
            {file.size > 0 && <p className="text-sm font-semibold text-slate-500 m-0">{(file.size / 1024 / 1024).toFixed(1)} MB</p>}
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 mt-1 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed m-0">
                <strong className="text-slate-700 dark:text-slate-300">GPU Acceleration:</strong> NVIDIA CUDA Cores Enabled.<br/>
                Processing target: 30–60 FPS.
              </p>
            </div>
            
            <div className="w-full mt-2">
              <div className="text-xs text-[#00b4d8] font-bold uppercase tracking-wider mb-2 flex justify-between">
                <span>{isStreaming ? 'Processing Stream...' : 'Idle - Ready'}</span>
                <span>{isStreaming ? '100%' : '0%'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00b4d8] to-[#17e7ff] transition-all duration-1000 ease-in-out" 
                  style={{ width: isStreaming ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
          </aside>

        </div>
      </section>
    </div>
  );
}

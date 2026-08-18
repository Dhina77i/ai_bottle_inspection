import { Camera, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ActionCards() {
  return (
    <div className="action-grid">
      <motion.div whileHover={{ y: -6 }} className="action-card">
        <UploadCloud size={34} />
        <div>
          <h3>Upload Video</h3>
          <p>Drop MP4, AVI, MOV, or MKV footage and process it with YOLO inference.</p>
        </div>
        <Link to="/app/upload" className="button primary">Open Upload</Link>
      </motion.div>
      <motion.div whileHover={{ y: -6 }} className="action-card">
        <Camera size={34} />
        <div>
          <h3>Live Camera</h3>
          <p>Stream webcam frames to the backend for real-time annotated predictions.</p>
        </div>
        <Link to="/app/live" className="button primary">Start Live</Link>
      </motion.div>
    </div>
  );
}

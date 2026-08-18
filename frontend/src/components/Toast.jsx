export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  return (
    <div className={`toast ${type}`} role="status">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Close notification">x</button>
    </div>
  );
}

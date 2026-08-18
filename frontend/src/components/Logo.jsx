import logoUrl from '../assets/logo.png';

export default function Logo({ compact = false }) {
  return (
    <div className={`sidebar-logo ${compact ? "compact" : ""}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: compact ? '0' : '0.5rem 0',
      userSelect: 'none'
    }}>
      <img 
        src={logoUrl} 
        alt="SeeWise Logo" 
        style={{ 
          height: compact ? '24px' : '40px', 
          width: 'auto',
          filter: 'drop-shadow(0 0 16px rgba(0, 191, 255, 0.4))'
        }} 
      />
    </div>
  );
}


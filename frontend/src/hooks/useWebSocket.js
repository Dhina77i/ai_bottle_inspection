import { useEffect, useState } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = () => setStatus('connected');
    websocket.onclose = () => setStatus('disconnected');
    websocket.onerror = () => setStatus('error');
    websocket.onmessage = (event) => setData(JSON.parse(event.data));

    setWs(websocket);

    return () => websocket.close();
  }, [url]);

  return { data, status, ws };
};

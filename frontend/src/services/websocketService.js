export const websocketService = {
  connect: (url) => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(url);
        ws.onopen = () => resolve(ws);
        ws.onerror = () => reject(new Error('WebSocket connection failed'));
      } catch (error) {
        reject(error);
      }
    });
  },

  disconnect: (ws) => {
    if (ws) {
      ws.close();
    }
  },

  subscribe: (ws, callback) => {
    ws.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };
  },
};

export default websocketService;

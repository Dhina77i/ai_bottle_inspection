import { useState, useEffect } from 'react';

export const useInference = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const processVideo = async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inference/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, results, error, processVideo };
};

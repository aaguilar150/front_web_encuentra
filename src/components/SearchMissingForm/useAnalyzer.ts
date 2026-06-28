import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

const TOTAL_MS = 10_000;

function getStep(pct: number): string {
  if (pct < 20) return 'Normalizando imagen...';
  if (pct < 45) return 'Extrayendo rasgos faciales...';
  if (pct < 70) return 'Consultando base de datos...';
  return 'Comparando coincidencias...';
}

export function useAnalyzer() {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const isAnalyzing = analysisProgress > 0 && analysisProgress < 100;

  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(tickRef.current), []);

  const analysisStep = useMemo(() => {
    if (!isAnalyzing && analysisProgress === 0) return '';
    if (analysisProgress >= 100) return 'Búsqueda completada.';
    return getStep(analysisProgress);
  }, [isAnalyzing, analysisProgress]);

  const runSearch = useCallback(async <T>(work: () => Promise<T>): Promise<T> => {
    clearInterval(tickRef.current);
    setAnalysisProgress(0);

    const startTime = Date.now();
    let done = false;

    tickRef.current = setInterval(() => {
      if (done) return;
      const pct = Math.min(95, ((Date.now() - startTime) / TOTAL_MS) * 100);
      setAnalysisProgress(Math.round(pct));
    }, 100);

    try {
      const result = await work();
      done = true;
      clearInterval(tickRef.current);
      setAnalysisProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisProgress(0);
      return result;
    } catch (err) {
      done = true;
      clearInterval(tickRef.current);
      setAnalysisProgress(0);
      throw err;
    }
  }, []);

  return { isAnalyzing, analysisProgress, analysisStep, runSearch };
}

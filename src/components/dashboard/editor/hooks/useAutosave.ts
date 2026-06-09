import { useEffect, useRef, useState, useCallback } from 'react';

export type AutosaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveOptions {
  interval?: number;
  onSave: () => Promise<void>;
  enabled?: boolean;
}

export function useAutosave({ interval = 15000, onSave, enabled = true }: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const markUnsaved = useCallback(() => {
    setStatus('unsaved');
  }, []);

  const saveNow = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setStatus('saving');
    try {
      await onSaveRef.current();
      setStatus('saved');
      setLastSaved(new Date());
    } catch {
      setStatus('error');
    } finally {
      pendingRef.current = false;
    }
  }, []);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      if (status === 'unsaved' && !pendingRef.current) {
        saveNow();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval, status, saveNow]);

  return { status, lastSaved, markUnsaved, saveNow };
}

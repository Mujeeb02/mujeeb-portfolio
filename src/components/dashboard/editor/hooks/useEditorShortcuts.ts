import { useEffect } from 'react';

interface ShortcutHandlers {
  onSaveDraft: () => void;
  onPublish: () => void;
  onToggleCommandPalette?: () => void;
  onToggleFocusMode?: () => void;
  onToggleFullscreen?: () => void;
}

export function useEditorShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+S → Save Draft
      if (isCtrl && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handlers.onSaveDraft();
      }

      // Ctrl+Shift+P → Publish
      if (isCtrl && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        handlers.onPublish();
      }

      // Ctrl+/ → Command Palette
      if (isCtrl && e.key === '/') {
        e.preventDefault();
        handlers.onToggleCommandPalette?.();
      }

      // Ctrl+Shift+F → Focus Mode
      if (isCtrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handlers.onToggleFocusMode?.();
      }

      // F11 → Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        handlers.onToggleFullscreen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

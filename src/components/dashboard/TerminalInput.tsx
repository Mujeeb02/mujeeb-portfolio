import { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  onCommand: (command: string) => void;
  suggestions: string[];
  history: string[];
  disabled?: boolean;
}

export const TerminalInput = ({ onCommand, suggestions, history, disabled }: TerminalInputProps) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredSuggestions = input 
    ? suggestions.filter(s => s.toLowerCase().startsWith(input.toLowerCase()))
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onCommand(input.trim());
      setInput('');
      setHistoryIndex(-1);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setInput(filteredSuggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      {/* Autocomplete suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded p-2 max-h-32 overflow-y-auto">
          {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
            <div
              key={i}
              className="text-muted-foreground hover:text-primary cursor-pointer px-2 py-1"
              onClick={() => {
                setInput(suggestion);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-primary font-bold">admin@portfolio</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-cyan-400">~</span>
        <span className="text-muted-foreground">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-foreground caret-primary font-mono"
          placeholder="Type 'help' for available commands..."
          autoComplete="off"
          spellCheck={false}
        />
        <span className="animate-blink text-primary">█</span>
      </form>
    </div>
  );
};

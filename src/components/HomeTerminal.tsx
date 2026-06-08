"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalWindow } from './TerminalWindow';

interface OutputLine {
  id: number;
  type: 'command' | 'output' | 'error' | 'success' | 'ascii';
  content: string;
}

const COMMANDS = {
  help: `
Available commands:
  help          - Show this help message
  about         - Navigate to about page
  projects      - Navigate to projects page
  blog          - Navigate to blog page
  contact       - Navigate to contact page
  admin         - Go to admin dashboard
  skills        - Display my skills
  whoami        - About me
  socials       - Show social links
  clear         - Clear terminal
  matrix        - Toggle matrix effect
  neofetch      - System information
  echo [text]   - Print text
  date          - Show current date
  history       - Show command history
`,
  whoami: `
┌─────────────────────────────────────────┐
│  Mujeeburrahman                         │
│  Full Stack Developer @ Buildby         │
│  B.E. Computer Science | CGPA: 7.88     │
│  530+ DSA Problems Solved on LeetCode   │
└─────────────────────────────────────────┘
`,
  skills: `
  ╔══════════════════════════════════════════╗
  ║  TECHNICAL SKILLS                        ║
  ╠══════════════════════════════════════════╣
  ║  Frontend  : React, TypeScript, Next.js  ║
  ║  Backend   : Node.js, Express.js, APIs   ║
  ║  Database  : MongoDB, PostgreSQL, Redis  ║
  ║  DevOps    : Docker, Git, CI/CD, Vercel  ║
  ║  Security  : JWT, OAuth, Firebase, RBAC  ║
  ╚══════════════════════════════════════════╝
`,
  socials: `
  ┌──────────────────────────────────────────┐
  │  GitHub   : github.com/Mujeeb02         │
  │  LinkedIn : linkedin.com/in/mujeeburrahman│
  │  LeetCode : leetcode.com/mjbshahid      │
  │  Email    : mjbshahid9919@gmail.com     │
  └──────────────────────────────────────────┘
`,
  neofetch: `
       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
       █                         █    mujeeburrahman@portfolio
       █   ██   ██   ▄▄▄▄▄▄▄    █    -------------------------
       █   ██   ██   ██   ██    █    OS: Portfolio v2.0
       █   ███████   ██   ██    █    Host: Buildby Labs
       █   ██   ██   ██   ██    █    Kernel: React 18 + TypeScript
       █   ██   ██   ▀▀▀▀▀▀▀    █    Shell: Next.js 14
       █                         █    Terminal: xterm-256color
       ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    Theme: Cyberpunk Dark
                                      Location: SidharthaNagar, UP
`,
};

const NAVIGATION_COMMANDS = ['about', 'projects', 'blog', 'contact', 'admin'];

export const HomeTerminal = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 0, type: 'output', content: 'Welcome to HackerOS Terminal v2.0' },
    { id: 1, type: 'success', content: 'Type "help" to see available commands' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const outputIdRef = useRef(2);

  const allCommands = [...Object.keys(COMMANDS), ...NAVIGATION_COMMANDS, 'clear', 'date', 'history', 'echo', 'matrix'];

  const filteredSuggestions = input.trim()
    ? allCommands.filter(cmd => cmd.startsWith(input.trim().toLowerCase()))
    : [];

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (type: OutputLine['type'], content: string) => {
    setOutput(prev => [...prev, { id: outputIdRef.current++, type, content }]);
  };

  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const [command, ...args] = trimmedCmd.split(' ');

    addOutput('command', `$ ${cmd}`);

    if (NAVIGATION_COMMANDS.includes(command)) {
      addOutput('success', `Navigating to /${command}...`);
      setTimeout(() => {
        router.push(command === 'admin' ? '/login' : `/${command}`);
      }, 500);
      return;
    }

    switch (command) {
      case 'help':
      case 'whoami':
      case 'skills':
      case 'socials':
      case 'neofetch':
        addOutput('ascii', COMMANDS[command as keyof typeof COMMANDS]);
        break;
      case 'clear':
        setOutput([]);
        break;
      case 'date':
        addOutput('output', new Date().toLocaleString());
        break;
      case 'history':
        if (history.length === 0) {
          addOutput('output', 'No commands in history');
        } else {
          addOutput('output', history.map((h, i) => `  ${i + 1}  ${h}`).join('\n'));
        }
        break;
      case 'echo':
        addOutput('output', args.join(' ') || '');
        break;
      case 'matrix':
        addOutput('success', 'Matrix rain toggled! (Check background)');
        document.body.classList.toggle('matrix-active');
        break;
      case '':
        break;
      default:
        addOutput('error', `Command not found: ${command}. Type "help" for available commands.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory(prev => [...prev, input]);
      processCommand(input);
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Animated border glow wrapper */}
      <motion.div
        className="relative p-[2px] rounded-lg"
        animate={{
          boxShadow: [
            '0 0 20px hsl(var(--neon-green) / 0.2)',
            '0 0 40px hsl(var(--neon-green) / 0.4)',
            '0 0 20px hsl(var(--neon-green) / 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--neon-green) / 0.5), transparent, hsl(var(--neon-yellow) / 0.5))',
        }}
      >
        <TerminalWindow title="guest@portfolio:~ [interactive]" className="cursor-text" showControls>
          <div
            ref={outputRef}
            onClick={focusInput}
            className="h-[300px] md:h-[350px] overflow-y-auto space-y-1 font-mono text-sm scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          >
            <AnimatePresence>
              {output.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`whitespace-pre-wrap ${line.type === 'command' ? 'text-foreground' :
                    line.type === 'error' ? 'text-destructive' :
                      line.type === 'success' ? 'text-primary' :
                        line.type === 'ascii' ? 'text-secondary' :
                          'text-muted-foreground'
                    }`}
                >
                  {line.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input line */}
            <div className="relative pt-2">
              {/* Autocomplete suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded p-2 max-h-32 overflow-y-auto z-10">
                  {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
                    <div
                      key={i}
                      className="text-muted-foreground hover:text-primary cursor-pointer px-2 py-1 text-sm"
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
                <span className="text-primary font-bold">guest</span>
                <span className="text-muted-foreground">@</span>
                <span className="text-secondary">portfolio</span>
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
                  className="flex-1 bg-transparent border-none outline-none text-foreground caret-primary font-mono"
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
                <span className="animate-blink text-primary">█</span>
              </form>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>

      {/* Quick command hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex flex-wrap justify-center gap-2"
      >
        {['help', 'about', 'projects', 'skills'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
            className="px-3 py-1 text-xs font-mono border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200 bg-card/30"
          >
            {cmd}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
};

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TerminalWindow } from '@/components/TerminalWindow';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Terminal, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup';

const Login = () => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toISOString()}] System initialized`,
    '[INFO] Secure authentication required',
  ]);
  const { isAuthenticated, signIn, signUp, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, loading, router]);

  const log = (m: string) => setLogs((p) => [...p, m]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    log(`> ${mode === 'signin' ? 'signin' : 'signup'} ${email}`);
    log('  [PROCESSING] Authenticating...');

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    if (result.success) {
      log('  [SUCCESS] Authentication successful');
      if (mode === 'signup') {
        toast.success('Account created — check your inbox if email confirmation is required.');
        log('  [INFO] If email confirmation is enabled, verify before signing in.');
      } else {
        log('  [REDIRECT] Navigating to dashboard...');
        router.push('/dashboard');
      }
    } else {
      log(`  [ERROR] ${result.error}`);
      toast.error(result.error ?? 'Authentication failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Site</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-mono">Secure Login</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-mono">256-bit SSL Encryption Active</span>
          </div>

          <TerminalWindow title="secure-login@system:~" className="border-primary/50">
            <div className="font-mono text-sm space-y-2">
              <pre className="text-primary text-xs mb-4 overflow-x-auto">
{`╔═══════════════════════════════════════════════════════════╗
║                    TERMINAL ACCESS v3.0                   ║
╚═══════════════════════════════════════════════════════════╝`}
              </pre>

              {logs.map((l, i) => (
                <p key={i} className={
                  l.includes('[ERROR]') ? 'text-destructive' :
                  l.includes('[SUCCESS]') ? 'text-primary' :
                  l.includes('[WARN]') ? 'text-yellow-500' :
                  l.includes('[PROCESSING]') ? 'text-cyan-400' :
                  'text-muted-foreground'
                }>{l}</p>
              ))}

              <div className="border-t border-border/30 my-3" />

              <div className="flex gap-2 mb-4">
                <Button
                  type="button" variant={mode === 'signin' ? 'outline' : 'ghost'} size="sm"
                  onClick={() => setMode('signin')}
                >Sign In</Button>
                <Button
                  type="button" variant={mode === 'signup' ? 'outline' : 'ghost'} size="sm"
                  onClick={() => setMode('signup')}
                >Sign Up</Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Display name (optional)</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="your handle" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Email</label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Password</label>
                  <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
            </div>
          </TerminalWindow>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Secure Auth', desc: 'Powered by Cloud' },
              { icon: Terminal, label: 'Terminal UI', desc: 'Hacker aesthetic' },
              { icon: Lock, label: 'Session Mgmt', desc: 'Auto refresh' },
            ].map((feature) => (
              <div key={feature.label} className="p-3 rounded-lg bg-card/30 border border-border/30 text-center">
                <feature.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">{feature.label}</p>
                <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-border/30 py-4 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Dashboard v3.0 | All access attempts are logged and monitored
        </p>
      </footer>
    </div>
  );
};

export default Login;

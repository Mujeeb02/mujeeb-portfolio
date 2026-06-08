import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Bell, Shield, Palette, Globe, Save, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, icon: Icon, children }: SettingsSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-lg bg-card/50 border border-border/50"
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="p-2 rounded-lg bg-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-4 pl-12">{children}</div>
  </motion.div>
);

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const ToggleSetting = ({ label, description, checked, onChange }: ToggleProps) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  notify_new_contact: boolean;
  notify_new_like: boolean;
  notify_new_review: boolean;
}

const DEFAULTS: NotificationSettings = {
  email_notifications: true,
  push_notifications: false,
  weekly_digest: true,
  notify_new_contact: true,
  notify_new_like: true,
  notify_new_review: true,
};

export const SettingsPanel = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: ns }, { data: profile }] = await Promise.all([
      supabase.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    ]);
    if (ns) setSettings({
      email_notifications: ns.email_notifications,
      push_notifications: ns.push_notifications,
      weekly_digest: ns.weekly_digest,
      notify_new_contact: ns.notify_new_contact,
      notify_new_like: ns.notify_new_like,
      notify_new_review: ns.notify_new_review,
    });
    setDisplayName(profile?.display_name ?? user.email?.split('@')[0] ?? '');
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const [{ error: nsErr }, { error: pErr }] = await Promise.all([
      supabase.from('notification_settings').upsert({ user_id: user.id, ...settings }, { onConflict: 'user_id' }),
      supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id),
    ]);
    setSaving(false);
    if (nsErr || pErr) {
      toast.error(nsErr?.message ?? pErr?.message ?? 'Failed to save');
      return;
    }
    toast.success('Settings saved');
  };

  const update = <K extends keyof NotificationSettings>(key: K) => (value: boolean) => {
    setSettings((p) => ({ ...p, [key]: value }));
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground font-mono">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-secondary">{'>'}</span> Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, profile, and notification preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reload
          </Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <SettingsSection title="Profile" description="Your public display name" icon={User}>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-2">Signed in as <span className="font-mono text-foreground">{user?.email}</span></p>
          </div>
        </SettingsSection>

        <SettingsSection title="Notifications" description="What you get notified about" icon={Bell}>
          <ToggleSetting
            label="New contact messages"
            description="Notify me when someone submits the portfolio contact form"
            checked={settings.notify_new_contact}
            onChange={update('notify_new_contact')}
          />
          <ToggleSetting
            label="New likes"
            description="Notify me when someone likes a blog post or project"
            checked={settings.notify_new_like}
            onChange={update('notify_new_like')}
          />
          <ToggleSetting
            label="New reviews"
            description="Notify me when someone posts a project review"
            checked={settings.notify_new_review}
            onChange={update('notify_new_review')}
          />
          <div className="h-px bg-border/40 my-2" />
          <ToggleSetting
            label="Email notifications"
            description="Email me a copy of important updates (requires email delivery setup)"
            checked={settings.email_notifications}
            onChange={update('email_notifications')}
          />
          <ToggleSetting
            label="Push notifications"
            description="Browser push notifications when supported"
            checked={settings.push_notifications}
            onChange={update('push_notifications')}
          />
          <ToggleSetting
            label="Weekly digest"
            description="A weekly summary of views, likes and contacts"
            checked={settings.weekly_digest}
            onChange={update('weekly_digest')}
          />
        </SettingsSection>

        <SettingsSection title="Security" description="Account access" icon={Shield}>
          <div className="text-sm text-muted-foreground">
            Sign in is managed by your authentication provider. Use the auth flow to change your password.
          </div>
        </SettingsSection>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-lg bg-muted/20 border border-border/30"
        >
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Current session
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account</p>
              <p className="text-foreground font-mono truncate">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loaded at</p>
              <p className="text-foreground font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

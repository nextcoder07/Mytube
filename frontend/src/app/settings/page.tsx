'use client';
// frontend/src/app/settings/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  TrashIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';

/** Mask an API key for display, showing first 8 and last 4 chars */
function maskKey(key: string): string {
  if (key.length <= 12) return '•'.repeat(key.length);
  return key.substring(0, 8) + '•'.repeat(Math.min(key.length - 12, 20)) + key.substring(key.length - 4);
}

/** Parse a comma-separated key string into individual keys */
function parseKeys(raw: string): string[] {
  return raw
    .split(/[,;\n\r]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

interface ApiKeyConfig {
  id: string;
  label: string;
  description: string;
  dbField: 'user_youtube_api_keys' | 'user_github_api_keys';
  placeholder: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  hintUrl?: string;
  hintLabel?: string;
}

const API_CONFIGS: ApiKeyConfig[] = [
  {
    id: 'youtube',
    label: 'YouTube Data API v3',
    description: 'Used for searching YouTube videos, channels, and fetching metadata. Each key gets ~10,000 units/day.',
    dbField: 'user_youtube_api_keys',
    placeholder: 'AIzaSy..., AIzaSy...',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    gradient: 'from-red-500/20 to-red-600/5',
    borderColor: 'border-red-500/30',
    hintUrl: 'https://console.cloud.google.com/apis/credentials',
    hintLabel: 'Google Cloud Console',
  },
  {
    id: 'github',
    label: 'GitHub Personal Access Token',
    description: 'Used for searching repositories and user profiles. Authenticated requests get 5,000 req/hr vs 60 unauthenticated.',
    dbField: 'user_github_api_keys',
    placeholder: 'ghp_xxxx..., ghp_yyyy...',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
    gradient: 'from-gray-400/20 to-gray-600/5',
    borderColor: 'border-gray-500/30',
    hintUrl: 'https://github.com/settings/tokens',
    hintLabel: 'GitHub Settings → Tokens',
  },
];

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  // API keys state — keyed by config id
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [keyVisibility, setKeyVisibility] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { token } = useAuthStore();

  // Fetch profile on mount to populate existing keys
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    try {
      const res = await api.get('/user');
      const profile = res.data?.data?.profile;
      if (profile) {
        const initial: Record<string, string> = {};
        for (const cfg of API_CONFIGS) {
          initial[cfg.id] = profile[cfg.dbField] || '';
        }
        setKeyValues(initial);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch profile for settings:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Save a specific API key configuration
  const handleSave = async (config: ApiKeyConfig) => {
    if (!token) return;

    setSaveStatus((prev) => ({ ...prev, [config.id]: 'saving' }));
    setSaveErrors((prev) => ({ ...prev, [config.id]: '' }));

    try {
      await api.put('/user', { [config.dbField]: keyValues[config.id] || '' });
      setSaveStatus((prev) => ({ ...prev, [config.id]: 'saved' }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [config.id]: 'idle' }));
      }, 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosError?.response?.data?.message || axiosError?.message || 'Failed to save';
      setSaveErrors((prev) => ({ ...prev, [config.id]: msg }));
      setSaveStatus((prev) => ({ ...prev, [config.id]: 'error' }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [config.id]: 'idle' }));
      }, 5000);
    }
  };

  const Toggle = ({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) => (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  const parsedKeyCounts: Record<string, number> = {};
  for (const cfg of API_CONFIGS) {
    parsedKeyCounts[cfg.id] = parseKeys(keyValues[cfg.id] || '').length;
  }

  return (
    <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account, API keys, and preferences.</p>
      </div>

      {/* ─── API Configuration ─── */}
      <section className="glow-card p-5 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-amber-400" /> API Configuration
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Add your own API keys to bypass shared rate limits. Separate multiple keys with commas for automatic rotation.
          </p>
        </div>

        {!token && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">Sign in to manage your API keys.</p>
          </div>
        )}

        {token && loadingProfile && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-gray-400">Loading your API keys…</span>
          </div>
        )}

        {token && !loadingProfile && API_CONFIGS.map((cfg) => {
          const status = saveStatus[cfg.id] || 'idle';
          const error = saveErrors[cfg.id] || '';
          const keyCount = parsedKeyCounts[cfg.id];
          const isVisible = keyVisibility[cfg.id] || false;
          const rawValue = keyValues[cfg.id] || '';

          return (
            <div
              key={cfg.id}
              className={`rounded-xl border ${cfg.borderColor} bg-gradient-to-br ${cfg.gradient} p-4 space-y-3 transition-all hover:border-opacity-60`}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="text-white/80">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white">{cfg.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cfg.description}</p>
                </div>
                {keyCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                    {keyCount} key{keyCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Input */}
              <div className="relative">
                <textarea
                  id={`api-key-input-${cfg.id}`}
                  rows={2}
                  value={isVisible ? rawValue : rawValue ? parseKeys(rawValue).map(maskKey).join(', ') : ''}
                  onChange={(e) => {
                    // Only allow editing in visible mode
                    if (!isVisible) {
                      setKeyVisibility((prev) => ({ ...prev, [cfg.id]: true }));
                      return;
                    }
                    setKeyValues((prev) => ({ ...prev, [cfg.id]: e.target.value }));
                  }}
                  onFocus={() => {
                    if (!isVisible && rawValue) {
                      setKeyVisibility((prev) => ({ ...prev, [cfg.id]: true }));
                    }
                  }}
                  placeholder={cfg.placeholder}
                  className="w-full px-3 py-2.5 text-sm bg-black/30 border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 resize-none font-mono transition-all"
                  spellCheck={false}
                  autoComplete="off"
                />
                {rawValue && (
                  <button
                    type="button"
                    onClick={() => setKeyVisibility((prev) => ({ ...prev, [cfg.id]: !isVisible }))}
                    className="absolute top-2.5 right-2.5 text-gray-500 hover:text-gray-300 transition-colors"
                    title={isVisible ? 'Hide keys' : 'Show keys'}
                  >
                    {isVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Hint link */}
              {cfg.hintUrl && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                  Get keys at{' '}
                  <a
                    href={cfg.hintUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
                  >
                    {cfg.hintLabel}
                  </a>
                </p>
              )}

              {/* Actions & status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-h-[24px]">
                  {status === 'saved' && (
                    <span className="flex items-center gap-1 text-xs text-green-400 animate-fadeIn">
                      <CheckCircleIcon className="w-4 h-4" /> Saved successfully
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="flex items-center gap-1 text-xs text-red-400 animate-fadeIn">
                      <ExclamationTriangleIcon className="w-4 h-4" /> {error}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {rawValue && (
                    <button
                      type="button"
                      onClick={async () => {
                        setKeyValues((prev) => ({ ...prev, [cfg.id]: '' }));
                        if (!token) return;
                        setSaveStatus((prev) => ({ ...prev, [cfg.id]: 'saving' }));
                        try {
                          await api.put('/user', { [cfg.dbField]: '' });
                          setSaveStatus((prev) => ({ ...prev, [cfg.id]: 'saved' }));
                          setTimeout(() => setSaveStatus((prev) => ({ ...prev, [cfg.id]: 'idle' })), 3000);
                        } catch (err: unknown) {
                          const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
                          setSaveErrors((prev) => ({ ...prev, [cfg.id]: axiosError?.response?.data?.message || axiosError?.message || 'Failed to clear' }));
                          setSaveStatus((prev) => ({ ...prev, [cfg.id]: 'error' }));
                          setTimeout(() => setSaveStatus((prev) => ({ ...prev, [cfg.id]: 'idle' })), 5000);
                        }
                      }}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    id={`save-api-key-${cfg.id}`}
                    type="button"
                    onClick={() => handleSave(cfg)}
                    disabled={status === 'saving'}
                    className="px-4 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-1.5"
                  >
                    {status === 'saving' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Rotation info */}
        {token && !loadingProfile && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300/80 space-y-1">
              <p><strong>How rotation works:</strong> When one key hits its rate limit, the system automatically switches to the next key in a cyclic fashion. Exhausted keys are retried after a 1-hour cooldown.</p>
              <p>Keys for AI features (Gemini) are managed server-side and don&apos;t need to be added here.</p>
            </div>
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="glow-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-violet-400" /> Notifications
        </h2>
        {[
          { id: 'toggle-email', label: 'Email notifications', checked: emailNotifs, fn: () => setEmailNotifs((v) => !v) },
          { id: 'toggle-streak', label: 'Streak reminders', checked: streakReminders, fn: () => setStreakReminders((v) => !v) },
        ].map(({ id, label, checked, fn }) => (
          <div key={id} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{label}</span>
            <Toggle id={id} checked={checked} onChange={fn} />
          </div>
        ))}
      </section>

      {/* Appearance */}
      <section className="glow-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <PaintBrushIcon className="w-5 h-5 text-pink-400" /> Appearance
        </h2>
        <p className="text-sm text-gray-400">Dark mode is always on — Mytube is built for night owls. 🌙</p>
      </section>

      {/* Privacy */}
      <section className="glow-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400" /> Privacy
        </h2>
        <p className="text-sm text-gray-400">Your data is never sold. AI results are cached server-side only.</p>
      </section>

      {/* Danger zone */}
      <section className="glow-card p-5 border border-red-500/20">
        <h2 className="text-base font-semibold text-red-400 flex items-center gap-2 mb-3">
          <TrashIcon className="w-5 h-5" /> Danger Zone
        </h2>
        <button id="delete-account-btn" className="px-4 py-2 text-sm bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition">
          Delete Account
        </button>
      </section>
    </main>
  );
}

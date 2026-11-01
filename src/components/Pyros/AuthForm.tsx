import { useEffect, useState } from 'preact/hooks';
import { supabase } from '~/lib/supabase';
import { Eye, EyeOff } from 'lucide-preact';

export default function AuthForm() {
  const getSafeRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    if (!redirect) {
      return '/dashboard';
    }

    try {
      const url = new URL(redirect, window.location.origin);

      const allowedHosts = [window.location.host, 'shop.pyrosaicreative.com'];

      if (!allowedHosts.includes(url.host)) {
        return '/dashboard';
      }

      return url.toString();
    } catch {
      return '/dashboard';
    }
  };
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.location.replace(getSafeRedirect());
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleSubmit() {
    setMessage('');

    console.log('handleSubmit');

    if (!email.trim()) {
      setMessageType('error');
      return setMessage('Please enter your email.');
    }

    if (!password.trim()) {
      setMessageType('error');
      return setMessage('Please enter your password.');
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        setMessageType('error');
        return setMessage('Password must be at least 8 characters.');
      }

      if (password !== confirmPassword) {
        setMessageType('error');
        return setMessage('Passwords do not match.');
      }

      setLoading(true);

      console.log('Calling signUp...');

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(getSafeRedirect())}`,
          data: {
            newsletter_consent: newsletterConsent,
            newsletter_consent_at: newsletterConsent ? new Date().toISOString() : null,
          },
        },
      });

      console.log(error);

      setLoading(false);

      if (error) {
        setMessageType('error');
        return setMessage(error.message);
      }

      setMessageType('success');
      setMessage('Account created. Please check your email.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessageType('error');
      return setMessage(error.message);
    }

    window.location.href = getSafeRedirect();
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setMessageType('error');
      setMessage('Enter your email first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      setMessageType('error');
      setMessage(error.message);
      return;
    }

    setMessageType('success');
    setMessage('Password reset email sent.');
  }

  if (checkingSession) {
    return <div className="flex min-h-[360px] items-center justify-center bg-black text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="overflow-hidden rounded-md border border-white/10 bg-[#111111] shadow-2xl shadow-black/60">
        <div className="grid lg:grid-cols-[42%_58%]">
          {/* LEFT */}

          <div className="border-b border-white/10 bg-[#0d0d0d] px-6 py-7 sm:px-8 lg:border-r lg:border-b-0">
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Welcome to
              <span className="mt-2 block text-[#D0AF81]">PYROS AI Creative</span>
            </h1>

            <p className="mt-4 max-w-sm text-[15px] leading-7 text-gray-400">
              Sign in or create an account to access free AI filmmaking guides.
            </p>

            <div className="mt-6 space-y-3">
              {['Unlock free content'].map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="text-[#B08A57]">✓</span>
                  <span className="text-[15px] text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}

          <div className="px-6 py-7 sm:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* Tabs */}

              <div className="flex rounded-md bg-[#1b1b1b] p-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setMode('signin');
                    setMessage('');
                    setMessageType('error');
                    setConfirmPassword('');
                  }}
                  className={`flex-1 rounded-lg py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                    mode === 'signin' ? 'bg-[#B08A57] text-[#090909]' : 'text-gray-400'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setMode('signup');
                    setMessage('');
                    setMessageType('error');
                  }}
                  className={`flex-1 rounded-lg py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                    mode === 'signup' ? 'bg-[#B08A57] text-[#090909]' : 'text-gray-400'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email */}

              <div className="mt-8">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  disabled={loading}
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                  className="h-12 w-full rounded-md border border-white/10 bg-black px-4 text-[15px] text-white outline-none transition focus:border-[#B08A57] focus:ring-2 focus:ring-[#B08A57]/30 disabled:opacity-60"
                />
              </div>

              {/* Password */}

              <div className="mt-5">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    className="h-12 w-full rounded-md border border-white/10 bg-black px-4 pr-12 text-[15px] text-white outline-none transition focus:border-[#B08A57] focus:ring-2 focus:ring-[#B08A57]/30 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}

              {mode === 'signup' && (
                <>
                  <p className="mt-2 text-xs text-gray-400">Minimum 8 characters.</p>

                  <div className="mt-5">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        disabled={loading}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                        className="h-12 w-full rounded-md border border-white/10 bg-black px-4 pr-12 text-[15px] text-white outline-none transition focus:border-[#B08A57] focus:ring-2 focus:ring-[#B08A57]/30 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Forgot */}

              {mode === 'signin' && (
                <div className="mt-3 text-right">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={forgotPassword}
                    className="text-xs text-gray-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {mode === 'signup' && (
                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    disabled={loading}
                    onChange={(e) => setNewsletterConsent((e.target as HTMLInputElement).checked)}
                    className="mt-1 h-4 w-4 accent-[#B08A57]"
                  />

                  <span className="text-[12px] leading-5 text-gray-400">
                    Send me AI filmmaking tutorials, new guides and PYROS updates by email.
                  </span>
                </label>
              )}
              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-[#B08A57] text-[15px] font-semibold text-[#090909] transition hover:bg-[#C6A16A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="opacity-25" />

                      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Message */}

              {message && (
                <p
                  className={`mt-4 text-center text-sm ${
                    messageType === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {message}
                </p>
              )}

              {/* Footer */}

              <p className="mt-5 text-center text-[12px] leading-6 text-gray-400">
                By continuing you agree to our{' '}
                <a href="/terms" className="text-white transition hover:text-[#B08A57]">
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-white transition hover:text-[#B08A57]">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

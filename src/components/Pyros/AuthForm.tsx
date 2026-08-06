import { useState } from "preact/hooks";
import { supabase } from "~/lib/supabase";
import { Eye, EyeOff } from "lucide-preact";

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit() {
  setMessage("");

  console.log("handleSubmit");

  if (!email.trim()) {
    setMessageType("error");
    return setMessage("Please enter your email.");
  }

  if (!password.trim()) {
    setMessageType("error");
    return setMessage("Please enter your password.");
  }

    if (mode === "signup") {

  if (password.length < 8) {
    setMessageType("error");
    return setMessage("Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    setMessageType("error");
    return setMessage("Passwords do not match.");
  }

  setLoading(true);

  console.log("Calling signUp...");

const { error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

console.log(error);

  setLoading(false);

  if (error) {
    setMessageType("error");
    return setMessage(error.message);
  }

  setMessageType("success");
  setMessage("Account created. Please check your email.");
  return;
}

    
    setLoading(true);

const { error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

setLoading(false);

if (error) {
  setMessageType("error");
  return setMessage(error.message);
}

window.location.href = "/dashboard";
}

async function forgotPassword() {
    if (!email.trim()) {
  setMessageType("error");
  setMessage("Enter your email first.");
  return;
}

    const { error } = await supabase.auth.resetPasswordForEmail(
  email.trim()
);

if (error) {
  setMessageType("error");
  setMessage(error.message);
  return;
}

setMessageType("success");
setMessage("Password reset email sent.");
  }

  return (
  <div className="mx-auto w-full max-w-[1400px]">
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/60">
      <div className="grid lg:grid-cols-[44%_56%]">

        {/* LEFT */}

        <div className="bg-[#0d0d0d] px-12 py-10">

          <h1 className="text-[2.25rem] font-black leading-[1.05] text-white">
            Welcome to
            <span className="mt-2 block text-[#B71C1C]">
              PYROS AI Creative
            </span>
          </h1>

          <p className="mt-6 max-w-sm text-[15px] leading-7 text-gray-400">
            Join PYROS AI Creative to download free guides,
            unlock AI Guides and access future premium resources.
          </p>

          <div className="mt-10 space-y-5">

            {[
              "Download free workflow guides",
              "Access AI Guides",
              "Save your resources",
              "Unlock premium content",
            ].map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <span className="text-[#B71C1C]">✓</span>
                <span className="text-[15px] text-gray-300">
                  {item}
                </span>
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT */}

        <div className="px-12 py-10">

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >

            {/* Tabs */}

            <div className="flex rounded-xl bg-[#1b1b1b] p-1">

              <button
  type="button"
  disabled={loading}
  onClick={() => {
    setMode("signin");
    setMessage("");
    setMessageType("error");
    setConfirmPassword("");
  }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  mode === "signin"
                    ? "bg-[#B71C1C] text-white"
                    : "text-gray-400"
                }`}
              >
                Sign In
              </button>

              <button
  type="button"
  disabled={loading}
  onClick={() => {
    setMode("signup");
    setMessage("");
    setMessageType("error");
  }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  mode === "signup"
                    ? "bg-[#B71C1C] text-white"
                    : "text-gray-400"
                }`}
              >
                Create Account
              </button>

            </div>

            {/* Email */}

            <div className="mt-8">

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                Email
              </label>

              <input
                type="email"
                disabled={loading}
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onInput={(e) =>
                  setEmail((e.target as HTMLInputElement).value)
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-black px-4 text-[15px] text-white outline-none transition focus:border-[#B71C1C] focus:ring-2 focus:ring-[#B71C1C]/30 disabled:opacity-60"
              />

            </div>

            {/* Password */}

            <div className="mt-5">

              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                Password
              </label>

              <div className="relative">

  <input
    type={showPassword ? "text" : "password"}
    disabled={loading}
    autoComplete={
      mode === "signin"
        ? "current-password"
        : "new-password"
    }
    placeholder="••••••••"
    value={password}
    onInput={(e) =>
      setPassword((e.target as HTMLInputElement).value)
    }
    className="h-11 w-full rounded-xl border border-white/10 bg-black px-4 pr-12 text-[15px] text-white outline-none transition focus:border-[#B71C1C] focus:ring-2 focus:ring-[#B71C1C]/30 disabled:opacity-60"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
  >
    {showPassword ? (
  <EyeOff size={18} />
) : (
  <Eye size={18} />
)}
  </button>

</div>
</div>

  {/* Confirm Password */}

{mode === "signup" && (
  <>
    <p className="mt-2 text-xs text-gray-500">
      Minimum 8 characters.
    </p>

    <div className="mt-5">

      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
        Confirm Password
      </label>

      <div className="relative">

        <input
          type={showConfirmPassword ? "text" : "password"}
          disabled={loading}
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onInput={(e) =>
            setConfirmPassword(
              (e.target as HTMLInputElement).value
            )
          }
          className="h-11 w-full rounded-xl border border-white/10 bg-black px-4 pr-12 text-[15px] text-white outline-none transition focus:border-[#B71C1C] focus:ring-2 focus:ring-[#B71C1C]/30 disabled:opacity-60"
        />

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
        >
          {showConfirmPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  </>
)}

            {/* Forgot */}

            {mode === "signin" && (

              <div className="mt-3 text-right">

                <button
                  type="button"
                  disabled={loading}
                  onClick={forgotPassword}
                  className="text-xs text-gray-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Forgot password?
                </button>

              </div>

            )}

            {/* Submit */}

            <button
  type="submit"
  disabled={loading}
  className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#B71C1C] text-[15px] font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? (
    <>
      <svg
        className="mr-2 h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-25"
        />

        <path
          d="M21 12a9 9 0 0 1-9 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {mode === "signin"
        ? "Signing in..."
        : "Creating account..."}
    </>
  ) : (
    mode === "signin"
      ? "Sign In"
      : "Create Account"
  )}
</button>

            {/* Message */}

            {message && (
  <p
    className={`mt-4 text-center text-sm ${
      messageType === "success"
        ? "text-green-400"
        : "text-red-400"
    }`}
  >
    {message}
  </p>
)}

            {/* Footer */}

            <p className="mt-6 text-center text-[12px] leading-6 text-gray-500">

              By continuing you agree to our{" "}

              <a
                href="/terms"
                className="text-white transition hover:text-[#B71C1C]"
              >
                Terms
              </a>

              {" "}and{" "}

              <a
                href="/privacy"
                className="text-white transition hover:text-[#B71C1C]"
              >
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
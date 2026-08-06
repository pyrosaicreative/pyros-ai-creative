import { useEffect } from "preact/hooks";
import { supabase } from "~/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    async function handleCallback() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        window.location.replace("/account");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(error);
        window.location.replace("/account");
        return;
      }

      if (data.session) {
        window.location.replace("/");
      } else {
        window.location.replace("/account");
      }
    }

    handleCallback();
  }, []);

  return (
    <div class="flex min-h-screen items-center justify-center bg-black text-white">
      Completing sign in...
    </div>
  );
}
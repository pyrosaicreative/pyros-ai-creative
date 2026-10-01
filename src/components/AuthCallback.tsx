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

      const { data, error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        window.location.replace("/account");
        return;
      }

      if (!data.session) {
        window.location.replace("/account");
        return;
      }

      try {
        const { data: kitData, error: kitError } =
          await supabase.functions.invoke("subscribe-to-kit", {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });

        if (kitError) {
          console.error("Kit newsletter error:", kitError);
        } else {
          console.log("Kit newsletter result:", kitData);
        }
      } catch (error) {
        console.error("Kit newsletter unexpected error:", error);
      }

      window.location.replace("/");
    }

    handleCallback();
  }, []);

  return (
    <div class="flex min-h-screen items-center justify-center bg-black text-white">
      Completing sign in...
    </div>
  );
}
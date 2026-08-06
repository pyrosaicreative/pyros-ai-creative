import { useEffect } from "preact/hooks";
import { supabase } from "~/lib/supabase";

export default function AccountRedirect() {
  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.location.replace("/");
      }
    }

    checkSession();
  }, []);

  return null;
}
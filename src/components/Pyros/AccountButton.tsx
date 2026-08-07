import { useEffect, useState } from "preact/hooks";
import { supabase } from "~/lib/supabase";

export default function AccountButton() {
  const [href, setHref] = useState("/account");
const [label, setLabel] = useState("Sign In");

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
  setHref("/dashboard");
  setLabel("My Account");
} else {
  setHref("/account");
  setLabel("Sign In");
}
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
  setHref("/dashboard");
  setLabel("My Account");
} else {
  setHref("/account");
  setLabel("Sign In");
}
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
  <a
    href={href}
    class="ml-2 rounded-lg bg-[#8F6B3B] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9A7A49]"
  >
    {label}
  </a>
);
}
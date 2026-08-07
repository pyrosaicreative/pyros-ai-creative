import { useEffect, useState } from "preact/hooks";
import { supabase } from "~/lib/supabase";

export default function DashboardClient() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/account");
        return;
      }

      setEmail(session.user.email ?? "");
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  return (
    <>
      <p className="mt-4 text-gray-400">
        {email ? `Signed in as ${email}` : "Loading account..."}
      </p>

      <button
        onClick={handleLogout}
        className="mt-8 rounded-xl bg-[#B71C1C] px-5 py-3 font-semibold text-white transition hover:bg-[#9A7A49]"
      >
        Sign Out
      </button>
    </>
  );
}
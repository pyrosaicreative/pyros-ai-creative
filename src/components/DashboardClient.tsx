import { useEffect, useState } from 'preact/hooks';
import { supabase } from '~/lib/supabase';

export default function DashboardClient() {
  const [email, setEmail] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace('/account');
        return;
      }

      setEmail(session.user.email ?? '');
    }

    loadUser();
  }, []);

  async function handleLogout() {
    setBusy(true);
    setError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.replace('/');
    } catch {
      setError('Unable to sign out. Please try again.');
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy || confirmation !== 'DELETE') return;
    setBusy(true);
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { confirmation: 'DELETE' },
      });
      if (error || !data?.success) throw new Error('Deletion failed');
    } catch {
      setError('Unable to delete your account. Please try again or contact contact@pyrosaicreative.com.');
      setBusy(false);
      return;
    }

    // Deletion succeeded even if clearing the local session encounters an error.
    setDeleted(true);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // The server has already deleted the account and its sessions.
    }
    setBusy(false);
  }

  if (deleted) {
    return (
      <div className="mt-4" role="status">
        <p className="text-green-400">Your account has been permanently deleted.</p>
        <a href="/" className="mt-4 inline-block text-white underline">
          Return to homepage
        </a>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 text-gray-400">{email ? `Signed in as ${email}` : 'Loading account...'}</p>

      <button
        type="button"
        disabled={busy || !email}
        onClick={handleLogout}
        className="mt-8 rounded-xl bg-[#171717] px-5 py-3 font-semibold text-white transition hover:bg-[#202020] disabled:opacity-50"
      >
        Sign Out
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        {!confirmingDelete ? (
          <button
            type="button"
            disabled={busy || !email}
            onClick={() => setConfirmingDelete(true)}
            className="text-sm text-red-400 underline transition hover:text-red-300 disabled:opacity-50"
          >
            Delete account
          </button>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            <h3 className="font-semibold text-white">Permanently delete your account?</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              This deletes your website account and guide download history. This cannot be undone. Newsletter
              subscriptions and PYROS Shop orders are managed separately. To unsubscribe from the newsletter, use the
              link in any newsletter email.
            </p>
            <label htmlFor="delete-confirmation" className="mt-4 block text-sm text-gray-300">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirmation"
              value={confirmation}
              disabled={busy}
              autoComplete="off"
              onInput={(event) => setConfirmation(event.currentTarget.value)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-white focus:border-red-400"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirmingDelete(false);
                  setConfirmation('');
                  setError('');
                }}
                className="rounded-lg bg-[#202020] px-4 py-2 text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || confirmation !== 'DELETE'}
                className="rounded-lg bg-[#B71C1C] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Deleting...' : 'Permanently delete account'}
              </button>
            </div>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </>
  );
}

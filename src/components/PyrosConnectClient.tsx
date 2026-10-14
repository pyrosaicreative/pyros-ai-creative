import { useEffect, useState } from 'preact/hooks';
import { supabase } from '~/lib/supabase';

type Automation = {
  id: string;
  reel_id: string;
  keyword: string;
  guide_name: string;
  guide_url: string;
  dm_message: string;
  public_reply: string;
  is_active: boolean;
  created_at: string;
};

type AutomationForm = {
  reel_id: string;
  keyword: string;
  guide_name: string;
  guide_url: string;
  dm_message: string;
  public_reply: string;
  is_active: boolean;
};

const DEFAULT_DM = `Here's your guide!

It's completely FREE — no credit card required.

Tap the button below to get your guide.`;

const EMPTY_FORM: AutomationForm = {
  reel_id: '',
  keyword: '',
  guide_name: '',
  guide_url: '',
  dm_message: DEFAULT_DM,
  public_reply: 'Check your DMs 👀',
  is_active: false,
};

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-[#0B0B0B] px-3 py-2.5 text-white outline-none focus:border-[#C49A58]';
const labelClass = 'block text-sm font-medium text-gray-300';
const buttonClass =
  'rounded-lg bg-[#8F6B3B] px-4 py-2.5 font-semibold text-white transition hover:bg-[#A47D4A] disabled:cursor-not-allowed disabled:opacity-50';

function validateForm(form: AutomationForm): string | null {
  if (!/^\d{8,30}$/.test(form.reel_id.trim())) {
    return 'Enter the numeric Instagram Reel ID (not the Instagram URL).';
  }
  if (!/^[A-Za-z0-9_-]{1,60}$/.test(form.keyword.trim())) {
    return 'Keyword: use 1–60 letters, numbers, hyphens or underscores.';
  }
  if (!form.guide_name.trim() || form.guide_name.trim().length > 180) {
    return 'Enter a guide name (maximum 180 characters).';
  }
  try {
    const url = new URL(form.guide_url.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'shop.pyrosaicreative.com') {
      return 'Guide URL must be an HTTPS link on shop.pyrosaicreative.com.';
    }
  } catch {
    return 'Enter a valid Fourthwall guide URL.';
  }
  if (!form.dm_message.trim() || form.dm_message.length > 640) {
    return 'DM text must be between 1 and 640 characters.';
  }
  if (!form.public_reply.trim() || form.public_reply.length > 500) {
    return 'Public reply must be between 1 and 500 characters.';
  }
  return null;
}

export default function PyrosConnectClient() {
  const [access, setAccess] = useState<'loading' | 'signed-out' | 'denied' | 'allowed'>('loading');
  const [email, setEmail] = useState('');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [events, setEvents] = useState<{ automation_id: string | null; private_reply_sent: boolean; public_reply_sent: boolean }[]>([]);
  const [form, setForm] = useState<AutomationForm>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    const [automationsResult, eventsResult] = await Promise.all([
      supabase.from('instagram_automations').select('*').order('created_at', { ascending: false }),
      supabase.from('instagram_comment_events').select('automation_id,private_reply_sent,public_reply_sent').limit(1000),
    ]);
    if (automationsResult.error) throw automationsResult.error;
    if (eventsResult.error) throw eventsResult.error;
    setAutomations((automationsResult.data ?? []) as Automation[]);
    setEvents(eventsResult.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (!cancelled) setAccess('signed-out');
          return;
        }
        if (!cancelled) setEmail(user.email ?? '');
        const { data, error: accessError } = await supabase
          .from('pyros_connect_admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (accessError) throw accessError;
        if (!data) {
          if (!cancelled) setAccess('denied');
          return;
        }
        if (!cancelled) {
          setAccess('allowed');
          await refresh();
        }
      } catch {
        if (!cancelled) {
          setError('Could not verify your access. Try refreshing the page.');
          setAccess('denied');
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setNotice('');
  }

  function startEditing(item: Automation) {
    setEditingId(item.id);
    setForm({
      reel_id: item.reel_id,
      keyword: item.keyword,
      guide_name: item.guide_name,
      guide_url: item.guide_url,
      dm_message: item.dm_message,
      public_reply: item.public_reply,
      is_active: item.is_active,
    });
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event: Event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = {
      reel_id: form.reel_id.trim(),
      keyword: form.keyword.trim().toUpperCase(),
      guide_name: form.guide_name.trim(),
      guide_url: form.guide_url.trim(),
      dm_message: form.dm_message.trim(),
      public_reply: form.public_reply.trim(),
      is_active: form.is_active,
    };
    setBusy(true);
    try {
      const result = editingId
        ? await supabase.from('instagram_automations').update(payload).eq('id', editingId)
        : await supabase.from('instagram_automations').insert(payload);
      if (result.error) throw result.error;
      await refresh();
      resetForm();
      setNotice('Automation saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this automation.');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item: Automation) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: updateError } = await supabase
        .from('instagram_automations')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);
      if (updateError) throw updateError;
      await refresh();
      setNotice(item.is_active ? 'Automation disabled.' : 'Automation enabled.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change automation status.');
    } finally {
      setBusy(false);
    }
  }

  if (access === 'loading') {
    return <p className="text-gray-400">Checking PYROS Connect access…</p>;
  }

  if (access === 'signed-out') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="text-3xl font-bold text-white">PYROS Connect</h1>
        <p className="mt-4 text-gray-400">Sign in to your PYROS account to access the private dashboard.</p>
        <a href="/account" className="mt-6 inline-block rounded-lg bg-[#8F6B3B] px-5 py-3 font-semibold text-white">Sign in</a>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="text-3xl font-bold text-white">PYROS Connect</h1>
        <p className="mt-4 text-gray-400">This dashboard is restricted to authorized PYROS administrators.</p>
        {email && <p className="mt-2 text-sm text-gray-500">Signed in as {email}</p>}
        {error && <p role="alert" className="mt-3 text-red-400">{error}</p>}
      </div>
    );
  }

  const sentCount = events.filter((item) => item.private_reply_sent).length;
  const activeCount = automations.filter((item) => item.is_active).length;

  return (
    <div className="text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C49A58]">Private dashboard</p>
          <h1 className="mt-2 text-4xl font-bold">PYROS Connect</h1>
          <p className="mt-2 text-gray-400">Instagram comment-to-DM automations · {email}</p>
        </div>
        <button type="button" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10" onClick={() => void refresh().catch(() => setError('Could not refresh data.'))}>Refresh</button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-red-300">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg border border-green-500/30 bg-green-950/30 p-3 text-green-300">{notice}</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Automations', value: automations.length },
          { label: 'Active', value: activeCount },
          { label: 'Private replies recorded', value: sentCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit automation' : 'New automation'}</h2>
        <p className="mt-2 text-sm text-gray-400">
          New automations start disabled. Activate them when you are ready. The Reel ID is the numeric media ID from an Instagram webhook.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => void save(event)}>
          <label className={labelClass}>
            Reel ID (numeric)
            <input className={inputClass} required value={form.reel_id}
              onInput={(event) => setForm({ ...form, reel_id: event.currentTarget.value })}
              placeholder="18087912782181466" />
          </label>
          <label className={labelClass}>
            Keyword
            <input className={inputClass} required value={form.keyword}
              onInput={(event) => setForm({ ...form, keyword: event.currentTarget.value })}
              placeholder="CHARACTER" />
          </label>
          <label className={labelClass}>
            Guide name
            <input className={inputClass} required value={form.guide_name}
              onInput={(event) => setForm({ ...form, guide_name: event.currentTarget.value })}
              placeholder="Character Consistency Guide" />
          </label>
          <label className={labelClass}>
            Fourthwall guide URL
            <input className={inputClass} required type="url" value={form.guide_url}
              onInput={(event) => setForm({ ...form, guide_url: event.currentTarget.value })}
              placeholder="https://shop.pyrosaicreative.com/products/..." />
          </label>
          <label className={labelClass + ' md:col-span-2'}>
            DM message
            <textarea className={inputClass} rows={4} required value={form.dm_message}
              onInput={(event) => setForm({ ...form, dm_message: event.currentTarget.value })} />
            <span className="mt-1 block text-xs font-normal text-gray-500">The button 🎁 Get Free Guide opens your Fourthwall link.</span>
          </label>
          <label className={labelClass + ' md:col-span-2'}>
            Public comment reply
            <input className={inputClass} required value={form.public_reply}
              onInput={(event) => setForm({ ...form, public_reply: event.currentTarget.value })} />
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300 md:col-span-2">
            <input type="checkbox" checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.currentTarget.checked })} />
            Enable automation after saving
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" disabled={busy} className={buttonClass}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create automation'}</button>
            {editingId && <button type="button" disabled={busy} onClick={resetForm} className="rounded-lg border border-white/20 px-4 py-2.5">Cancel editing</button>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-xl font-semibold">Your automations</h2>
        {automations.length === 0 && <p className="mt-4 text-gray-400">No automations yet. Create your first one above.</p>}
        <div className="mt-5 space-y-3">
          {automations.map((item) => {
            const deliveries = events.filter((e) => e.automation_id === item.id && e.private_reply_sent).length;
            return (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">{item.guide_name}</h3>
                    <span className={item.is_active ? 'text-sm text-green-400' : 'text-sm text-gray-400'}>{item.is_active ? 'Active' : 'Disabled'}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">Keyword: <strong className="text-white">{item.keyword}</strong> · Reel: {item.reel_id}</p>
                  <p className="mt-1 text-xs text-gray-500">Recorded private replies: {deliveries}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => startEditing(item)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Edit</button>
                  <button type="button" disabled={busy} onClick={() => void toggle(item)}
                    className={item.is_active ? 'rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-950/30' : buttonClass}>
                    {item.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

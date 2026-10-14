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

type CommentEvent = {
  id: string;
  reel_id: string;
  keyword: string | null;
  status: string;
  private_reply_sent: boolean;
  public_reply_sent: boolean;
  error_message: string | null;
  created_at: string;
  automation_id: string | null;
};

type Stats = { total: number; sent: number; publicReplies: number; skipped: number; failed: number };
const PAGE_SIZE = 20;

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
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, publicReplies: 0, skipped: 0, failed: 0 });
  const [activity, setActivity] = useState<CommentEvent[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [automationFilter, setAutomationFilter] = useState('all');
  const [reelLink, setReelLink] = useState('');
  const [resolvedLink, setResolvedLink] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [form, setForm] = useState<AutomationForm>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  async function refresh() {
    const [automationsResult, all, sent, publicReplies, skipped, failed] = await Promise.all([
      supabase.from('instagram_automations').select('*').order('created_at', { ascending: false }),
      supabase.from('instagram_comment_events').select('id', { head: true, count: 'exact' }),
      supabase
        .from('instagram_comment_events')
        .select('id', { head: true, count: 'exact' })
        .eq('private_reply_sent', true),
      supabase
        .from('instagram_comment_events')
        .select('id', { head: true, count: 'exact' })
        .eq('public_reply_sent', true),
      supabase.from('instagram_comment_events').select('id', { head: true, count: 'exact' }).eq('status', 'skipped'),
      supabase.from('instagram_comment_events').select('id', { head: true, count: 'exact' }).eq('status', 'failed'),
    ]);
    for (const result of [automationsResult, all, sent, publicReplies, skipped, failed]) {
      if (result.error) throw result.error;
    }
    setAutomations((automationsResult.data ?? []) as Automation[]);
    setStats({
      total: all.count ?? 0,
      sent: sent.count ?? 0,
      publicReplies: publicReplies.count ?? 0,
      skipped: skipped.count ?? 0,
      failed: failed.count ?? 0,
    });
  }

  async function loadActivity(page: number, status: string, automationId: string) {
    let query = supabase
      .from('instagram_comment_events')
      .select('id,reel_id,keyword,status,private_reply_sent,public_reply_sent,error_message,created_at,automation_id', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (status !== 'all') query = query.eq('status', status);
    if (automationId !== 'all') query = query.eq('automation_id', automationId);
    const { data, count, error: activityError } = await query;
    if (activityError) throw activityError;
    setActivity((data ?? []) as CommentEvent[]);
    setActivityCount(count ?? 0);
  }

  async function resolveReel() {
    setLookupError('');
    setError('');
    setNotice('');
    const candidate = reelLink.trim();
    if (!candidate) {
      setLookupError('Paste the link to your Instagram Reel.');
      return;
    }
    setLookupBusy(true);
    try {
      const { data, error: lookupError } = await supabase.functions.invoke('pyros-connect-reel', {
        body: { url: candidate },
      });
      if (lookupError || !data?.reel_id) {
        let message = data?.error || 'Could not find this Reel on @pyrosaicreative.';
        if (lookupError && typeof lookupError === 'object' && 'context' in lookupError) {
          const response = (lookupError as { context?: Response }).context;
          if (response && typeof response.json === 'function') {
            const details = await response.json().catch(() => null);
            message = details?.error || message;
          }
        }
        throw new Error(message);
      }
      if (reelLink.trim() !== candidate) {
        throw new Error('The link changed while searching. Resolve the latest link again.');
      }
      setForm((previous) => ({ ...previous, reel_id: String(data.reel_id) }));
      setResolvedLink(candidate);
      setNotice('Reel verified: numeric media ID retrieved.');
    } catch (err) {
      setResolvedLink('');
      setForm((previous) => ({ ...previous, reel_id: '' }));
      setLookupError(err instanceof Error ? err.message : 'Instagram lookup failed.');
    } finally {
      setLookupBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
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
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setReelLink('');
    setResolvedLink('');
    setLookupError('');
    setEditingId(null);
    setEditorOpen(false);
    setForm({ ...EMPTY_FORM });
    setError('');
    setNotice('');
  }

  function startEditing(item: Automation) {
    setReelLink('');
    setResolvedLink('');
    setLookupError('');
    setEditingId(item.id);
    setEditorOpen(true);
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
    if (reelLink.trim() && (resolvedLink !== reelLink.trim() || !form.reel_id)) {
      setError('Resolve the current Instagram link before saving.');
      return;
    }
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

  useEffect(() => {
    if (access !== 'allowed') return;
    void loadActivity(activityPage, statusFilter, automationFilter).catch(() =>
      setError('Could not load activity log.')
    );
  }, [access, activityPage, statusFilter, automationFilter]);

  if (access === 'loading') {
    return <p className="text-gray-400">Checking PYROS Connect access…</p>;
  }

  if (access === 'signed-out') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="text-3xl font-bold text-white">PYROS Connect</h1>
        <p className="mt-4 text-gray-400">Sign in to your PYROS account to access the private dashboard.</p>
        <a href="/account" className="mt-6 inline-block rounded-lg bg-[#8F6B3B] px-5 py-3 font-semibold text-white">
          Sign in
        </a>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="text-3xl font-bold text-white">PYROS Connect</h1>
        <p className="mt-4 text-gray-400">This dashboard is restricted to authorized PYROS administrators.</p>
        {email && <p className="mt-2 text-sm text-gray-500">Signed in as {email}</p>}
        {error && (
          <p role="alert" className="mt-3 text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  const activeCount = automations.filter((item) => item.is_active).length;

  return (
    <div className="text-sm text-white">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C49A58]">Private dashboard</p>
          <h1 className="mt-1 text-2xl font-bold">PYROS Connect</h1>
          <p className="mt-2 text-gray-400">Instagram comment-to-DM automations · {email}</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          onClick={() => void refresh().catch(() => setError('Could not refresh data.'))}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 rounded-lg border border-green-500/30 bg-green-950/30 p-3 text-green-300">
          {notice}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Automations', value: automations.length },
          { label: 'Active', value: activeCount },
          { label: 'DM confirmed', value: stats.sent },
          { label: 'Public replies', value: stats.publicReplies },
          { label: 'Duplicates skipped', value: stats.skipped },
          { label: 'Failed events', value: stats.failed },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/10 bg-[#111111] p-3">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-4 rounded-xl border border-white/10 bg-[#111111] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{editingId ? 'Edit automation' : 'New automation'}</h2>
          <button
            type="button"
            aria-expanded={editorOpen}
            onClick={() => {
              if (editorOpen) resetForm();
              else setEditorOpen(true);
            }}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
          >
            {editorOpen ? 'Close editor' : '+ New automation'}
          </button>
        </div>
        {editorOpen && (
          <>
            <p className="mt-2 text-xs text-gray-400">
              Paste an Instagram Reel link to find its ID. New automations start disabled.
            </p>

            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void save(event)}>
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="reel-link">
                  Instagram Reel link
                </label>
                <div className="flex flex-wrap items-end gap-3">
                  <input
                    id="reel-link"
                    className={inputClass + ' min-w-[230px] flex-1'}
                    type="url"
                    value={reelLink}
                    onInput={(event) => {
                      setReelLink(event.currentTarget.value);
                      setResolvedLink('');
                      setLookupError('');
                      setForm((previous) => ({ ...previous, reel_id: '' }));
                    }}
                    placeholder="https://www.instagram.com/reel/..."
                  />
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={lookupBusy || busy}
                    onClick={() => void resolveReel()}
                  >
                    {lookupBusy ? 'Finding…' : 'Find Reel ID'}
                  </button>
                </div>
                {lookupError && (
                  <p role="alert" className="mt-2 text-sm text-red-400">
                    {lookupError}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  {form.reel_id
                    ? `Verified Reel ID: ${form.reel_id}`
                    : 'Paste the link and click Find Reel ID. Only your account’s published media can be resolved.'}
                </p>
                {editingId && !reelLink && (
                  <p className="mt-1 text-xs text-gray-500">Existing Reel ID retained until you paste a new link.</p>
                )}
              </div>
              <label className={labelClass}>
                Keyword
                <input
                  className={inputClass}
                  required
                  value={form.keyword}
                  onInput={(event) => setForm({ ...form, keyword: event.currentTarget.value })}
                  placeholder="CHARACTER"
                />
              </label>
              <label className={labelClass}>
                Guide name
                <input
                  className={inputClass}
                  required
                  value={form.guide_name}
                  onInput={(event) => setForm({ ...form, guide_name: event.currentTarget.value })}
                  placeholder="Character Consistency Guide"
                />
              </label>
              <label className={labelClass}>
                Fourthwall guide URL
                <input
                  className={inputClass}
                  required
                  type="url"
                  value={form.guide_url}
                  onInput={(event) => setForm({ ...form, guide_url: event.currentTarget.value })}
                  placeholder="https://shop.pyrosaicreative.com/products/..."
                />
              </label>
              <label className={labelClass + ' md:col-span-2'}>
                DM message
                <textarea
                  className={inputClass}
                  rows={4}
                  required
                  value={form.dm_message}
                  onInput={(event) => setForm({ ...form, dm_message: event.currentTarget.value })}
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  The button 🎁 Get Free Guide opens your Fourthwall link.
                </span>
              </label>
              <label className={labelClass + ' md:col-span-2'}>
                Public comment reply
                <input
                  className={inputClass}
                  required
                  value={form.public_reply}
                  onInput={(event) => setForm({ ...form, public_reply: event.currentTarget.value })}
                />
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-300 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm({ ...form, is_active: event.currentTarget.checked })}
                />
                Enable automation after saving
              </label>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" disabled={busy} className={buttonClass}>
                  {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create automation'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={resetForm}
                    className="rounded-lg border border-white/20 px-4 py-2.5"
                  >
                    Cancel editing
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111111] p-4">
        <h2 className="text-xl font-semibold">Your automations</h2>
        {automations.length === 0 && (
          <p className="mt-4 text-gray-400">No automations yet. Create your first one above.</p>
        )}
        <div className="mt-3 space-y-2">
          {automations.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">{item.guide_name}</h3>
                    <span className={item.is_active ? 'text-sm text-green-400' : 'text-sm text-gray-400'}>
                      {item.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Keyword: <strong className="text-white">{item.keyword}</strong> · Reel: {item.reel_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEditing(item)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggle(item)}
                    className={
                      item.is_active
                        ? 'rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-950/30'
                        : buttonClass
                    }
                  >
                    {item.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Activity log</h2>
            <p className="mt-1 text-sm text-gray-400">
              {activityCount} matching event(s) · {stats.total} total recorded events
            </p>
          </div>
          <div className="flex gap-2">
            {activityOpen && (
              <button
                type="button"
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs"
                onClick={() =>
                  void Promise.all([refresh(), loadActivity(activityPage, statusFilter, automationFilter)]).catch(() =>
                    setError('Could not refresh activities.')
                  )
                }
              >
                Refresh
              </button>
            )}
            <button
              type="button"
              aria-expanded={activityOpen}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold"
              onClick={() => setActivityOpen((opened) => !opened)}
            >
              {activityOpen ? 'Hide activity' : 'View activity'}
            </button>
          </div>
        </div>
        {activityOpen && (
          <>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className={labelClass}>
                Status
                <select
                  className={inputClass}
                  value={statusFilter}
                  onChange={(event) => {
                    setActivityPage(0);
                    setStatusFilter(event.currentTarget.value);
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Duplicate skipped</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                </select>
              </label>
              <label className={labelClass}>
                Automation
                <select
                  className={inputClass}
                  value={automationFilter}
                  onChange={(event) => {
                    setActivityPage(0);
                    setAutomationFilter(event.currentTarget.value);
                  }}
                >
                  <option value="all">All automations</option>
                  {automations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.guide_name} — {item.keyword}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-gray-400">
                    <th className="px-2 py-3 font-medium">Date / time</th>
                    <th className="px-2 py-3 font-medium">Keyword / Reel</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">DM</th>
                    <th className="px-2 py-3 font-medium">Public reply</th>
                    <th className="px-2 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((event) => (
                    <tr key={event.id} className="border-b border-white/10 align-top">
                      <td className="px-2 py-3 whitespace-nowrap">{new Date(event.created_at).toLocaleString()}</td>
                      <td className="px-2 py-3">
                        <div>{event.keyword ?? '—'}</div>
                        <div className="text-xs text-gray-500">{event.reel_id}</div>
                      </td>
                      <td className="px-2 py-3 capitalize">{event.status}</td>
                      <td className="px-2 py-3">{event.private_reply_sent ? 'Sent' : '—'}</td>
                      <td className="px-2 py-3">{event.public_reply_sent ? 'Sent' : '—'}</td>
                      <td className="max-w-[260px] break-words px-2 py-3 text-xs text-gray-400">
                        {event.error_message ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activity.length === 0 && <p className="py-6 text-sm text-gray-400">No matching events.</p>}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40"
                disabled={activityPage === 0}
                onClick={() => setActivityPage((page) => Math.max(0, page - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {activityPage + 1} of {Math.max(1, Math.ceil(activityCount / PAGE_SIZE))}
              </span>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40"
                disabled={(activityPage + 1) * PAGE_SIZE >= activityCount}
                onClick={() => setActivityPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Counts reflect database events. They do not measure Fourthwall clicks or downloads.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

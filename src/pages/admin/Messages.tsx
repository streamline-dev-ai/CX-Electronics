import { useEffect, useState, useCallback } from 'react'
import {
  Mail, Search, Loader2, Trash2, Phone, MessageSquare, CheckCircle2,
  Tag, Reply, MailOpen,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAdminLang } from '../../context/AdminLangContext'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  inquiry_type: 'retail' | 'bulk' | 'general' | 'product' | 'order'
  message: string
  read: boolean
  replied_at: string | null
  created_at: string
}

const TYPE_COLORS: Record<ContactMessage['inquiry_type'], string> = {
  retail:  'bg-blue-100 text-blue-700',
  bulk:    'bg-violet-100 text-violet-700',
  general: 'bg-gray-100 text-gray-700',
  product: 'bg-amber-100 text-amber-700',
  order:   'bg-emerald-100 text-emerald-700',
}

const PAGE_SIZE = 50

export function AdminMessages() {
  const { t } = useAdminLang()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('cw_contact_messages')
      .select('id, name, email, phone, inquiry_type, message, read, replied_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (filter === 'unread') q = q.eq('read', false)
    if (filter === 'replied') q = q.not('replied_at', 'is', null)
    if (query) {
      q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,message.ilike.%${query}%`)
    }

    const { data, count } = await q
    setMessages((data ?? []) as ContactMessage[])
    setTotal(count ?? 0)
    setLoading(false)
  }, [filter, query, page])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function markRead(m: ContactMessage, read: boolean) {
    setActionId(m.id)
    await supabase
      .from('cw_contact_messages')
      .update({ read })
      .eq('id', m.id)
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, read } : x))
    setActionId(null)
  }

  async function markReplied(m: ContactMessage) {
    setActionId(m.id)
    const replied_at = new Date().toISOString()
    await supabase
      .from('cw_contact_messages')
      .update({ replied_at, read: true })
      .eq('id', m.id)
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, replied_at, read: true } : x))
    setActionId(null)
    showToast('Marked as replied')
  }

  async function deleteMessage(m: ContactMessage) {
    if (!confirm(`Delete message from ${m.name}?`)) return
    setActionId(m.id)
    const { error } = await supabase.from('cw_contact_messages').delete().eq('id', m.id)
    setActionId(null)
    if (error) {
      showToast(`Failed: ${error.message}`)
      return
    }
    setMessages((prev) => prev.filter((x) => x.id !== m.id))
    if (activeId === m.id) setActiveId(null)
    showToast('Deleted')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const unreadCount = messages.filter((m) => !m.read).length
  const active = messages.find((m) => m.id === activeId) ?? null

  return (
    <div>
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('messagesPage')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {t('total')} · {unreadCount > 0 && <span className="text-[#E63939] font-semibold">{unreadCount} unread on this page</span>}
            {unreadCount === 0 && 'All caught up'}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, phone, content…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] w-full sm:w-64"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
            {t('search')}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {([
          { key: 'all',     label: 'All' },
          { key: 'unread',  label: 'Unread' },
          { key: 'replied', label: 'Replied' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              filter === key
                ? 'bg-cxx-blue text-white border-cxx-blue'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-cxx-blue" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Mail className="w-8 h-8 mb-2" />
              <p className="text-sm">No messages</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {messages.map((m) => (
                <li
                  key={m.id}
                  onClick={() => {
                    setActiveId(m.id)
                    if (!m.read) markRead(m, true)
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    activeId === m.id
                      ? 'bg-cxx-blue-light'
                      : !m.read
                        ? 'bg-amber-50/50 hover:bg-amber-50'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!m.read && (
                      <span className="w-2 h-2 rounded-full bg-[#E63939] mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm truncate ${!m.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {m.name}
                        </p>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {relativeTime(m.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{m.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${TYPE_COLORS[m.inquiry_type]}`}>
                          {m.inquiry_type}
                        </span>
                        {m.replied_at && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-xs font-semibold rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs font-semibold rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        {active ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-lg truncate">{active.name}</h2>
                <a href={`mailto:${active.email}`} className="text-sm text-cxx-blue hover:underline truncate block">
                  {active.email}
                </a>
                {active.phone && (
                  <a href={`tel:${active.phone}`} className="text-sm text-gray-500 hover:text-gray-700 mt-0.5 inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {active.phone}
                  </a>
                )}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${TYPE_COLORS[active.inquiry_type]} flex items-center gap-1`}>
                <Tag className="w-3 h-3" />
                {active.inquiry_type}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Message</p>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{active.message}</p>
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Received {new Date(active.created_at).toLocaleString('en-ZA')}
              {active.replied_at && (
                <> · Replied {new Date(active.replied_at).toLocaleString('en-ZA')}</>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:${active.email}?subject=${encodeURIComponent('Re: your CW Electronics enquiry')}&body=${encodeURIComponent(`Hi ${active.name.split(' ')[0]},\n\nThanks for your message — `)}`}
                onClick={() => markReplied(active)}
                className="inline-flex items-center gap-1.5 bg-cxx-blue hover:bg-cxx-blue-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply via Email
              </a>
              {active.phone && (
                <a
                  href={`https://wa.me/${active.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => markRead(active, !active.read)}
                disabled={actionId === active.id}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <MailOpen className="w-4 h-4" />
                {active.read ? 'Mark as unread' : 'Mark as read'}
              </button>
              <button
                onClick={() => deleteMessage(active)}
                disabled={actionId === active.id}
                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex bg-white rounded-xl border border-gray-200 border-dashed p-12 items-center justify-center text-gray-400 text-sm">
            Select a message to read it
          </div>
        )}
      </div>
    </div>
  )
}

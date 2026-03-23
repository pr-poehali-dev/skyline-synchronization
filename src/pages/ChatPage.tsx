import { useState, useEffect, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"

const API = "https://functions.poehali.dev/5e00de4c-15f9-4f86-85f2-d368b0eb981a"

type User = {
  id: number
  username: string
  avatar_url: string | null
  is_verified: boolean
  is_admin: boolean
}

type Message = {
  id: number
  user_id: number
  username: string
  avatar_url: string | null
  text: string
  is_verified: boolean
  created_at: string
}

type OnlineUser = {
  id: number
  username: string
  avatar_url: string | null
  is_verified: boolean
  online: boolean
  last_seen: string
}

const COLORS = ["bg-violet-600","bg-teal-600","bg-amber-600","bg-rose-600","bg-sky-600","bg-emerald-600","bg-pink-600"]
function colorFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem("cz_user")
    return s ? JSON.parse(s) : null
  })
  const [loginName, setLoginName] = useState("")
  const [loginError, setLoginError] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [adminCodeError, setAdminCodeError] = useState("")
  const [stats, setStats] = useState<{ users_count: number; messages_count: number } | null>(null)
  const [verifyUsername, setVerifyUsername] = useState("")
  const [verifyMsg, setVerifyMsg] = useState("")
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("cz_theme") as "dark" | "light") || "dark")
  const [chatBg, setChatBg] = useState(() => localStorage.getItem("cz_bg") || "default")
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dark = theme === "dark"

  useEffect(() => {
    localStorage.setItem("cz_theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("cz_bg", chatBg)
  }, [chatBg])

  const fetchMessages = useCallback(async () => {
    const r = await fetch(`${API}?action=messages`)
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    setMessages(parsed.messages || [])
  }, [])

  const fetchOnline = useCallback(async () => {
    const r = await fetch(`${API}?action=online`)
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    setOnlineUsers(parsed.users || [])
  }, [])

  const fetchStats = useCallback(async () => {
    const r = await fetch(`${API}?action=stats`)
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    setStats(parsed)
  }, [])

  useEffect(() => {
    if (!user) return
    fetchMessages()
    fetchOnline()
    const msgInterval = setInterval(fetchMessages, 3000)
    const onlineInterval = setInterval(fetchOnline, 10000)
    return () => { clearInterval(msgInterval); clearInterval(onlineInterval) }
  }, [user, fetchMessages, fetchOnline])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogin = async () => {
    if (!loginName.trim() || loginName.trim().length < 2) {
      setLoginError("Введи имя от 2 символов")
      return
    }
    const r = await fetch(`${API}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginName.trim() }),
    })
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    if (parsed.user) {
      localStorage.setItem("cz_user", JSON.stringify(parsed.user))
      setUser(parsed.user)
    } else {
      setLoginError("Ошибка входа, попробуй ещё раз")
    }
  }

  const handleSend = async () => {
    if (!text.trim() || !user || sending) return
    setSending(true)
    const r = await fetch(`${API}?action=send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, username: user.username, text: text.trim(), avatar_url: user.avatar_url }),
    })
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    if (parsed.message) {
      setMessages(prev => [...prev, parsed.message])
      setText("")
    }
    setSending(false)
  }

  const handleActivateAdmin = async () => {
    if (!user) return
    const r = await fetch(`${API}?action=admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, code: adminCode }),
    })
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    if (parsed.ok) {
      const updated = { ...user, is_admin: true }
      setUser(updated)
      localStorage.setItem("cz_user", JSON.stringify(updated))
      setAdminCode("")
      setAdminCodeError("")
      fetchStats()
    } else {
      setAdminCodeError("Неверный код")
    }
  }

  const handleVerify = async () => {
    if (!user || !verifyUsername.trim()) return
    const r = await fetch(`${API}?action=verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: user.id, username: verifyUsername.trim() }),
    })
    const d = await r.json()
    const parsed = typeof d === "string" ? JSON.parse(d) : d
    if (parsed.ok) {
      setVerifyMsg("✓ Верификация выдана!")
      setVerifyUsername("")
    } else {
      setVerifyMsg(parsed.error || "Ошибка")
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const updated = { ...user, avatar_url: url }
      setUser(updated)
      localStorage.setItem("cz_user", JSON.stringify(updated))
    }
    reader.readAsDataURL(file)
  }

  const bgStyles: Record<string, string> = {
    default: dark ? "bg-[#0a0a0a]" : "bg-gray-100",
    purple: "bg-gradient-to-br from-violet-950 to-[#0a0a0a]",
    blue: "bg-gradient-to-br from-blue-950 to-[#0a0a0a]",
    green: "bg-gradient-to-br from-emerald-950 to-[#0a0a0a]",
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0a0a0a]" : "bg-gray-100"}`}>
        <div className={`w-full max-w-sm mx-4 rounded-2xl p-8 border ${dark ? "bg-[#141414] border-[#262626]" : "bg-white border-gray-200 shadow-lg"}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Icon name="MessageCircle" size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${dark ? "text-white" : "text-black"}`}>Chill Zone</h1>
              <p className="text-xs text-gray-500">Общий чат</p>
            </div>
          </div>
          <p className={`text-sm mb-4 ${dark ? "text-gray-400" : "text-gray-600"}`}>Введи имя, чтобы войти в чат</p>
          <Input
            placeholder="Твоё имя..."
            value={loginName}
            onChange={e => { setLoginName(e.target.value); setLoginError("") }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className={`mb-2 rounded-xl ${dark ? "bg-[#1f1f1f] border-[#333] text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-black"}`}
          />
          {loginError && <p className="text-xs text-red-400 mb-2">{loginError}</p>}
          <Button onClick={handleLogin} className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white">
            Войти в чат
          </Button>
        </div>
      </div>
    )
  }

  // MAIN CHAT
  return (
    <div className={`h-screen flex flex-col overflow-hidden ${dark ? "text-white" : "text-black"} ${bgStyles[chatBg]}`}>

      {/* HEADER */}
      <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${dark ? "bg-[#111] border-[#222]" : "bg-white border-gray-200 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Icon name="MessageCircle" size={16} className="text-white" />
          </div>
          <div>
            <span className={`font-bold text-sm ${dark ? "text-white" : "text-black"}`}>Chill Zone</span>
            <p className="text-xs text-gray-500">
              {onlineUsers.filter(u => u.online).length} онлайн
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-[#222] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <Icon name={dark ? "Sun" : "Moon"} size={16} />
          </button>
          <button
            onClick={() => { setSidebarOpen(o => !o) }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-[#222] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <Icon name="Users" size={16} />
          </button>
          <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback className={`${colorFor(user.username)} text-white text-xs`}>{initials(user.username)}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* MESSAGES */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Icon name="MessageCircle" size={48} className="text-violet-400 mb-3" />
                <p className="text-sm">Будь первым — напиши что-нибудь!</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.user_id === user.id
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  {!isMe && (
                    <Avatar className="h-8 w-8 shrink-0">
                      {msg.avatar_url && <AvatarImage src={msg.avatar_url} />}
                      <AvatarFallback className={`${colorFor(msg.username)} text-white text-xs`}>{initials(msg.username)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    {!isMe && (
                      <div className="flex items-center gap-1 px-1">
                        <span className="text-xs font-medium text-violet-400">{msg.username}</span>
                        {msg.is_verified && <Icon name="BadgeCheck" size={12} className="text-blue-400" />}
                      </div>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : dark
                          ? "bg-[#1e1e1e] text-white rounded-bl-sm"
                          : "bg-white text-black rounded-bl-sm shadow-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-500 px-1">{msg.created_at}</span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className={`px-4 py-3 border-t shrink-0 ${dark ? "bg-[#111] border-[#222]" : "bg-white border-gray-200"}`}>
            <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 ${dark ? "bg-[#1e1e1e]" : "bg-gray-100"}`}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-violet-400 transition-colors shrink-0"
              >
                <Icon name="Paperclip" size={18} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,audio/*" />
              <input
                type="text"
                placeholder="Написать сообщение..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                className={`flex-1 bg-transparent outline-none text-sm ${dark ? "text-white placeholder-gray-600" : "text-black placeholder-gray-400"}`}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  text.trim() ? "bg-violet-600 hover:bg-violet-700 text-white" : "text-gray-600"
                }`}
              >
                <Icon name="Send" size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR — participants */}
        {sidebarOpen && (
          <div className={`w-64 shrink-0 border-l flex flex-col ${dark ? "bg-[#111] border-[#222]" : "bg-white border-gray-200"}`}>
            <div className="px-4 py-3 border-b border-inherit">
              <p className={`text-sm font-semibold ${dark ? "text-white" : "text-black"}`}>Участники</p>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {onlineUsers.map(u => (
                <div key={u.id} className={`flex items-center gap-2 px-2 py-2 rounded-xl ${dark ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50"}`}>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                      <AvatarFallback className={`${colorFor(u.username)} text-white text-xs`}>{initials(u.username)}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${dark ? "border-[#111]" : "border-white"} ${u.online ? "bg-green-500" : "bg-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium truncate ${dark ? "text-white" : "text-black"}`}>{u.username}</span>
                      {u.is_verified && <Icon name="BadgeCheck" size={11} className="text-blue-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.last_seen}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setProfileOpen(false)}>
          <div
            className={`w-full max-w-sm rounded-2xl p-6 border ${dark ? "bg-[#141414] border-[#262626]" : "bg-white border-gray-200"}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Profile header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold text-lg ${dark ? "text-white" : "text-black"}`}>Профиль</h2>
              <button onClick={() => setProfileOpen(false)} className="text-gray-500 hover:text-gray-300">
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                  <AvatarFallback className={`${colorFor(user.username)} text-white text-2xl`}>{initials(user.username)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center border-2 border-[#141414]"
                >
                  <Icon name="Camera" size={13} className="text-white" />
                </button>
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className={`font-semibold ${dark ? "text-white" : "text-black"}`}>{user.username}</span>
                  {user.is_verified && <Icon name="BadgeCheck" size={16} className="text-blue-400" />}
                  {user.is_admin && <span className="text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full">Админ</span>}
                </div>
                <p className="text-xs text-green-500 mt-0.5">онлайн</p>
              </div>
            </div>

            {/* Theme toggle */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 ${dark ? "bg-[#1e1e1e]" : "bg-gray-50"}`}>
              <span className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>Тёмная тема</span>
              <button
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                className={`w-11 h-6 rounded-full transition-colors relative ${dark ? "bg-violet-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Chat background (admin only) */}
            {user.is_admin && (
              <div className={`px-3 py-3 rounded-xl mb-2 ${dark ? "bg-[#1e1e1e]" : "bg-gray-50"}`}>
                <p className={`text-sm mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>Фон чата</p>
                <div className="flex gap-2">
                  {[
                    { key: "default", label: "Обычный", cls: dark ? "bg-[#0a0a0a]" : "bg-gray-200" },
                    { key: "purple", label: "Фиолетовый", cls: "bg-gradient-to-br from-violet-900 to-gray-900" },
                    { key: "blue", label: "Синий", cls: "bg-gradient-to-br from-blue-900 to-gray-900" },
                    { key: "green", label: "Зелёный", cls: "bg-gradient-to-br from-emerald-900 to-gray-900" },
                  ].map(bg => (
                    <button
                      key={bg.key}
                      onClick={() => setChatBg(bg.key)}
                      className={`w-8 h-8 rounded-lg ${bg.cls} border-2 transition-all ${chatBg === bg.key ? "border-violet-500 scale-110" : "border-transparent"}`}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Admin panel */}
            {user.is_admin ? (
              <div className={`px-3 py-3 rounded-xl mb-2 ${dark ? "bg-[#1e1e1e]" : "bg-gray-50"}`}>
                <p className={`text-sm font-medium mb-2 ${dark ? "text-white" : "text-black"}`}>Панель администратора</p>
                {stats && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`rounded-xl p-2 text-center ${dark ? "bg-[#141414]" : "bg-white border border-gray-200"}`}>
                      <p className="text-xl font-bold text-violet-400">{stats.users_count}</p>
                      <p className="text-xs text-gray-500">пользователей</p>
                    </div>
                    <div className={`rounded-xl p-2 text-center ${dark ? "bg-[#141414]" : "bg-white border border-gray-200"}`}>
                      <p className="text-xl font-bold text-violet-400">{stats.messages_count}</p>
                      <p className="text-xs text-gray-500">сообщений</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Имя для верификации"
                    value={verifyUsername}
                    onChange={e => { setVerifyUsername(e.target.value); setVerifyMsg("") }}
                    className={`flex-1 text-xs rounded-lg px-3 py-2 outline-none ${dark ? "bg-[#141414] text-white placeholder-gray-600 border border-[#333]" : "bg-white text-black border border-gray-200"}`}
                  />
                  <button onClick={handleVerify} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    ✓
                  </button>
                </div>
                {verifyMsg && <p className="text-xs text-green-400 mt-1">{verifyMsg}</p>}
              </div>
            ) : (
              <div className={`px-3 py-3 rounded-xl mb-2 ${dark ? "bg-[#1e1e1e]" : "bg-gray-50"}`}>
                <p className={`text-xs mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>Код администратора</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Введи код..."
                    value={adminCode}
                    onChange={e => { setAdminCode(e.target.value); setAdminCodeError("") }}
                    className={`flex-1 text-sm rounded-lg px-3 py-2 outline-none ${dark ? "bg-[#141414] text-white placeholder-gray-600 border border-[#333]" : "bg-white text-black border border-gray-200"}`}
                  />
                  <button onClick={handleActivateAdmin} className="px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm">
                    OK
                  </button>
                </div>
                {adminCodeError && <p className="text-xs text-red-400 mt-1">{adminCodeError}</p>}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={() => { localStorage.removeItem("cz_user"); setUser(null); setProfileOpen(false) }}
              className="w-full text-sm text-red-400 hover:text-red-300 py-2 transition-colors"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { ShieldCheck, ArrowUpRight, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const verifiedUsers = [
  { name: "Алексей П.", role: "Администратор", image: "/professional-man-portrait.png", verified: true, badge: "bg-blue-500" },
  { name: "Мария И.", role: "Верифицирован", image: "/professional-woman-portrait.png", verified: true, badge: "bg-blue-500" },
  { name: "Елена С.", role: "Участник", initials: "ЕС", color: "bg-teal-600", verified: false },
]

export function PaymentRolesCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <ShieldCheck className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Режим администратора</h3>
      <p className="mb-4 text-sm text-gray-400">Выдавайте верификацию, управляйте участниками и следите за статистикой чата</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        Подробнее <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-3 rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
        {verifiedUsers.map((user, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className={`${user.color || "bg-gray-600"} text-white text-xs`}>
                  {user.initials || user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  {user.verified && <BadgeCheck className="h-4 w-4 text-blue-400" />}
                </div>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            {!user.verified && (
              <button className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5">
                Верифицировать
              </button>
            )}
          </div>
        ))}

        <Button className="w-full bg-[#252525] text-gray-400 hover:bg-[#2a2a2a] hover:text-white mt-1">
          Панель администратора
        </Button>
      </div>
    </div>
  )
}

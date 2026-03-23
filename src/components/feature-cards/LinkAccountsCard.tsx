import { Users, ArrowUpRight, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const users = [
  { name: "Алексей П.", status: "онлайн", image: "/professional-man-portrait.png", statusColor: "bg-green-500" },
  { name: "Мария И.", status: "онлайн", image: "/professional-woman-portrait.png", statusColor: "bg-green-500" },
  { name: "Елена С.", status: "был(а) 5 мин назад", initials: "ЕС", color: "bg-teal-600", statusColor: "bg-gray-500" },
  { name: "Дмитрий К.", status: "был(а) 1 ч назад", initials: "ДК", color: "bg-amber-600", statusColor: "bg-gray-500" },
]

export function LinkAccountsCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Users className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Участники чата</h3>
      <p className="mb-4 text-sm text-gray-400">Все пользователи Chill Zone в одном пространстве — видно кто онлайн прямо сейчас</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        Открыть чат <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-2 rounded-xl bg-[#1a1a1a] border border-[#262626] p-3">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className={`${user.color || "bg-gray-600"} text-white text-xs`}>
                    {user.initials ||
                      user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0f0f0f] ${user.statusColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-500">{user.status}</p>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          className="w-full justify-center text-gray-500 hover:text-white hover:bg-[#1f1f1f] mt-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Все участники
        </Button>
      </div>
    </div>
  )
}

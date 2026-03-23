import { Send, ImageIcon, Music2, FileText, Smile } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const messages = [
  { name: "Мария И.", image: "/professional-woman-portrait.png", text: "Привет всем! 👋", time: "14:32" },
  { name: "Алексей П.", image: "/professional-man-portrait.png", text: "Что новенького?", time: "14:33" },
  { name: "Елена С.", initials: "ЕС", color: "bg-teal-600", text: "Прикрепила фото 📸", time: "14:35" },
]

export function SendFundsCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Send className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Общий чат</h3>
      <p className="mb-4 text-sm text-gray-400">Фото, видео, музыка и файлы — делитесь контентом мгновенно в едином пространстве</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        Открыть чат <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto rounded-xl bg-[#1a1a1a] border border-[#262626] p-4 space-y-3">
        <div className="space-y-2 max-h-36 overflow-hidden">
          {messages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2">
              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                {msg.image ? <AvatarImage src={msg.image} alt={msg.name} /> : null}
                <AvatarFallback className={`${msg.color || "bg-gray-600"} text-white text-xs`}>
                  {msg.initials || msg.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg bg-[#0f0f0f] border border-[#262626] px-3 py-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-violet-400">{msg.name}</span>
                  <span className="text-xs text-gray-600">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-300">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#0f0f0f] border border-[#262626] px-3 py-2">
          <input
            type="text"
            placeholder="Написать сообщение..."
            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
          />
          <div className="flex items-center gap-2 text-gray-500">
            <ImageIcon className="h-4 w-4 hover:text-violet-400 cursor-pointer transition-colors" />
            <Music2 className="h-4 w-4 hover:text-violet-400 cursor-pointer transition-colors" />
            <FileText className="h-4 w-4 hover:text-violet-400 cursor-pointer transition-colors" />
            <Smile className="h-4 w-4 hover:text-violet-400 cursor-pointer transition-colors" />
          </div>
        </div>

        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
          <Send className="mr-2 h-4 w-4" /> Отправить
        </Button>
      </div>
    </div>
  )
}

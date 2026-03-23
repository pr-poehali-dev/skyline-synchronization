import { Smile, Music2, ImageIcon, FileText, Video, Users, Sparkles } from "lucide-react"

const features = [
  { name: "Фото и видео", icon: Video },
  { name: "Музыка", icon: Music2 },
  { name: "Файлы", icon: FileText },
  { name: "Изображения", icon: ImageIcon },
  { name: "Онлайн-статусы", icon: Users },
  { name: "Эмодзи", icon: Smile },
  { name: "Верификация", icon: Sparkles },
]

export function PartnersSection() {
  return (
    <section className="flex flex-wrap items-center justify-center gap-6 md:gap-10 px-4 py-8">
      {features.map((feature) => (
        <div key={feature.name} className="flex items-center gap-2 text-gray-500">
          <feature.icon className="h-4 w-4" />
          <span className="text-sm font-medium">{feature.name}</span>
        </div>
      ))}
    </section>
  )
}

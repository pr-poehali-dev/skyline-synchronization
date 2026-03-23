import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <ChillZoneLogo />
        <span className="text-lg font-semibold text-white">
          Chill Zone
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Чат
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Профиль
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Возможности
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          О нас
        </a>
      </nav>

      <Button
        variant="outline"
        className="rounded-full border-violet-500 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 bg-transparent"
      >
        Войти в чат
      </Button>
    </header>
  )
}

function ChillZoneLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="8" fill="#8B5CF6" fillOpacity="0.15" />
      <path d="M7 10C7 8.9 7.9 8 9 8H19C20.1 8 21 8.9 21 10V16C21 17.1 20.1 18 19 18H15L12 21V18H9C7.9 18 7 17.1 7 16V10Z" fill="#8B5CF6" />
      <circle cx="11" cy="13" r="1.2" fill="white" />
      <circle cx="14" cy="13" r="1.2" fill="white" />
      <circle cx="17" cy="13" r="1.2" fill="white" />
    </svg>
  )
}

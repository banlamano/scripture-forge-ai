"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  Sparkles,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", href: "/", icon: Home },
  { key: "bible", href: "/bible", icon: BookOpen },
  { key: "chat", href: "/chat", icon: MessageCircle },
  { key: "devotional", href: "/devotional", icon: Sparkles },
  { key: "profile", href: "/profile", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] touch-manipulation",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground active:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {t(item.key)}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

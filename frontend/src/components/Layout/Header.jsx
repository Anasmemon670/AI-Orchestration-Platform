import { motion } from 'motion/react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Input } from '../ui/input';

export function Header({ theme, onThemeToggle }) {
  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="h-16 bg-[#16161F]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40"
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search projects, jobs, models..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#00D9FF]/50 focus:ring-[#00D9FF]/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
        >
          <Bell className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FF006E] to-[#9D4EDD] rounded-full flex items-center justify-center text-white text-xs"
          >
            3
          </motion.div>
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onThemeToggle}
          className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}


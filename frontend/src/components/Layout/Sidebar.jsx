import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Languages, 
  Mic, 
  FileAudio, 
  MicVocal, 
  BookOpen, 
  Film, 
  Video, 
  Bot, 
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '../../components/ui/utils';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dubbing', label: 'Dubbing', icon: Languages },
  { id: 'tts', label: 'Text-to-Speech', icon: Mic },
  { id: 'stt', label: 'Speech-to-Text', icon: FileAudio },
  { id: 'voice-cloning', label: 'Voice Cloning', icon: MicVocal },
  { id: 'ai-stories', label: 'AI Stories', icon: BookOpen },
  { id: 'movie-studio', label: 'Movie Studio', icon: Film },
  { id: 'film-studio', label: 'Film Studio', icon: Video },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }) {
  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-gradient-to-b from-[#16161F] to-[#0A0A0F] border-r border-white/5 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF] via-[#9D4EDD] to-[#FF006E] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white">AI Orchestrator</h1>
            <p className="text-xs text-white/50">VIP Platform</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group",
                  isActive 
                    ? "bg-gradient-to-r from-[#00D9FF]/20 to-[#9D4EDD]/20 text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 to-[#9D4EDD]/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn(
                  "w-5 h-5 relative z-10",
                  isActive && "text-[#00D9FF]"
                )} />
                <span className="relative z-10">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D9FF] relative z-10"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/5">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
            <span className="text-white">VP</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">VIP User</p>
            <p className="text-white/50 text-xs">Admin Access</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}


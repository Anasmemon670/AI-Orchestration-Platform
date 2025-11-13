import { motion } from 'motion/react';
import { Clock, CheckCircle, XCircle, Loader2, MoreVertical } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const statusConfig = {
  queued: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', animate: true },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export function JobCard({ job, onClick }) {
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/0 to-[#9D4EDD]/0 group-hover:from-[#00D9FF]/10 group-hover:to-[#9D4EDD]/10 transition-all duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white mb-1">{job.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
                {job.type}
              </Badge>
              {job.model && (
                <span className="text-xs text-white/50">{job.model}</span>
              )}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-white/60" />
          </motion.button>
        </div>

        {/* Progress */}
        {job.status === 'processing' && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Progress</span>
              <span className="text-xs text-white">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-1.5 bg-white/10" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}>
            <StatusIcon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
            <span className={`text-xs capitalize ${config.color}`}>{job.status}</span>
          </div>
          
          <span className="text-xs text-white/50">
            {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Duration for completed jobs */}
        {job.duration && job.status === 'completed' && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-white/50">Duration: {job.duration}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}


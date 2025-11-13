import { motion } from 'motion/react';
import { Video, Plus, Play, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

export function FilmStudio() {
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white mb-1">Film Studio</h1>
            <p className="text-white/60">Professional video editing and production</p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] hover:opacity-90 text-white border-0">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </motion.div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-white/50">No projects available</p>
          </div>
        ) : (
          projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-[#00D9FF]/20 to-[#9D4EDD]/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/0 to-[#9D4EDD]/0 group-hover:from-[#00D9FF]/20 group-hover:to-[#9D4EDD]/20 transition-all duration-500" />
              <Play className="w-12 h-12 text-white/40 group-hover:text-white/80 transition-colors relative z-10" />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white mb-1 group-hover:text-[#00D9FF] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-white/50 text-sm">{project.status}</p>
                </div>
              </div>

              {project.progress < 100 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">Progress</span>
                    <span className="text-xs text-white">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5 bg-white/10" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-sm transition-all"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 px-4 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 flex items-center justify-center text-white/60 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
          ))
        )}

        {/* Create New Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center min-h-[300px] cursor-pointer group hover:border-[#00D9FF]/50 transition-all"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white mb-1">Create New Project</h3>
            <p className="text-white/50 text-sm">Start a new video project</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-[#00D9FF]" />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-white/50 text-xs">{activity.project}</p>
              </div>
              <span className="text-white/40 text-xs">{activity.time}</span>
            </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}


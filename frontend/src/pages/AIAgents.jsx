import { motion } from 'motion/react';
import { Bot, Plus, Activity, Zap, Settings, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';

export function AIAgents() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalTasks: 0,
    successRate: 0,
    runningNow: 0,
  });
  const [activityLog, setActivityLog] = useState([]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00FF87] to-[#00D9FF] flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white mb-1">AI Agents</h1>
            <p className="text-white/60">Automate your workflow with intelligent agents</p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-[#00FF87] to-[#00D9FF] hover:opacity-90 text-white border-0">
            <Plus className="w-5 h-5 mr-2" />
            Create Agent
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Agents', value: stats.activeAgents, icon: Activity },
          { label: 'Total Tasks', value: stats.totalTasks, icon: Zap },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: Activity },
          { label: 'Running Now', value: stats.runningNow, icon: Play },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="w-5 h-5 text-[#00FF87]" />
              <span className="text-white/60 text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-white/50">No agents available</p>
          </div>
        ) : (
          agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white group-hover:text-[#00FF87] transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-white/50 text-sm">{agent.description}</p>
                  </div>
                </div>
                
                <Switch 
                  checked={agent.status === 'active'} 
                  className="data-[state=checked]:bg-[#00FF87]"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs mb-1">Tasks Completed</p>
                  <p className="text-white text-lg">{agent.tasks}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs mb-1">Last Run</p>
                  <p className="text-white text-lg text-sm">{agent.lastRun}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <Badge 
                  className={`${
                    agent.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {agent.status === 'active' ? (
                    <><Activity className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><Pause className="w-3 h-3 mr-1" /> Paused</>
                  )}
                </Badge>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Settings className="w-4 h-4 text-white/60" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Play className="w-4 h-4 text-white/60" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {activityLog.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">No recent activity</p>
            </div>
          ) : (
            activityLog.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${
                log.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm">{log.action}</p>
                <p className="text-white/50 text-xs">{log.agent}</p>
              </div>
              <span className="text-white/40 text-xs">{log.time}</span>
            </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}


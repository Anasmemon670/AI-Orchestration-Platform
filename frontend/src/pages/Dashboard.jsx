import { motion } from 'motion/react';
import { Activity, CheckCircle, XCircle, Clock, HardDrive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StatsCard } from '../components/StatsCard';
import { JobCard } from '../components/JobCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { apiGet } from '../lib/api';

export function Dashboard() {
  const [apiStatus, setApiStatus] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    storageUsed: 0,
    storageTotal: 100,
  });
  const [jobs, setJobs] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await apiGet('/test/');
        setApiStatus(response);
        console.log('✅ API Connection Successful:', response);
      } catch (error) {
        console.error('❌ API Connection Failed:', error);
        setApiStatus({ status: 'error', message: error.message });
      }
    };
    testConnection();
  }, []);
  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Monitor your AI orchestration platform</p>
        {/* API Connection Status */}
        {apiStatus && (
          <div className={`mt-2 text-xs ${apiStatus.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {apiStatus.status === 'success' ? (
              <span>✅ Backend Connected: {apiStatus.data?.total_users || 0} users in database</span>
            ) : (
              <span>❌ Backend Connection Failed: {apiStatus.message}</span>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Jobs"
          value={stats.totalJobs}
          change="+12.5%"
          icon={Activity}
          gradient="from-[#00D9FF] to-[#0088CC]"
          delay={0.1}
        />
        <StatsCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={Clock}
          gradient="from-[#9D4EDD] to-[#6B2EA8]"
          delay={0.2}
        />
        <StatsCard
          title="Completed"
          value={stats.completedJobs}
          change="+8.3%"
          icon={CheckCircle}
          gradient="from-[#00FF87] to-[#00CC6A]"
          delay={0.3}
        />
        <StatsCard
          title="Storage Used"
          value={`${stats.storageUsed}GB`}
          icon={HardDrive}
          gradient="from-[#FF006E] to-[#CC0058]"
          delay={0.4}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-white mb-6">Jobs This Week</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#fff" opacity={0.5} fontSize={12} />
              <YAxis stroke="#fff" opacity={0.5} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(22, 22, 31, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="jobs"
                stroke="#00D9FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorJobs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Success vs Failed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-white mb-6">Success Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#fff" opacity={0.5} fontSize={12} />
              <YAxis stroke="#fff" opacity={0.5} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(22, 22, 31, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="success" fill="#00FF87" radius={[8, 8, 0, 0]} />
              <Bar dataKey="failed" fill="#FF006E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">Recent Jobs</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#00D9FF] hover:text-[#00D9FF]/80 text-sm"
          >
            View All
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/50">No jobs available</p>
            </div>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}


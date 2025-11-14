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

  // Fetch live data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test API connection
        try {
          const testResponse = await apiGet('/test/', false);
          setApiStatus(testResponse);
        } catch (testError) {
          console.warn('Test endpoint failed:', testError);
        }

        // Fetch projects
        const projectsResponse = await apiGet('/projects/');
        const projects = projectsResponse.results || projectsResponse;

        // Fetch jobs
        const jobsResponse = await apiGet('/jobs/');
        const allJobs = jobsResponse.results || jobsResponse;

        // Fetch job results
        const resultsResponse = await apiGet('/job-results/');
        const jobResults = resultsResponse.results || resultsResponse;

        // Calculate stats from real data
        const totalJobs = Array.isArray(allJobs) ? allJobs.length : 0;
        const activeJobs = Array.isArray(allJobs) 
          ? allJobs.filter(job => job.status === 'running' || job.status === 'pending').length 
          : 0;
        const completedJobs = Array.isArray(allJobs)
          ? allJobs.filter(job => job.status === 'completed').length
          : 0;
        const failedJobs = Array.isArray(allJobs)
          ? allJobs.filter(job => job.status === 'failed').length
          : 0;

        // Update stats
        setStats({
          totalJobs,
          activeJobs,
          completedJobs,
          failedJobs,
          storageUsed: 0, // TODO: Calculate from actual file sizes
          storageTotal: 100,
        });

        // Set jobs (limit to recent 6)
        const recentJobs = Array.isArray(allJobs) 
          ? allJobs.slice(0, 6).map(job => ({
              id: job.id,
              type: job.type,
              status: job.status,
              progress: job.progress || 0,
              project: job.project || 'Unknown',
              created_at: job.created_at,
            }))
          : [];
        setJobs(recentJobs);

        // Generate chart data from jobs (last 7 days)
        const now = new Date();
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          if (Array.isArray(allJobs)) {
            const dayJobs = allJobs.filter(job => {
              const jobDate = new Date(job.created_at);
              return jobDate.toDateString() === date.toDateString();
            });
            
            chartData.push({
              name: dateStr,
              jobs: dayJobs.length,
              success: dayJobs.filter(j => j.status === 'completed').length,
              failed: dayJobs.filter(j => j.status === 'failed').length,
            });
          } else {
            chartData.push({
              name: dateStr,
              jobs: 0,
              success: 0,
              failed: 0,
            });
          }
        }
        setChartData(chartData);

        console.log('✅ Dashboard data loaded:', {
          projects: Array.isArray(projects) ? projects.length : 0,
          jobs: totalJobs,
          results: Array.isArray(jobResults) ? jobResults.length : 0,
        });
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
        setApiStatus({ status: 'error', message: error.message });
      }
    };

    fetchData();
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


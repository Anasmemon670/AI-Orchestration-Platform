import { motion } from 'motion/react';
import { MicVocal, Upload, Mic, Play } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api';

export function VoiceCloning() {
  const [voiceName, setVoiceName] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsResponse = await apiGet('/projects/');
        const projectsList = projectsResponse.results || projectsResponse;
        if (Array.isArray(projectsList) && projectsList.length > 0) {
          setProjects(projectsList);
          setSelectedProjectId(projectsList[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch projects:', err);
      }
    };
    loadProjects();
  }, []);

  const startTraining = async () => {
    if (!voiceName.trim() || !uploadedFile || !selectedProjectId) {
      alert('Please fill voice name, upload file, and select project');
      return;
    }
    
    setLoading(true);
    setIsTraining(true);
    setProgress(0);
    setSuccessMessage('');
    
    try {
      // Create Voice Cloning job via API
      const jobData = {
        project_id: selectedProjectId,
        type: 'voice_cloning',
        status: 'pending',
        progress: 0,
        meta: {
          voice_name: voiceName,
          sample_text: sampleText,
        }
      };
      
      const createdJob = await apiPost('/jobs/', jobData);
      setSuccessMessage(`Voice cloning job created successfully! Job ID: ${createdJob.id}`);
      
      // Simulate progress for UI feedback
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            setLoading(false);
            // Clear form
            setVoiceName('');
            setSampleText('');
            setUploadedFile(null);
            setTimeout(() => setSuccessMessage(''), 5000);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    } catch (error) {
      console.error('Failed to create voice cloning job:', error);
      alert(`Failed to create voice cloning job: ${error.message || 'Please try again.'}`);
      setIsTraining(false);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00FF87] to-[#00D9FF] flex items-center justify-center">
          <MicVocal className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Voice Cloning</h1>
          <p className="text-white/60">Clone any voice with AI precision</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Project Selection */}
          {projects.length > 0 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <Label className="text-white mb-3 block">Select Project</Label>
              <Select value={selectedProjectId?.toString()} onValueChange={(val) => setSelectedProjectId(parseInt(val))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-[#16161F] border-white/10">
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()} className="text-white">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Voice Info */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">Voice Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white/80 mb-2 block">Voice Name</Label>
                <Input
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., Celebrity Voice, My Voice"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#00FF87]/50 focus:ring-[#00FF87]/20"
                />
              </div>
            </div>
          </div>

          {/* Audio Samples */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">Upload Voice Samples</h3>
            <p className="text-white/60 text-sm mb-4">
              Upload 3-5 minutes of clear audio for best results
            </p>
            <FileUploader 
              accept="audio/*" 
              maxSize="50MB"
              onFileSelect={(file) => setUploadedFile(file)}
            />
            
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-[#00FF87] mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white text-sm mb-1">Recording Tips</h4>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• Use high-quality audio (no background noise)</li>
                    <li>• Speak naturally with varied expressions</li>
                    <li>• Include different emotions and tones</li>
                    <li>• Minimum 3 minutes of audio required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Test Generation */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">Test Voice Clone</h3>
            <Label className="text-white/80 mb-2 block">Sample Text</Label>
            <Textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Enter text to test the cloned voice..."
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#00FF87]/50 focus:ring-[#00FF87]/20 resize-none mb-4"
            />

            <div className="flex gap-3">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  onClick={startTraining}
                  disabled={isTraining || loading || !voiceName.trim() || !uploadedFile || !selectedProjectId}
                  className="w-full bg-gradient-to-r from-[#00FF87] to-[#00D9FF] hover:opacity-90 text-white border-0 h-11 disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {isTraining || loading ? 'Creating Job...' : 'Train Model'}
                </Button>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!sampleText}
                className="px-6 h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-white disabled:opacity-50 transition-all"
              >
                <Play className="w-4 h-4" />
                Test
              </motion.button>
            </div>

            {isTraining && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Training Progress</span>
                  <span className="text-white text-sm">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Cloned Voices Library */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-white">My Cloned Voices</h3>
          
          {['Professional Narrator', 'Celebrity Voice', 'Custom Voice 1'].map((name, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF87] to-[#00D9FF] flex items-center justify-center">
                  <MicVocal className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white group-hover:text-[#00FF87] transition-colors">
                    {name}
                  </h4>
                  <p className="text-white/50 text-xs">Ready to use</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs transition-all"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Preview
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}


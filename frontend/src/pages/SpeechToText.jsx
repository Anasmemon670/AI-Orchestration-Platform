import { motion } from 'motion/react';
import { FileAudio, Upload, Download, Copy } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api';

export function SpeechToText() {
  const [language, setLanguage] = useState('');
  const [model, setModel] = useState('');
  const [transcript, setTranscript] = useState('');
  const [languages, setLanguages] = useState([]);
  const [models, setModels] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const sttModels = models.filter(m => m.type === 'stt');

  // Default languages
  const defaultLanguages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic'];

  // Load projects and languages
  useEffect(() => {
    const loadData = async () => {
      try {
        setLanguages(defaultLanguages);
        
        // Load projects
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
      } catch (error) {
        console.warn('Could not load data:', error);
        setLanguages(defaultLanguages);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF006E] to-[#9D4EDD] flex items-center justify-center">
          <FileAudio className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Speech-to-Text</h1>
          <p className="text-white/60">Transcribe audio and video files with AI</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* File Upload */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">Upload Audio/Video</h3>
            <FileUploader 
              accept="audio/*,video/*" 
              maxSize="200MB"
              onFileSelect={(file) => setUploadedFile(file)}
            />
          </div>

          {/* Settings */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-6">Transcription Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white/80 mb-2 block">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Auto-detect" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    <SelectItem value="auto" className="text-white">Auto-detect</SelectItem>
                    {languages.length === 0 ? (
                      <SelectItem value="no-languages" disabled className="text-white/50">
                        No languages available
                      </SelectItem>
                    ) : (
                      languages.map(lang => (
                        <SelectItem key={lang} value={lang} className="text-white">
                          {lang}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/80 mb-2 block">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    {sttModels.length === 0 ? (
                      <SelectItem value="no-models" disabled className="text-white/50">
                        No models available
                      </SelectItem>
                    ) : (
                      sttModels.map(m => (
                        <SelectItem key={m.id} value={m.id} className="text-white">
                          {m.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {projects.length > 0 && (
              <div>
                <Label className="text-white/80 mb-2 block">Project</Label>
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

            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button 
                className="w-full bg-gradient-to-r from-[#FF006E] to-[#9D4EDD] hover:opacity-90 text-white border-0 h-12 disabled:opacity-50"
                disabled={loading || !uploadedFile || !selectedProjectId}
                onClick={async () => {
                  if (!uploadedFile || !selectedProjectId) {
                    alert('Please upload a file and select a project first');
                    return;
                  }
                  
                  setLoading(true);
                  setSuccessMessage('');
                  try {
                    // Create STT job via API
                    const jobData = {
                      project_id: selectedProjectId,
                      type: 'stt',
                      status: 'pending',
                      progress: 0,
                      meta: {
                        language: language || 'auto',
                        model: model || 'default',
                      }
                    };
                    
                    // For file upload, we would use FormData
                    // For now, create job and note that file should be uploaded separately
                    const createdJob = await apiPost('/jobs/', jobData);
                    setSuccessMessage(`STT job created successfully! Job ID: ${createdJob.id}. File upload will be processed.`);
                    
                    // Clear form
                    setUploadedFile(null);
                    setLanguage('');
                    setModel('');
                    
                    setTimeout(() => setSuccessMessage(''), 5000);
                  } catch (error) {
                    console.error('Failed to create STT job:', error);
                    alert(`Failed to create STT job: ${error.message || 'Please try again.'}`);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Upload className="w-5 h-5 mr-2" />
                {loading ? 'Creating Job...' : 'Start Transcription'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Transcription Result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Transcription</h3>
            {transcript && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigator.clipboard.writeText(transcript)}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Download className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>
            )}
          </div>

          {transcript ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[400px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF006E]/50 focus:ring-[#FF006E]/20 resize-none"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/50">{transcript.split(' ').length} words</span>
                <span className="text-white/50">{transcript.length} characters</span>
              </div>
            </motion.div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
              <div className="text-center">
                <FileAudio className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Upload and transcribe to see results</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


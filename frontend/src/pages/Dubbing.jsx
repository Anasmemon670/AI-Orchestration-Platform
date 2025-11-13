import { motion } from 'motion/react';
import { Languages, Play, Upload } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { useState } from 'react';

export function Dubbing() {
  const [selectedModel, setSelectedModel] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [languages, setLanguages] = useState([]);
  const [models, setModels] = useState([]);

  const dubbingModels = models.filter(m => m.type === 'dubbing');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
          <Languages className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Video Dubbing</h1>
          <p className="text-white/60">Translate and dub your videos in multiple languages</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* File Upload */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">Upload Video</h3>
            <FileUploader accept="video/*" maxSize="500MB" />
          </div>

          {/* Settings */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-6">Dubbing Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white/80 mb-2 block">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
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
                <Label className="text-white/80 mb-2 block">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
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

              <div className="md:col-span-2">
                <Label className="text-white/80 mb-2 block">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    {dubbingModels.length === 0 ? (
                      <SelectItem value="no-models" disabled className="text-white/50">
                        No models available
                      </SelectItem>
                    ) : (
                      dubbingModels.map(model => (
                        <SelectItem key={model.id} value={model.id} className="text-white">
                          {model.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button className="w-full bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] hover:opacity-90 text-white border-0 h-12">
                <Play className="w-5 h-5 mr-2" />
                Start Dubbing
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Models Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-white">Available Models</h3>
          {dubbingModels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">No models available</p>
            </div>
          ) : (
            dubbingModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white group-hover:text-[#00D9FF] transition-colors">
                  {model.name}
                </h4>
                {model.isPopular && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#00D9FF]/20 to-[#9D4EDD]/20 text-[#00D9FF]">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm">{model.description}</p>
            </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}


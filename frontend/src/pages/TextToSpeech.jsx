import { motion } from 'motion/react';
import { Mic, Play, Download, Volume2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { useState } from 'react';

export function TextToSpeech() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('');
  const [speed, setSpeed] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [voices, setVoices] = useState([]);
  const [languages, setLanguages] = useState([]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center">
          <Mic className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Text-to-Speech</h1>
          <p className="text-white/60">Convert text to natural-sounding speech</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Text Input */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <Label className="text-white mb-3 block">Enter Your Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#9D4EDD]/50 focus:ring-[#9D4EDD]/20 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/50 text-sm">{text.length} characters</span>
              <span className="text-white/50 text-sm">~{Math.ceil(text.length / 5)} words</span>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-6">Voice Settings</h3>
            
            <div className="space-y-6">
              <div>
                <Label className="text-white/80 mb-2 block">Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    {voices.length === 0 ? (
                      <SelectItem value="no-voices" disabled className="text-white/50">
                        No voices available
                      </SelectItem>
                    ) : (
                      voices.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-white">
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            {v.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-white/80">Speed</Label>
                  <span className="text-white text-sm">{speed[0].toFixed(1)}x</span>
                </div>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-white/80">Pitch</Label>
                  <span className="text-white text-sm">{pitch[0].toFixed(1)}x</span>
                </div>
                <Slider
                  value={pitch}
                  onValueChange={setPitch}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#FF006E] hover:opacity-90 text-white border-0 h-12">
                <Play className="w-5 h-5 mr-2" />
                Generate Speech
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Voice Library */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-white">Voice Library</h3>
          <div className="space-y-3">
            {voices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50 text-sm">No voices available</p>
              </div>
            ) : (
              voices.map((v, index) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => setVoice(v.id)}
                className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all ${
                  voice === v.id ? 'border-[#9D4EDD]' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-sm">{v.name.split(' - ')[0]}</h4>
                    <p className="text-white/50 text-xs">{v.language}</p>
                  </div>
                </div>
                <p className="text-white/60 text-xs">{v.gender} • {v.name.split(' - ')[1]}</p>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


import { motion } from 'motion/react';
import { Film, Sparkles, Play, Image, Music, Type } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState } from 'react';

const videoStyles = ['Cinematic', 'Animated', 'Realistic', 'Artistic', 'Cartoon', 'Documentary'];
const aspectRatios = ['16:9', '9:16', '1:1', '4:3'];

export function MovieStudio() {
  const [script, setScript] = useState('');
  const [style, setStyle] = useState('');
  const [ratio, setRatio] = useState('16:9');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center">
          <Film className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Movie Studio</h1>
          <p className="text-white/60">Create AI-generated videos from text</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="script" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
                <Type className="w-4 h-4 mr-2" />
                Script
              </TabsTrigger>
              <TabsTrigger value="scenes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
                <Image className="w-4 h-4 mr-2" />
                Scenes
              </TabsTrigger>
              <TabsTrigger value="audio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
                <Music className="w-4 h-4 mr-2" />
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-6 mt-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Video Script</h3>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Describe your video scene by scene... Be detailed about visuals, actions, and mood."
                  className="min-h-[300px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#9D4EDD]/50 focus:ring-[#9D4EDD]/20 resize-none"
                />
                <div className="mt-3 text-sm text-white/50">
                  {script.split(' ').filter(w => w).length} words
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-6">Video Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 mb-2 block">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16161F] border-white/10">
                        {videoStyles.map(s => (
                          <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block">Aspect Ratio</Label>
                    <Select value={ratio} onValueChange={setRatio}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16161F] border-white/10">
                        {aspectRatios.map(r => (
                          <SelectItem key={r} value={r} className="text-white">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenes" className="mt-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Scene Timeline</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((scene) => (
                    <motion.div
                      key={scene}
                      whileHover={{ x: 4 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#9D4EDD]/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">Scene {scene}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm mb-1">Scene {scene} Description</h4>
                          <p className="text-white/50 text-xs">Duration: 5s</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="mt-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Background Music</h3>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select music" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    <SelectItem value="epic" className="text-white">Epic Cinematic</SelectItem>
                    <SelectItem value="upbeat" className="text-white">Upbeat Energy</SelectItem>
                    <SelectItem value="calm" className="text-white">Calm Ambient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#FF006E] hover:opacity-90 text-white border-0 h-12">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Video
            </Button>
          </motion.div>
        </motion.div>

        {/* Preview & Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-white">Preview</h3>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Preview will appear here</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-white mb-4">Templates</h3>
            <div className="space-y-3">
              {['Product Demo', 'Social Media', 'Tutorial'].map((template, index) => (
                <motion.div
                  key={template}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer group"
                >
                  <h4 className="text-white group-hover:text-[#9D4EDD] transition-colors mb-1">
                    {template}
                  </h4>
                  <p className="text-white/50 text-xs">Click to use template</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


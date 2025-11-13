import { motion } from 'motion/react';
import { BookOpen, Sparkles, Play, Download, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { useState } from 'react';

const storyGenres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Adventure', 'Comedy', 'Drama'];
const storyLengths = ['Short (500 words)', 'Medium (1000 words)', 'Long (2000 words)', 'Novel (5000+ words)'];

export function AIStories() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [length, setLength] = useState('');
  const [creativity, setCreativity] = useState([0.7]);
  const [story, setStory] = useState('');

  const generateStory = () => {
    // API call will populate story
    setStory('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF006E] to-[#00D9FF] flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">AI Stories</h1>
          <p className="text-white/60">Generate creative stories with AI</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-6">Story Settings</h3>
            
            <div className="space-y-5">
              <div>
                <Label className="text-white/80 mb-2 block">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    {storyGenres.map(g => (
                      <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/80 mb-2 block">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    {storyLengths.map(l => (
                      <SelectItem key={l} value={l} className="text-white">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-white/80">Creativity</Label>
                  <span className="text-white text-sm">{(creativity[0] * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <Label className="text-white/80 mb-2 block">Story Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your story idea..."
                  className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF006E]/50 focus:ring-[#FF006E]/20 resize-none"
                />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button 
                onClick={generateStory}
                className="w-full bg-gradient-to-r from-[#FF006E] to-[#00D9FF] hover:opacity-90 text-white border-0 h-12"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Story
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Generated Story */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Generated Story</h3>
              {story && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigator.clipboard.writeText(story)}
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

            {story ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="prose prose-invert max-w-none">
                    {story.split('\n\n').map((paragraph, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-white/90 mb-4 leading-relaxed"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>{story.split(' ').length} words • {story.length} characters</span>
                  <span>Reading time: ~{Math.ceil(story.split(' ').length / 200)} min</span>
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50 mb-2">Your story will appear here</p>
                  <p className="text-white/30 text-sm">Configure settings and click Generate Story</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


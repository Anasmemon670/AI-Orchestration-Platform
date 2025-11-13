import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Dubbing } from './pages/Dubbing';
import { TextToSpeech } from './pages/TextToSpeech';
import { SpeechToText } from './pages/SpeechToText';
import { VoiceCloning } from './pages/VoiceCloning';
import { AIStories } from './pages/AIStories';
import { MovieStudio } from './pages/MovieStudio';
import { FilmStudio } from './pages/FilmStudio';
import { AIAgents } from './pages/AIAgents';
import { Settings } from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('dark');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'dubbing':
        return <Dubbing key="dubbing" />;
      case 'tts':
        return <TextToSpeech key="tts" />;
      case 'stt':
        return <SpeechToText key="stt" />;
      case 'voice-cloning':
        return <VoiceCloning key="voice-cloning" />;
      case 'ai-stories':
        return <AIStories key="ai-stories" />;
      case 'movie-studio':
        return <MovieStudio key="movie-studio" />;
      case 'film-studio':
        return <FilmStudio key="film-studio" />;
      case 'ai-agents':
        return <AIAgents key="ai-agents" />;
      case 'settings':
        return <Settings key="settings" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex dark">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header theme={theme} onThemeToggle={handleThemeToggle} />

        {/* Page Content with animations */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;


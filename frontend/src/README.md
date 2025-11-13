# AI Orchestration Platform

A modern, VIP-level AI orchestration platform frontend built with React, TypeScript, Tailwind CSS, and Motion (Framer Motion).

## Features

### 🎨 11 Complete Pages
1. **Login Page** - Secure authentication with elegant dark theme
2. **Dashboard** - Real-time job monitoring with charts and statistics
3. **Dubbing** - Multi-language video dubbing
4. **Text-to-Speech** - Natural voice generation from text
5. **Speech-to-Text** - AI-powered transcription
6. **Voice Cloning** - Clone any voice with precision
7. **AI Stories** - Generate creative stories with AI
8. **Movie Studio** - AI video generation from text
9. **Film Studio** - Professional video editing projects
10. **AI Agents** - Automated workflow agents
11. **Settings** - Complete account and preference management

### ✨ Key Features
- **Dark Theme** with VIP-style color palette (neon cyan, purple, pink gradients)
- **Smooth Animations** using Motion (Framer Motion)
- **Responsive Design** optimized for all screen sizes
- **Interactive Charts** with Recharts
- **Glassmorphism Effects** for modern UI
- **Mock Data** for complete functionality demonstration
- **ShadCN UI Components** for consistent design

### 🎨 Color Palette
- Background: `#0A0A0F` (Deep Black)
- Surface: `#16161F` (Dark Gray)
- Accent 1: `#00D9FF` (Cyan)
- Accent 2: `#9D4EDD` (Purple)
- Accent 3: `#FF006E` (Pink)
- Success: `#00FF87` (Green)

## Tech Stack

- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Motion** (Framer Motion) for animations
- **Recharts** for data visualization
- **ShadCN UI** for component library
- **Lucide React** for icons

## Project Structure

```
├── App.tsx                 # Main application component
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── Header.tsx     # Top header with search
│   ├── StatsCard.tsx      # Statistics display cards
│   ├── JobCard.tsx        # Job status cards
│   ├── FileUploader.tsx   # Drag & drop file upload
│   └── ui/                # ShadCN UI components
├── pages/
│   ├── Login.tsx          # Authentication page
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Dubbing.tsx        # Video dubbing
│   ├── TextToSpeech.tsx   # TTS generation
│   ├── SpeechToText.tsx   # STT transcription
│   ├── VoiceCloning.tsx   # Voice cloning
│   ├── AIStories.tsx      # Story generation
│   ├── MovieStudio.tsx    # Video creation
│   ├── FilmStudio.tsx     # Video editing
│   ├── AIAgents.tsx       # Automation agents
│   └── Settings.tsx       # User settings
├── lib/
│   └── mockData.ts        # Mock data for demo
└── types/
    └── index.ts           # TypeScript definitions
```

## Getting Started

The application is ready to use with mock data. Simply interact with the UI to see all features in action.

### Login
Use any email and password to login (authentication is mocked for demo purposes).

### Navigation
Use the sidebar to navigate between different pages. Each page has unique functionality and interactions.

## Features by Page

### Dashboard
- Real-time job statistics
- Weekly job charts
- Success rate visualization
- Recent jobs overview

### Dubbing
- File upload for videos
- Source and target language selection
- AI model selection
- Multi-language support

### Text-to-Speech
- Text input with character count
- Voice selection from library
- Speed and pitch controls
- Voice preview

### Speech-to-Text
- Audio/video file upload
- Language auto-detection
- Multiple AI model options
- Editable transcription output

### Voice Cloning
- Voice sample upload
- Custom voice naming
- Training progress tracking
- Voice library management

### AI Stories
- Genre and length selection
- Creativity slider
- Story prompt input
- Instant generation

### Movie Studio
- Script-based video creation
- Visual style selection
- Scene timeline
- Background music options

### Film Studio
- Project management
- Progress tracking
- Recent activity log
- Quick project access

### AI Agents
- Agent creation and management
- Real-time status monitoring
- Task statistics
- Activity logging

### Settings
- Profile management
- Notification preferences
- Security settings
- Application preferences

## Animations

All pages and components feature smooth animations:
- Page transitions
- Button hover effects
- Card interactions
- Loading states
- Progress animations
- Modal fade effects

## Responsive Design

The application is fully responsive and works on:
- Desktop (1920x1080, 1366x768)
- Tablets
- Mobile devices

## Future Integration

This frontend is prepared for Django backend integration:
- Mock API calls ready to be replaced
- TypeScript interfaces for all data structures
- Modular architecture for easy updates
- Authentication hooks ready for real auth

## Color Coding by Feature

- **Dubbing**: Cyan (`#00D9FF`) to Blue
- **TTS**: Purple (`#9D4EDD`) to Pink
- **STT**: Pink (`#FF006E`) to Purple
- **Voice Cloning**: Green (`#00FF87`) to Cyan
- **Stories**: Pink to Cyan gradient
- **Movie Studio**: Purple to Pink
- **Film Studio**: Cyan to Purple
- **AI Agents**: Green to Cyan

---

**Built with ❤️ for VIP AI Orchestration**

import React, { useState } from 'react';
import { AppProvider } from './providers/AppProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { useTheme } from './providers/ThemeContext';
import { DashboardScreen } from './screens/DashboardScreen';
import { TrackerScreen } from './screens/TrackerScreen';
import { CoachScreen } from './screens/CoachScreen';
import { ChallengesScreen } from './screens/ChallengesScreen';
import { EducationScreen } from './screens/EducationScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  Trophy,
  BookOpen,
  User,
  Sun,
  Moon,
  Leaf,
  Menu,
  X
} from 'lucide-react';

type Screen = 'dashboard' | 'tracker' | 'coach' | 'challenges' | 'education' | 'profile';

const AppShell: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Logger', icon: ClipboardList },
    { id: 'coach', label: 'AI Coach', icon: Sparkles },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'education', label: 'Resources', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'tracker':
        return <TrackerScreen />;
      case 'coach':
        return <CoachScreen />;
      case 'challenges':
        return <ChallengesScreen />;
      case 'education':
        return <EducationScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* SKIP NAVIGATION LINK (Accessibility best practice for keyboard users) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-blue-500/50"
      >
        Skip to main content
      </a>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] no-print">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Leaf className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
            EcoFootprint
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          {/* Sidebar Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION */}
      <nav
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] p-5 flex flex-col justify-between transform transition-transform duration-300 md:transform-none no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 max-md:hidden'
        }`}
        aria-label="Main sidebar navigation"
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="items-center gap-2.5 hidden md:flex">
            <div className="bg-emerald-500/10 p-2 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-black text-base tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
              EcoFootprint
            </span>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isSelected = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentScreen(item.id as Screen);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/30'
                  }`}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer / Theme Toggle */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between hidden md:flex">
          <span className="text-xs font-semibold text-zinc-400">Light / Dark</span>
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto outline-none"
        tabIndex={-1}
      >
        {renderActiveScreen()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;

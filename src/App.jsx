import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import { ResonanceProvider } from '@/lib/resonanceStore';
import Void from '@/pages/Void';
import Sandbox from '@/pages/Sandbox';
import Threads from '@/pages/Threads';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center font-mono">
        <div className="space-y-3 text-center">
          <div 
            className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"
          />
          <div className="text-primary/50 text-xs tracking-widest animate-pulse">INITIALIZING...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/void" replace />} />
        <Route path="/void" element={<Void />} />
        <Route path="/threads" element={<Threads />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/sandbox/:threadId" element={<Sandbox />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ResonanceProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </ResonanceProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
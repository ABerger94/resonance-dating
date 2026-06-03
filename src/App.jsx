import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ProfileProvider } from '@/providers/ProfileProvider';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import useResonanceStore from '@/lib/resonanceStore';
import { canUseAdminTools } from '@/lib/security';
import Void from '@/pages/Void';
import Sandbox from '@/pages/Sandbox';
import Threads from '@/pages/Threads';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import UserSettings from '@/pages/UserSettings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, isAuthenticated } = useAuth();
  const setCurrentUser = useResonanceStore(s => s.setCurrentUser);

  // Sync auth user into Zustand store
  React.useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

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

  if (authError && authError.type !== 'auth_required') {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/void" replace />} />
      <Route path="/register" element={<Navigate to="/void" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/void" replace />} />
      <Route path="/reset-password" element={<Navigate to="/void" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/void" replace />} />
        <Route path="/void" element={<Void />} />
        <Route path="/threads" element={<Threads />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<UserSettings />} />
        {canUseAdminTools(user) && <Route path="/system" element={<Settings />} />}
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
        <ProfileProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
        </ProfileProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
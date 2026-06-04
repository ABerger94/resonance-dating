import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';

import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ProfileProvider, useProfileContext } from '@/providers/ProfileProvider';
import useResonanceStore from '@/lib/resonanceStore';
import { canUseAdminTools } from '@/lib/security';

import Layout from '@/components/Layout';
import PageNotFound from '@/lib/PageNotFound';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

import Void from '@/pages/Void';
import Sandbox from '@/pages/Sandbox';
import Threads from '@/pages/Threads';
import Profile from '@/pages/Profile';
import UserSettings from '@/pages/UserSettings';
import Settings from '@/pages/Settings';

function AppRoutes() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { profile, isReady, refreshProfile } = useProfileContext();
  const setCurrentUser = useResonanceStore(s => s.setCurrentUser);

  React.useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user?.id]);

  // Loading
  if (isLoadingAuth || (isAuthenticated && !isReady)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center font-mono bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <div className="text-primary/50 text-xs tracking-widest animate-pulse">INITIALIZING...</div>
        </div>
      </div>
    );
  }

  // Not logged in — show auth pages
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

  // Logged in but no profile — run onboarding
  if (!profile) {
    return <OnboardingFlow user={user} onComplete={refreshProfile} />;
  }

  // Fully authenticated + profile exists
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
}

function AppWithProviders() {
  const { user } = useAuth();
  return (
    <ProfileProvider user={user}>
      <Router>
        <AppRoutes />
      </Router>
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppWithProviders />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
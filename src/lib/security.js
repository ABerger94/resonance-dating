export const isDevToolsEnabled = () => {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
};

export const isAdminUser = (user) => {
  return user?.role === 'admin';
};

export const canUseAdminTools = (user) => {
  return isDevToolsEnabled() && isAdminUser(user);
};

export const canAccessThread = (thread, userId) => {
  if (!thread || !userId) return false;
  return thread.creator_id === userId || thread.joiner_id === userId;
};

export const isJoinableThread = (thread, userId) => {
  if (!thread || !userId) return false;
  return thread.status === 'void' && thread.creator_id !== userId && !thread.joiner_id;
};

export const sanitizePublicProfile = (profile) => {
  if (!profile) return null;
  return {
    id: profile.id,
    user_id: profile.user_id,
    handle: profile.handle,
    tag_cloud: Array.isArray(profile.tag_cloud) ? profile.tag_cloud : [],
    location: profile.location,
    latitude: profile.latitude,
    longitude: profile.longitude,
    match_radius_miles: profile.match_radius_miles,
    is_mock: !!profile.is_mock,
    mock_id: profile.mock_id
  };
};

export const mergeUnlockedProfileFields = (publicProfile, privateProfile, unlocked) => {
  const profile = sanitizePublicProfile(publicProfile) || {};
  if (!privateProfile || !unlocked) return profile;

  if (unlocked.name) profile.display_name = privateProfile.display_name;
  if (unlocked.interests) profile.interests = privateProfile.interests;
  if (unlocked.bio) profile.bio = privateProfile.bio;
  if (unlocked.photo) {
    const photoUrls = Array.isArray(privateProfile.photo_urls) ? privateProfile.photo_urls : [];
    profile.photo_urls = Array.from(new Set([privateProfile.photo_url, ...photoUrls].filter(Boolean))).slice(0, 6);
    profile.photo_url = profile.photo_urls[0] || '';
  }

  return profile;
};

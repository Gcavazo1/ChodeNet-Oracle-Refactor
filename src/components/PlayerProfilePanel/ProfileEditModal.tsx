import React, { useState } from 'react';
import { X, Save, User, Globe, Image } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  onSave: (updates: any) => Promise<{ success: boolean }>;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSave
}) => {
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates = {
        display_name: displayName,
        username,
        bio,
        avatar_url: avatarUrl
      };
      
      const result = await onSave(updates);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Oracle Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-600/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                placeholder="Your display name"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-gray-800/60 border border-gray-600/30 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                placeholder="username"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-600/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none resize-none"
              placeholder="Tell the Oracle about yourself..."
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-400 mt-1">{bio.length}/200</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Avatar URL</label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-600/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white py-3 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal; 
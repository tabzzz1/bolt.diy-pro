import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslation } from 'react-i18next';
import { classNames } from '~/utils/classNames';
import { profileStore, updateProfile } from '~/lib/stores/profile';
import { authStore, updateUserProfile, uploadAvatar } from '~/lib/stores/auth';
import { toast } from 'react-toastify';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export default function ProfileTab() {
  const { t } = useTranslation('settings');
  const profile = useStore(profileStore);
  const auth = useStore(authStore);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local draft state for username and bio
  const [draftUsername, setDraftUsername] = useState(profile.username);
  const [draftBio, setDraftBio] = useState(profile.bio);

  // Sync draft when profile changes externally (e.g. after avatar upload resets store)
  useEffect(() => {
    setDraftUsername(profile.username);
    setDraftBio(profile.bio);
  }, [profile.username, profile.bio]);

  const isAuthenticated = auth.isAuthenticated;
  const isDirty = draftUsername !== profile.username || draftBio !== profile.bio;

  const handleSave = async () => {
    if (!isDirty) {
      return;
    }

    setIsSaving(true);

    try {
      // Update local store
      updateProfile({ username: draftUsername, bio: draftBio });

      // Sync to cloud if authenticated
      if (isAuthenticated) {
        await updateUserProfile({ username: draftUsername, bio: draftBio });
      }

      toast.success(t('profileTab.saveSuccess'));
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error(error.message || t('profileTab.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t('profileTab.avatarTooLarge'));
      return;
    }

    try {
      setIsUploading(true);

      if (isAuthenticated) {
        await uploadAvatar(file);
        toast.success(t('profileTab.avatarUploaded'));
      } else {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result as string;
          updateProfile({ avatar: base64String });
          setIsUploading(false);
          toast.success(t('profileTab.avatarUploaded'));
        };

        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          setIsUploading(false);
          toast.error(t('profileTab.avatarUploadFailed'));
        };
        reader.readAsDataURL(file);

        return; // let onloadend handle setIsUploading
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || t('profileTab.avatarUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Auth status hint */}
        {isAuthenticated && auth.user?.email && (
          <div
            className={classNames(
              'flex items-center gap-3 px-4 py-3 rounded-xl',
              'bg-purple-50 dark:bg-purple-500/10',
              'border border-purple-200/50 dark:border-purple-500/20',
            )}
          >
            <div className="i-ph:cloud-check w-5 h-5 text-purple-500" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-purple-700 dark:text-purple-300">
                {t('profileTab.syncedToCloud', { email: auth.user.email })}
              </span>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div>
          {/* Avatar Upload */}
          <div className="flex items-start gap-6 mb-8">
            <div
              className={classNames(
                'w-24 h-24 rounded-full overflow-hidden',
                'bg-gray-100 dark:bg-gray-800/50',
                'flex items-center justify-center',
                'ring-1 ring-gray-200 dark:ring-gray-700',
                'relative group',
                'transition-all duration-300 ease-out',
                'hover:ring-purple-500/30 dark:hover:ring-purple-500/30',
                'hover:shadow-lg hover:shadow-purple-500/10',
              )}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className={classNames(
                    'w-full h-full object-cover',
                    'transition-all duration-300 ease-out',
                    'group-hover:scale-105 group-hover:brightness-90',
                  )}
                />
              ) : (
                <div className="i-ph:robot-fill w-16 h-16 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-purple-500/70 transform -translate-y-1" />
              )}

              <label
                className={classNames(
                  'absolute inset-0',
                  'flex items-center justify-center',
                  'bg-black/0 group-hover:bg-black/40',
                  'cursor-pointer transition-all duration-300 ease-out',
                  isUploading ? 'cursor-wait' : '',
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="i-ph:spinner-gap w-6 h-6 text-white animate-spin" />
                ) : (
                  <div className="i-ph:camera-plus w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:scale-110" />
                )}
              </label>
            </div>

            <div className="flex-1 pt-1">
              <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t('profileTab.profilePicture')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profileTab.profilePictureDescription')}</p>
            </div>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('profileTab.username')}
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <div className="i-ph:user-circle-fill w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
              </div>
              <input
                type="text"
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-white dark:bg-gray-800/50',
                  'border border-gray-200 dark:border-gray-700/50',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                  'transition-all duration-300 ease-out',
                )}
                placeholder={t('profileTab.usernamePlaceholder')}
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('profileTab.bio')}
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-3">
                <div className="i-ph:text-aa w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
              </div>
              <textarea
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-white dark:bg-gray-800/50',
                  'border border-gray-200 dark:border-gray-700/50',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                  'transition-all duration-300 ease-out',
                  'resize-none',
                  'h-32',
                )}
                placeholder={t('profileTab.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={classNames(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'text-sm font-medium',
                'transition-all duration-200 ease-out',
                isDirty && !isSaving
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-purple-500/25 cursor-pointer'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed',
              )}
            >
              {isSaving ? (
                <>
                  <div className="i-ph:spinner-gap w-4 h-4 animate-spin" />
                  {t('profileTab.saving')}
                </>
              ) : (
                <>
                  <div className="i-ph:floppy-disk w-4 h-4" />
                  {t('profileTab.saveChanges')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

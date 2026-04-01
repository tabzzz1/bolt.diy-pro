import { useEffect, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { classNames } from '~/utils/classNames';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  sendPasswordResetEmail,
  verifyRecoveryOtp,
  updatePassword,
} from '~/lib/stores/auth';
import { toast } from 'react-toastify';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'reset' | 'reset-code';
}

export function AuthDialog({ open, onClose, initialMode = 'login' }: AuthDialogProps) {
  const { t } = useTranslation('settings');
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'reset-code'>(initialMode);
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isRecoveryCodeVerified, setIsRecoveryCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const shouldShowEmail = true;
  const shouldShowRecoveryCode = mode === 'reset-code';
  const shouldShowPassword = mode !== 'reset';
  const shouldShowConfirmPassword = mode === 'reset-code';
  const shouldShowPasswordStrength = mode === 'register' || mode === 'reset-code';

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const getPasswordStrength = (
    value: string,
  ): { level: 'weak' | 'medium' | 'strong'; score: number; label: string } => {
    if (!value) {
      return { level: 'weak', score: 0, label: t('authDialog.passwordStrength.empty') };
    }

    let score = 0;
    if (value.length >= 6) {
      score += 1;
    }
    if (value.length >= 10) {
      score += 1;
    }
    if (/[A-Z]/.test(value) || /[a-z]/.test(value)) {
      score += 1;
    }
    if (/\d/.test(value)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    }

    if (score >= 4) {
      return { level: 'strong', score, label: t('authDialog.passwordStrength.strong') };
    }
    if (score >= 2) {
      return { level: 'medium', score, label: t('authDialog.passwordStrength.medium') };
    }
    return { level: 'weak', score, label: t('authDialog.passwordStrength.weak') };
  };

  const passwordStrength = getPasswordStrength(password);
  const getEmailError = () =>
    !email.trim()
      ? t('authDialog.errors.emailRequired')
      : !isValidEmail(email)
        ? t('authDialog.errors.emailInvalid')
        : '';
  const getRecoveryCodeError = () =>
    !recoveryCode.trim()
      ? t('authDialog.errors.recoveryCodeRequired')
      : recoveryCode.trim().length < 4
        ? t('authDialog.errors.recoveryCodeInvalid')
        : '';
  const getPasswordError = () =>
    !password
      ? t('authDialog.errors.passwordRequired')
      : password.length < 6
        ? t('authDialog.errors.passwordTooShort')
        : '';
  const getConfirmPasswordError = () =>
    !confirmPassword
      ? t('authDialog.errors.confirmPasswordRequired')
      : confirmPassword.length < 6
        ? t('authDialog.errors.passwordTooShort')
        : confirmPassword !== password
          ? t('authDialog.errors.passwordsDoNotMatch')
          : '';

  const emailError = shouldShowEmail && showValidation ? getEmailError() : '';
  const recoveryCodeError = shouldShowRecoveryCode && showValidation ? getRecoveryCodeError() : '';
  const passwordError = shouldShowPassword && showValidation ? getPasswordError() : '';
  const confirmPasswordError = shouldShowConfirmPassword && showValidation ? getConfirmPasswordError() : '';

  const resetForm = () => {
    setEmail('');
    setRecoveryCode('');
    setIsRecoveryCodeVerified(false);
    setPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
    setShowValidation(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(initialMode);
    resetForm();
  }, [open, initialMode]);

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const switchMode = (nextMode: 'login' | 'register' | 'reset' | 'reset-code') => {
    setShowValidation(false);
    if (mode === 'login' && nextMode === 'register') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRecoveryCode('');
      setIsRecoveryCodeVerified(false);
    }
    setMode(nextMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    const submitEmailError = shouldShowEmail ? getEmailError() : '';
    const submitRecoveryCodeError = shouldShowRecoveryCode ? getRecoveryCodeError() : '';
    const submitPasswordError = shouldShowPassword ? getPasswordError() : '';
    const submitConfirmPasswordError = shouldShowConfirmPassword ? getConfirmPasswordError() : '';
    const hasErrors = Boolean(
      submitEmailError || submitRecoveryCodeError || submitPasswordError || submitConfirmPasswordError,
    );

    if (hasErrors) {
      toast.error(t('authDialog.toast.fixFormErrors'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        toast.success(t('authDialog.toast.loginSuccess'));
        handleClose();
      } else if (mode === 'register') {
        await signUpWithEmail(email, password);
        toast.success(t('authDialog.toast.registerSuccess'));
        handleClose();
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(email);
        toast.success(t('authDialog.toast.resetCodeSent'));
        switchMode('reset-code');
      } else {
        if (!isRecoveryCodeVerified) {
          await verifyRecoveryOtp(email, recoveryCode.trim());
          setIsRecoveryCodeVerified(true);
          toast.success(t('authDialog.toast.recoveryCodeVerified'));
        }
        await updatePassword(password);
        toast.success(t('authDialog.toast.passwordResetSuccess'));
        handleClose();
      }
    } catch (error: any) {
      const fallbackMessage =
        mode === 'login'
          ? t('authDialog.toast.loginFailed')
          : mode === 'register'
            ? t('authDialog.toast.registerFailed')
            : mode === 'reset'
              ? t('authDialog.toast.resetEmailFailed')
              : t('authDialog.toast.resetOrVerifyFailed');
      toast.error(error.message || fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      toast.error(error.message || t('authDialog.toast.loginFailed'));
    }
  };

  const canCloseDialog = true;

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v && canCloseDialog) {
          handleClose();
        }
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10002]" />
        <RadixDialog.Content
          className={classNames(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md p-6 rounded-2xl z-[10003]',
            'bg-white dark:bg-[#1a1a1a]',
            'border border-gray-200 dark:border-gray-800',
            'shadow-2xl',
            'focus:outline-none',
          )}
        >
          <RadixDialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {mode === 'login'
              ? t('authDialog.title.login')
              : mode === 'register'
                ? t('authDialog.title.register')
                : mode === 'reset'
                  ? t('authDialog.title.reset')
                  : t('authDialog.title.resetCode')}
          </RadixDialog.Title>
          <RadixDialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {mode === 'login'
              ? t('authDialog.description.login')
              : mode === 'register'
                ? t('authDialog.description.register')
                : mode === 'reset'
                  ? t('authDialog.description.reset')
                  : t('authDialog.description.resetCode')}
          </RadixDialog.Description>

          {/* OAuth buttons */}
          {mode !== 'reset' && mode !== 'reset-code' && (
            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className={classNames(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                  'bg-gray-900 dark:bg-white',
                  'text-white dark:text-gray-900',
                  'text-sm font-medium',
                  'hover:opacity-90 transition-opacity',
                )}
              >
                <div className="i-ph:github-logo w-5 h-5" />
                GitHub
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className={classNames(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                  'bg-white dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-200',
                  'text-sm font-medium',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>
          )}

          {/* Divider */}
          {mode !== 'reset' && mode !== 'reset-code' && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">{t('authDialog.orUseEmail')}</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {shouldShowEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('authDialog.fields.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isRecoveryCodeVerified) {
                      setIsRecoveryCodeVerified(false);
                    }
                  }}
                  placeholder="name@example.com"
                  aria-invalid={Boolean(emailError)}
                  readOnly={mode === 'reset-code'}
                  className={classNames(
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    emailError
                      ? 'border border-red-400 dark:border-red-500'
                      : 'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    emailError
                      ? 'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-500'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    mode === 'reset-code' ? 'opacity-70 cursor-not-allowed' : '',
                    'transition-all duration-200',
                  )}
                />
                {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
              </div>
            )}
            {shouldShowRecoveryCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('authDialog.fields.recoveryCode')}
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => {
                    setRecoveryCode(e.target.value.trim());
                    if (isRecoveryCodeVerified) {
                      setIsRecoveryCodeVerified(false);
                    }
                  }}
                  placeholder={t('authDialog.fields.recoveryCodePlaceholder')}
                  aria-invalid={Boolean(recoveryCodeError)}
                  readOnly={isRecoveryCodeVerified}
                  className={classNames(
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    recoveryCodeError
                      ? 'border border-red-400 dark:border-red-500'
                      : 'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    recoveryCodeError
                      ? 'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-500'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    isRecoveryCodeVerified ? 'opacity-70 cursor-not-allowed' : '',
                    'transition-all duration-200',
                  )}
                />
                {recoveryCodeError && <p className="mt-1.5 text-xs text-red-500">{recoveryCodeError}</p>}
                {!recoveryCodeError && isRecoveryCodeVerified && (
                  <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    {t('authDialog.recoveryCodeVerifiedHint')}
                  </p>
                )}
              </div>
            )}
            {shouldShowPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {mode === 'reset-code' ? t('authDialog.fields.newPassword') : t('authDialog.fields.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('authDialog.fields.passwordPlaceholder')}
                  aria-invalid={Boolean(passwordError)}
                  className={classNames(
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    passwordError
                      ? 'border border-red-400 dark:border-red-500'
                      : 'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    passwordError
                      ? 'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-500'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-200',
                  )}
                />
                {passwordError ? (
                  <p className="mt-1.5 text-xs text-red-500">{passwordError}</p>
                ) : shouldShowPasswordStrength ? (
                  <>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={classNames(
                            'h-full transition-all duration-300',
                            passwordStrength.level === 'weak'
                              ? 'bg-red-500'
                              : passwordStrength.level === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500',
                          )}
                          style={{
                            width:
                              passwordStrength.score === 0
                                ? '0%'
                                : passwordStrength.level === 'weak'
                                  ? '33%'
                                  : passwordStrength.level === 'medium'
                                    ? '66%'
                                    : '100%',
                          }}
                        />
                      </div>
                      <span
                        className={classNames(
                          'text-xs font-medium',
                          passwordStrength.level === 'weak'
                            ? 'text-red-500'
                            : passwordStrength.level === 'medium'
                              ? 'text-amber-500'
                              : 'text-emerald-500',
                        )}
                      >
                        {t('authDialog.passwordStrength.label')}: {passwordStrength.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('authDialog.passwordHint')}</p>
                  </>
                ) : null}
              </div>
            )}
            {shouldShowConfirmPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('authDialog.fields.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('authDialog.fields.confirmNewPasswordPlaceholder')}
                  aria-invalid={Boolean(confirmPasswordError)}
                  className={classNames(
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    confirmPasswordError
                      ? 'border border-red-400 dark:border-red-500'
                      : 'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    confirmPasswordError
                      ? 'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-500'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-200',
                  )}
                />
                {confirmPasswordError && <p className="mt-1.5 text-xs text-red-500">{confirmPasswordError}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(
                'w-full py-2.5 rounded-xl',
                'bg-purple-500 hover:bg-purple-600',
                'text-white font-medium text-sm',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="i-ph:spinner-gap w-4 h-4 animate-spin" />
                  {mode === 'login'
                    ? t('authDialog.submitting.login')
                    : mode === 'register'
                      ? t('authDialog.submitting.register')
                      : mode === 'reset'
                        ? t('authDialog.submitting.sending')
                        : t('authDialog.submitting.verifying')}
                </div>
              ) : mode === 'login' ? (
                t('authDialog.actions.login')
              ) : mode === 'register' ? (
                t('authDialog.actions.register')
              ) : mode === 'reset' ? (
                t('authDialog.actions.sendCode')
              ) : (
                t('authDialog.actions.confirmReset')
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center">
            {mode === 'reset' || mode === 'reset-code' ? (
              <button
                type="button"
                onClick={() => switchMode(mode === 'reset-code' ? 'reset' : 'login')}
                className="text-sm text-purple-500 hover:text-purple-600 font-medium bg-transparent border-0 p-0 appearance-none"
              >
                {mode === 'reset-code' ? t('authDialog.actions.backStep') : t('authDialog.actions.backToLogin')}
              </button>
            ) : (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'login' ? t('authDialog.switch.noAccount') : t('authDialog.switch.hasAccount')}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium ml-1 bg-transparent border-0 p-0 appearance-none"
                >
                  {mode === 'login' ? t('authDialog.switch.toRegister') : t('authDialog.switch.toLogin')}
                </button>
              </>
            )}
          </div>

          {mode === 'login' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors bg-transparent border-0 p-0 appearance-none"
              >
                {t('authDialog.actions.forgotPassword')}
              </button>
            </div>
          )}
          {mode === 'register' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors bg-transparent border-0 p-0 appearance-none"
              >
                {t('authDialog.actions.recoverPassword')}
              </button>
            </div>
          )}
          {mode === 'reset' && (
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              {t('authDialog.resetMailHint')}
            </div>
          )}
          {mode === 'reset-code' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await sendPasswordResetEmail(email);
                    setIsRecoveryCodeVerified(false);
                    setRecoveryCode('');
                    toast.success(t('authDialog.toast.recoveryCodeResent'));
                  } catch (error: any) {
                    toast.error(error.message || t('authDialog.toast.recoveryCodeSendFailed'));
                  }
                }}
                className="text-sm text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors bg-transparent border-0 p-0 appearance-none"
              >
                {t('authDialog.actions.resendCode')}
              </button>
            </div>
          )}
          {/* Close button */}
          {canCloseDialog && (
            <RadixDialog.Close asChild>
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t('authDialog.actions.close')}
              >
                <div className="i-ph:x w-4 h-4 text-gray-400" />
              </button>
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

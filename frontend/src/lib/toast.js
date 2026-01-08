import toast from 'react-hot-toast';

/**
 * Toast utility functions for consistent notification styling
 */

// Success toast
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    ...options,
  });
};

// Error toast
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 4000,
    ...options,
  });
};

// Loading toast
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, options);
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Promise toast - shows loading, then success or error based on promise result
export const showPromise = (promise, messages = {}) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success!',
    error: messages.error || 'Error occurred',
  });
};

// Custom toast with icon
export const showCustom = (message, options = {}) => {
  return toast(message, options);
};

// Info toast (custom with blue color)
export const showInfo = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    ...options,
  });
};

// Warning toast (custom with yellow color)
export const showWarning = (message, options = {}) => {
  return toast(message, {
    icon: '⚠️',
    duration: 3500,
    ...options,
  });
};

export default {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  promise: showPromise,
  custom: showCustom,
  info: showInfo,
  warning: showWarning,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};

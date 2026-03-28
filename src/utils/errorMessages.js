const firebaseErrorMap = {
  INVALID_PASSWORD: 'Incorrect password. Please try again.',
  EMAIL_NOT_FOUND: 'No account found with this email address.',
  USER_DISABLED: 'This account has been disabled by an administrator.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many failed login attempts. Please try again later.',
  INVALID_LOGIN_CREDENTIALS: 'Invalid email or password. Please check your credentials.',
  USER_NOT_FOUND: 'No account found with this email address.',
  OPERATION_NOT_ALLOWED: 'Password sign-in is disabled for this project.',
  INVALID_EMAIL: 'The email address is badly formatted.',
};

export const getFriendlyErrorMessage = (errorCode) => {
  return firebaseErrorMap[errorCode] || 'An unexpected error occurred. Please try again.';
};

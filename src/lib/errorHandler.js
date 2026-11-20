/**
 * Helper to sanitize technical Firestore, Firebase, and system errors
 * into warm, polite, and user-friendly messages for library users.
 */
export function formatErrorMessage(error) {
  if (!error) return 'Hare Krishna! Something went wrong. Please try again.';

  const rawMessage = typeof error === 'string' ? error : (error?.message || String(error));

  // If already clean or user-facing, return cleanly
  if (
    rawMessage.includes('Hare Krishna') ||
    rawMessage.startsWith('✅') ||
    rawMessage.startsWith('❌') ||
    rawMessage.startsWith('⚠️') ||
    rawMessage.startsWith('📚') ||
    rawMessage.includes('submitted') ||
    rawMessage.includes('successfully')
  ) {
    return rawMessage;
  }

  const lower = rawMessage.toLowerCase();

  // Permission & Authentication errors
  if (lower.includes('permission-denied') || lower.includes('insufficient permissions')) {
    return 'Access limited: Please log in with your verified devotee account to continue.';
  }
  if (lower.includes('auth/user-not-found') || lower.includes('auth/wrong-password') || lower.includes('invalid-credential')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (lower.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please log in or reset your password.';
  }
  if (lower.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (lower.includes('auth/network-request-failed') || lower.includes('network-request-failed') || lower.includes('offline') || lower.includes('unavailable')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  // Record / Document errors
  if (lower.includes('not-found') || lower.includes('document not found')) {
    return 'The requested library record was not found.';
  }

  // Technical Firestore / internal errors (e.g. library_firestore, collection errors)
  if (
    lower.includes('library_firestore') ||
    lower.includes('firestore') ||
    lower.includes('firebaseerror') ||
    lower.includes('internal assertion') ||
    lower.includes('unexpected token')
  ) {
    return 'Unable to update library records at this moment. Please try again shortly or contact the library administrator.';
  }

  return rawMessage;
}

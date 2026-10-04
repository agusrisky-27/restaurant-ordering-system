/**
 * Form field validation helpers
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC 5322 regex approximation for client side validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
}

export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

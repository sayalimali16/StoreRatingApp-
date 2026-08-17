/**
 * Frontend Validation Rules Helper
 */

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const len = name.trim().length;
  if (len < 20 || len > 60) {
    return 'Name must be between 20 and 60 characters long.';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return 'Address is required.';
  const len = address.trim().length;
  if (len === 0) return 'Address is required.';
  if (len > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be 8–16 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Must contain at least 1 uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Must contain at least 1 special character.';
  }
  return '';
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return '';
};

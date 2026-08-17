/**
 * Validation Helper Utility
 * Implements strict system validation requirements for Store Rating App.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

function validateName(name) {
  if (typeof name !== 'string') {
    return 'Name must be a valid text string.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters long.';
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address.';
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string') {
    return 'Address must be a valid text string.';
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address is required.';
  }
  if (trimmed.length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password must be a text string.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long.';
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return 'Password must contain at least 1 uppercase letter.';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must contain at least 1 special character (!@#$%^&* etc.).';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

function validateUserRegistration(data) {
  const errors = {};

  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(data.address);
  if (addressErr) errors.address = addressErr;

  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
  validateUserRegistration
};

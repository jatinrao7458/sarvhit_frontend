const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  // Password should be at least 6 characters
  return password && password.length >= 6;
};

const validateLoginInput = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateSignupInput = (firstName, lastName, email, password, userType) => {
  const errors = {};

  if (!firstName || firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  // Allow lastName to be optional or auto-generate it from firstName if not provided
  if (lastName !== undefined && lastName !== null && lastName.trim() !== '' && lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters if provided';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!userType || !['ngo', 'volunteer', 'sponsor'].includes(userType)) {
    errors.userType = 'Valid user type is required (ngo, volunteer, sponsor)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateLoginInput,
  validateSignupInput
};

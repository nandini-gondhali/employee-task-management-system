export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain uppercase, lowercase, and a number';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validateTaskDates = (startDate, dueDate) => {
  if (!startDate || !dueDate) {
    return 'Start date and due date are required';
  }
  if (new Date(dueDate) < new Date(startDate)) {
    return 'Due date cannot be earlier than start date';
  }
  return null;
};

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const validationMessages = {
  emptyName: "Имя не может быть пустым",
  invalidEmail: "Введите корректный email",
  invalidPhone: "Введите корректный номер телефона (минимум 10 цифр)",
  shortPassword: "Пароль должен быть не короче 6 символов",
  emptyEmailOrPhone: "Введите почту или номер телефона"
} as const;

export const validateName = (name: string): string | null => {
  if (!name.trim()) return validationMessages.emptyName;
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return null;
  if (!emailRegex.test(email.trim())) return validationMessages.invalidEmail;
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return validationMessages.invalidPhone;
  return null;
};

export const validateEmailOrPhone = (value: string): string | null => {
  if (!value.trim()) return validationMessages.emptyEmailOrPhone;
  if (value.includes("@")) return validateEmail(value);
  return validatePhone(value);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) return validationMessages.shortPassword;
  return null;
};

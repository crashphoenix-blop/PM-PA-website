import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateEmailOrPhone,
  validateName,
  validatePassword,
  validatePhone
} from "../../src/shared/lib/validation";

describe("validation helpers", () => {
  it("accepts valid email", () => {
    expect(validateEmail("person@example.com")).toBeNull();
  });

  it("rejects short password", () => {
    expect(validatePassword("12345")).toBe("Пароль должен быть не короче 6 символов");
  });

  it("rejects invalid phone", () => {
    expect(validatePhone("12")).toBe("Введите корректный номер телефона (минимум 10 цифр)");
  });

  it("requires non-empty name", () => {
    expect(validateName("  ")).toBe("Имя не может быть пустым");
  });

  it("validates email-or-phone input", () => {
    expect(validateEmailOrPhone("")).toBe("Введите почту или номер телефона");
  });
});

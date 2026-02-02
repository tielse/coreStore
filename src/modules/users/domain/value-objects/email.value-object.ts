/**
 * Email Value Object
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    if (!email) {
      throw new Error('EMAIL_REQUIRED');
    }

    if (!this.isValid(email)) {
      throw new Error('EMAIL_INVALID');
    }

    return new Email(email.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

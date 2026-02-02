/**
 * Password Value Object
 * Store ONLY hashed password
 */
export class Password {
  private readonly value: string;

  private constructor(hashedPassword: string) {
    this.value = hashedPassword;
  }

  static create(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('PASSWORD_REQUIRED');
    }

    if (hashedPassword.length < 32) {
      throw new Error('PASSWORD_HASH_INVALID');
    }

    return new Password(hashedPassword);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Password): boolean {
    return this.value === other.value;
  }
}

/**
 * Group Domain Entity
 * -------------------
 * Đại diện cho sys_group
 * Tuân thủ DDD & Clean Architecture
 */
export class Group {
  constructor(
    public readonly id: string, // ADMIN, STAFF, SALE
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: 'ACTIVE' | 'INACTIVE',
    public readonly createdBy: string,
    public readonly createdTime: Date,
    public readonly modifiedBy?: string | null,
    public readonly modifiedTime?: Date,
  ) {}

  // =========================
  // Business Rules
  // =========================

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  activate(modifiedBy: string): Group {
    if (this.status === 'ACTIVE') {
      return this;
    }

    return new Group(
      this.id,
      this.name,
      this.description,
      'ACTIVE',
      this.createdBy,
      this.createdTime,
      modifiedBy,
      new Date(),
    );
  }

  deactivate(modifiedBy: string): Group {
    if (this.status === 'INACTIVE') {
      return this;
    }

    return new Group(
      this.id,
      this.name,
      this.description,
      'INACTIVE',
      this.createdBy,
      this.createdTime,
      modifiedBy,
      new Date(),
    );
  }

  rename(params: {
    name?: string;
    description?: string | null;
    modifiedBy: string;
  }): Group {
    return new Group(
      this.id,
      params.name ?? this.name,
      params.description ?? this.description,
      this.status,
      this.createdBy,
      this.createdTime,
      params.modifiedBy,
      new Date(),
    );
  }
}

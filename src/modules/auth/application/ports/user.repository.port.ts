/**
 * Port: User Repository (Domain-driven)
 * Định nghĩa contract cho User persistence layer
 */

export interface IUserRepository {
  /**
   * Tìm user theo ID
   */
  findById(id: string): Promise<any>;

  /**
   * Tìm user theo Keycloak ID (external)
   */
  findByKeycloakId(keycloakId: string): Promise<any>;

  /**
   * Tìm user theo email
   */
  findByEmail(email: string): Promise<any>;

  /**
   * Tạo user mới
   */
  create(user: any): Promise<any>;

  /**
   * Cập nhật user
   */
  update(id: string, updates: Partial<any>): Promise<any>;

  /**
   * Xóa user
   */
  delete(id: string): Promise<void>;

  /**
   * Liệt kê danh sách users với pagination/filtering
   */
  list(params?: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: any[]; total: number }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

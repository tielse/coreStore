import { LoginRequest } from "./auth.entity"

export interface AuthPort {
  login(payload: LoginRequest): Promise<void>
  logout(): Promise<void>
}

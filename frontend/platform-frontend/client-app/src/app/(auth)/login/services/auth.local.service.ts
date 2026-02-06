import axios from "axios"
import { AuthPort } from "../entities/auth.port"
import { LoginRequest } from "../entities/auth.entity"

export class LocalAuthService implements AuthPort {
  async login(payload: LoginRequest): Promise<void> {
    await axios.post(
      "/api/auth/login",
      payload,
      { withCredentials: true }
    )
  }

  async logout(): Promise<void> {
    await axios.post(
      "/api/auth/logout",
      {},
      { withCredentials: true }
    )
  }
}

import { AuthPort } from "../entities/auth.port"
import { LocalAuthService } from "./auth.local.service"

export class AuthService {
  private static instance: AuthPort

  static get(): AuthPort {
    if (!this.instance) {
      this.instance = new LocalAuthService()
    }
    return this.instance
  }
}

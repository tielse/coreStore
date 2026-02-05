export interface LoginRequest {
  username: string
  password: string
}

export enum UserTier {
  GUEST = "GUEST",
  REGULAR = "REGULAR",
  VIP = "VIP",
}

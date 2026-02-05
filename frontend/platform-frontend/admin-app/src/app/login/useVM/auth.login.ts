export function loginWithKeycloak() {
  window.location.href = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/admin/protocol/openid-connect/auth?...`
}

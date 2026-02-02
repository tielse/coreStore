import jwksClient from 'jwks-rsa';

// TẠO JWKS CLIENT
export const jwks = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

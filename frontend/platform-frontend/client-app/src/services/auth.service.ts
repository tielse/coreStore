export const AuthService = {
  login: (payload) =>
    fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(r => r.json()),

  register: (payload) =>
    fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(r => r.json()),

  google: (idToken) =>
    fetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }).then(r => r.json()),
}

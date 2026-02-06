export async function POST(req: Request) {
  const { idToken } = await req.json()

  const { data } = await gqlClient.mutate({
    mutation: GOOGLE_LOGIN_MUTATION,
    variables: { idToken },
  })

  const res = NextResponse.json(data.loginWithGoogle)
  res.cookies.set('access_token', data.loginWithGoogle.accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
  })

  return res
}

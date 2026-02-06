export async function POST(req: Request) {
  const body = await req.json()

  const { data } = await gqlClient.mutate({
    mutation: REGISTER_MUTATION,
    variables: { input: body },
  })

  return NextResponse.json(data.register)
}

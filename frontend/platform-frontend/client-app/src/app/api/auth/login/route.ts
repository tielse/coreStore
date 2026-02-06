import { NextResponse } from 'next/server'
import { gqlClient } from '@/libs/gql.client'


export async function POST(req: Request) {
const body = await req.json()


const { data } = await gqlClient.mutate({
mutation: LOGIN_MUTATION,
variables: { input: body },
})


const res = NextResponse.json(data.login)


res.cookies.set('access_token', data.login.accessToken, {
httpOnly: true,
secure: true,
path: '/',
})


return res
}
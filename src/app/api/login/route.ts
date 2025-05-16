import { NextResponse } from 'next/server';
import apiManager from "@/core/services/apiManager";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const data = await apiManager.login(email, password);
    const token = data.data.token;
    const response = NextResponse.json(data, { status: 200 });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

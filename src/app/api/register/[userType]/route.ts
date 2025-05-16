import { NextResponse } from 'next/server';
import apiManager from "@/core/services/apiManager";

export async function POST(req: Request, { params }: { params: { userType: string } }) {
    const { userType } = params;
    const userData = await req.json();

    try {
        const data = await apiManager.registerUser(userData, userType);
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('Registration error:', error.message);
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

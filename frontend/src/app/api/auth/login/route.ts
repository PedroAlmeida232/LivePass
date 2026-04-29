import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email,
      password,
    });

    const { token, role } = response.data;

    const nextResponse = NextResponse.json({
      email,
      role,
      success: true
    });

    // Set the httpOnly cookie
    nextResponse.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return nextResponse;
  } catch (error: any) {
    console.error("Login error in API route:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Invalid credentials" },
      { status: error.response?.status || 401 }
    );
  }
}

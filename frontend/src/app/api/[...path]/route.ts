import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest("GET", request, params.path);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest("POST", request, params.path);
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest("PUT", request, params.path);
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest("DELETE", request, params.path);
}

async function proxyRequest(method: string, request: Request, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const url = `${BACKEND_URL}/api/${path}`;
  
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  try {
    let body;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.json();
      } catch (e) {
        body = undefined;
      }
    }
    
    const response = await axios({
      method,
      url,
      data: body,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      validateStatus: () => true, 
    });

    if (response.status >= 400) {
      console.error(`⚠️ Backend returned error (${response.status}) for ${method} ${path}:`, response.data);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const errorData = error.response?.data;
    const errorStatus = error.response?.status || 500;
    
    console.error(`❌ Proxy error (${method} ${path}):`, {
      status: errorStatus,
      message: error.message,
      backendResponse: errorData
    });

    return NextResponse.json(
      errorData || { message: "Internal Server Error" },
      { status: errorStatus }
    );
  }
}

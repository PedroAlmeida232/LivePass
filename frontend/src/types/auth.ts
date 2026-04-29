export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: "CUSTOMER" | "STAFF";
}

export interface RegisterRequest {
  email: string;
  password: string;
  cpf: string;
  role?: "CUSTOMER" | "STAFF";
}

export interface User {
  email: string;
  role: "CUSTOMER" | "STAFF";
}

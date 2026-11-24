import type { ApiDataResponse } from "../models/api.types";
import { httpRequest } from "./http.service";

const TOKEN_KEY = "accessToken";

export interface LoginData {
  user: { id: string; name: string; email: string; role: string };
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<LoginData> {
  const response = await httpRequest<ApiDataResponse<LoginData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(response.data.accessToken);
  return response.data;
}

export function logout(): void {
  clearAccessToken();
}

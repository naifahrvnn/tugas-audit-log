import { api } from './client';
import type { User } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function registerRequest(input: RegisterInput): Promise<void> {
  await api.post('/auth/register', input);
}

// Sesuaikan di sini kalau token di response login letaknya beda.
export async function loginRequest(email: string, password: string): Promise<string> {
  const res = await api.post('/auth/login', { email, password });
  const body = res.data;
  const token: string | undefined = body?.data?.token ?? body?.data?.accessToken ?? body?.token;
  if (!token) throw new Error('Token tidak ditemukan pada response login.');
  return token;
}

// Sesuaikan di sini kalau bentuk response /auth/me beda.
export async function getMe(): Promise<User> {
  const res = await api.get('/auth/me');
  const payload = res.data?.data ?? res.data;
  return (payload.user ?? payload) as User;
}
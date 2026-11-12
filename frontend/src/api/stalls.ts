import { api } from './client';
import type { PageMeta, Stall, StallInput } from '../types';

export interface StallQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function listStalls(query: StallQuery): Promise<{ data: Stall[]; meta: PageMeta }> {
  const res = await api.get<{ data: Stall[]; meta: PageMeta }>('/stalls', { params: query });
  return { data: res.data.data, meta: res.data.meta };
}

export async function getStall(id: string | number): Promise<Stall> {
  const res = await api.get<{ data: Stall }>(`/stalls/${id}`);
  return res.data.data;
}

export async function createStall(input: StallInput): Promise<Stall> {
  const res = await api.post<{ data: Stall }>('/stalls', input);
  return res.data.data;
}

export async function updateStall(id: string | number, input: Partial<StallInput>): Promise<Stall> {
  const res = await api.put<{ data: Stall }>(`/stalls/${id}`, input);
  return res.data.data;
}

export async function deleteStall(id: string | number): Promise<void> {
  await api.delete(`/stalls/${id}`);
}
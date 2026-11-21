export type Role = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular: boolean;
}

export interface StallInput {
  name: string;
  category?: string;
  location?: string;
  description?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AuditMetadata {
  role?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  result?: string;
  [key: string]: unknown;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: AuditMetadata | null;
  createdAt: string | null;
}

export interface AuditPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
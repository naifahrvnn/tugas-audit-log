import type { Stall, User } from '../types';

// Ini cuma untuk mengatur tampilan (UX). Keamanan sebenarnya tetap di backend.
export const canCreateStall = (user: User | null): boolean =>
  user?.role === 'admin' || user?.role === 'owner';

export const canEditStall = (user: User | null, stall: Stall): boolean =>
  !!user && (user.role === 'admin' || (user.role === 'owner' && stall.ownerId === user.id));

export const canDeleteStall = (user: User | null): boolean => user?.role === 'admin';
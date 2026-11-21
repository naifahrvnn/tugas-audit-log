import type { Request } from 'express';

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export function getRequestContext(req: Request): RequestContext {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
  };
}
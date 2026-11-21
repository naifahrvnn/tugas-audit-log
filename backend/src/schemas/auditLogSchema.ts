import { z, type ZodError } from 'zod';

const positiveInt = (name: string) =>
  z.coerce
    .number({ invalid_type_error: `${name} harus bilangan bulat positif` })
    .int(`${name} harus bilangan bulat positif`)
    .positive(`${name} harus bilangan bulat positif`);

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const dateParam = (name: string) =>
  z.string().refine(isRealDate, `${name} harus tanggal yang valid dengan format YYYY-MM-DD`);

export const auditLogQuerySchema = z
  .object({
    page: z.coerce
      .number({ invalid_type_error: 'page harus berupa angka' })
      .int('page harus bilangan bulat')
      .min(1, 'page minimal 1')
      .default(1),
    pageSize: z.coerce
      .number({ invalid_type_error: 'pageSize harus berupa angka' })
      .int('pageSize harus bilangan bulat')
      .min(1, 'pageSize minimal 1')
      .max(100, 'pageSize maksimal 100')
      .default(20),
    action: z.string().trim().min(1, 'action tidak boleh kosong').max(50, 'action maksimal 50 karakter').optional(),
    targetTable: z.string().trim().min(1, 'targetTable tidak boleh kosong').max(50, 'targetTable maksimal 50 karakter').optional(),
    targetId: positiveInt('targetId').optional(),
    userId: positiveInt('userId').optional(),
    from: dateParam('from').optional(),
    to: dateParam('to').optional(),
  })
  .strict() // parameter tak dikenal ditolak
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: 'from tidak boleh lebih besar dari to',
    path: ['from'],
  });

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;

export const auditLogIdSchema = z.object({ id: positiveInt('id') });

export interface FieldError {
  field: string;
  message: string;
}

// Format error sama dengan Tugas 3: { field, message }
export function toFieldErrors(error: ZodError): FieldError[] {
  return error.issues.flatMap((issue) => {
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({ field: key, message: `parameter ${key} tidak dikenal` }));
    }
    return [{ field: issue.path.join('.'), message: issue.message }];
  });
}
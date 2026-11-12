import axios from 'axios';

export interface ParsedError {
  status?: number;
  message: string;
  fieldErrors: Record<string, string>;
}

interface BackendErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

export function parseApiError(error: unknown): ParsedError {
  if (axios.isAxiosError<BackendErrorBody>(error)) {
    // Tidak ada response sama sekali: backend mati / jaringan putus / CORS.
    if (!error.response) {
      return {
        message: 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.',
        fieldErrors: {},
      };
    }

    const { status, data } = error.response;
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        if (!(item.field in fieldErrors)) fieldErrors[item.field] = item.message;
      }
    }

    let message = data?.message;
    if (!message) {
      if (status === 401) message = 'Kamu belum login atau sesi sudah berakhir.';
      else if (status === 403) message = 'Kamu tidak punya akses untuk melakukan aksi ini.';
      else if (status === 404) message = 'Data tidak ditemukan.';
      else message = 'Terjadi kesalahan pada server.';
    }
    return { status, message, fieldErrors };
  }

  if (error instanceof Error) return { message: error.message, fieldErrors: {} };
  return { message: 'Terjadi kesalahan yang tidak terduga.', fieldErrors: {} };
}
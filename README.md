# Review Kantin

Sistem review kantin: backend REST API (Express.js + SQL Server) dan frontend React.

## Teknologi
- Backend: Express.js, TypeScript, Drizzle ORM, SQL Server, zod, JWT
- Frontend: React (TypeScript), Vite, React Router, Axios

## Instalasi
1. Siapkan database SQL Server, lalu jalankan script di folder `db/` secara berurutan
   (`01-...` untuk login, `02-schema.sql`, `03-seed.sql`).
2. Backend (di root repo):
   ```
   npm install
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   ```

## Konfigurasi environment
Salin `.env.example` menjadi `.env` lalu isi nilainya (jangan di-commit).

- Backend (`.env` di root): `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
  `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- Frontend (`frontend/.env`): `VITE_API_BASE_URL` (contoh: `http://localhost:3000/api/v1`)

## Menjalankan
Backend (terminal 1, di root repo):
```
npm run dev
```
Frontend (terminal 2):
```
cd frontend
npm run dev
```
Buka http://localhost:5173. Dokumentasi API ada di http://localhost:3000/docs.

## Role
- **public**: melihat daftar dan detail warung, register, login
- **customer**: sama seperti public, tanpa akses pengelolaan warung
- **owner**: membuat warung dan mengubah warung miliknya
- **admin**: membuat, mengubah, dan menghapus semua warung
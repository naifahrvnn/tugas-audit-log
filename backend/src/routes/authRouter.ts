import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { validate } from '../middlewares/validate.ts';
import { loginSchema, registerSchema } from '../schemas/authSchema.ts';
import { authenticate } from '../middlewares/auth.ts'; // Sesuaikan path middleware auth kamu

const authRouter = Router();
const authController = new AuthController();

// Route publik
authRouter.post('/register', validate(registerSchema, 'body'), authController.register);
authRouter.post('/login', validate(loginSchema, 'body'), authController.login);

// TAMBAHKAN ROUTE INI: Untuk mengambil profil user yang sedang login (butuh token)
authRouter.get('/me', authenticate, authController.getMe); 
authRouter.post('/logout', authenticate, authController.logout);

export { authRouter };
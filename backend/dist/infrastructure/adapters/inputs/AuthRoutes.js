import { Router } from 'express';
import { register, login } from './AuthController';
const router = Router();
router.post('/register', register);
router.post('/login', login);
export default router;
//# sourceMappingURL=AuthRoutes.js.map
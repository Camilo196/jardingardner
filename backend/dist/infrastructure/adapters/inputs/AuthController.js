import { AuthService } from '../../../core/services/AuthService';
const authService = new AuthService();
export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.register(email, password);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({});
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await authService.login(email, password);
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(400).json({});
    }
};
//# sourceMappingURL=AuthController.js.map
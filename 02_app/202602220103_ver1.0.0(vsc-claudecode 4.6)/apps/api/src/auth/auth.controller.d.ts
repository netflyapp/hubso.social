import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from '@hubso/shared';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<{
        id: string;
        email: string;
        message: string;
    }>;
    login(input: LoginInput): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(input: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map
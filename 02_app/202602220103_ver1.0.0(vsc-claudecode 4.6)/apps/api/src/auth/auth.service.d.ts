import { JwtService } from '@nestjs/jwt';
import { RegisterInput, LoginInput } from '@hubso/shared';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    register(input: RegisterInput): Promise<{
        id: string;
        email: string;
        message: string;
    }>;
    login(input: LoginInput): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map
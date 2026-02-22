import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(): Promise<{
        id: string;
        email: string;
        username: string;
    }>;
    getById(id: string): Promise<{
        id: string;
        email: string;
        username: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map
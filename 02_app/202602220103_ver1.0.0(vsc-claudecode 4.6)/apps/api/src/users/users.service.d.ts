export declare class UsersService {
    findById(id: string): Promise<{
        id: string;
        email: string;
        username: string;
    }>;
    findByEmail(email: string): Promise<null>;
}
//# sourceMappingURL=users.service.d.ts.map
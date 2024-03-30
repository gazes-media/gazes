import { PrismaClient } from '@prisma/client';
import { hash, verify } from 'argon2';
import { signJWT } from '../utils/jwtUtils';
import { config } from '@api/config';

export class UserService {
    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async registerUser(email: string, username: string, password: string) {
        const hashedPassword = await hash(password);
        const newUser = await this.prisma.user.create({
            data: { email, username, password: hashedPassword },
            select: { id: true, username: true },
        });

        const token = signJWT({ id: newUser.id }, config.JWT_SECRET);
        return { user: newUser, token };
    }

    async authenticateUser(email: string, password: string) {
        const userWithPassword = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, username: true, password: true },
        });

        if (!userWithPassword || !(await verify(userWithPassword.password, password))) {
            throw new Error('Invalid Credentials');
        }

        const { password: _, ...userWithoutPassword } = userWithPassword;

        const token = signJWT({ id: userWithoutPassword.id }, config.JWT_SECRET);
        return { user: userWithoutPassword, token };
    }
}

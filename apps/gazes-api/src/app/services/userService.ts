import { PrismaClient } from '@prisma/client';
import { hash, verify } from 'argon2';
import { signJWT } from '../utils/jwtUtils';
import { config } from '@api/config';

/**
 * Service class for handling user-related operations such as registration and authentication.
 */
export class UserService {
    private readonly prisma: PrismaClient;

    /**
     * Creates a UserService instance.
     *
     * @param {PrismaClient} prisma - The Prisma client instance to be used for database operations.
     */
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Registers a new user with the given email, username, and password.
     *
     * @param {string} email - The email of the new user.
     * @param {string} username - The username of the new user.
     * @param {string} password - The password for the new user.
     * @returns {Promise<{ user: { id: number; username: string; }, token: string }>}
     *          An object containing the new user (excluding the password) and a JWT token.
     */
    async registerUser(email: string, username: string, password: string) {
        const hashedPassword = await hash(password);
        const newUser = await this.prisma.user.create({
            data: { email, username, password: hashedPassword },
            select: { id: true, username: true },
        });

        const token = signJWT({ id: newUser.id }, config.JWT_SECRET);
        return { user: newUser, token };
    }

    /**
     * Authenticates a user based on email and password.
     *
     * @param {string} email - The email of the user trying to log in.
     * @param {string} password - The password of the user trying to log in.
     * @returns {Promise<{ user: { id: number; username: string; }, token: string }>}
     *          An object containing the authenticated user (excluding the password) and a JWT token.
     * @throws {Error} If the credentials are invalid or the user cannot be found.
     */
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

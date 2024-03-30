import { FastifyInstance } from 'fastify';
import { AppOptions } from '@api/main';
import argon2 from 'argon2';
import { RegisterBody, LoginBody, LoginBodySchema, RegisterBodySchema } from '@api/contracts/authContract';
import { signJWT } from '../utils/jwtUtils';
import { config } from '@api/config';
import { UserService } from '../services/userService';

export default async function (fastify: FastifyInstance, { redis, prisma }: AppOptions) {
    const userService = new UserService(prisma);

    /**
     * @fileoverview This handler is responsible for registering the user.
     *
     * @description The handler takes the user's email, password, and username as input and creates a new user.
     * It then returns the user object and sets a JWT token in the response header.
     *
     * Body Parameters:
     * - email: string
     * - password: string
     * - username: string
     *
     * Response:
     * - 201: User created successfully
     * - 400: User already exists
     *
     */
    fastify.post<{ Body: RegisterBody }>(
        '/register',
        {
            schema: { body: RegisterBodySchema },
        },
        async function (req, rep) {
            try {
                const { email, username, password } = req.body;
                const { user, token } = await userService.registerUser(email, username, password);

                rep.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
                rep.status(201).send(user);
            } catch (e) {
                if (e.code === 'P2002') {
                    rep.status(400).send('User already exists');
                    return;
                }
                rep.status(500).send('An unexpected error occurred');
            }
        }
    );
    /**
     * @fileoverview This handler is responsible for authenticating the user.
     *
     * @description The handler takes the user's email and password as input and verifies the credentials.
     * If the credentials are valid, it returns the user object and sets a JWT token in the response header.
     * Otherwise, it returns an error message.
     *
     * Body Parameters:
     * - email: string
     * - password: string
     *
     * Response:
     * - 200: User authenticated successfully
     * - 401: Invalid Credentials
     * - 400: Invalid Credentials
     *
     */
    fastify.post<{ Body: LoginBody }>('/login', { schema: { body: LoginBodySchema } }, async function (req, rep) {
        try {
            const { email, password } = req.body;
            const { user, token } = await userService.authenticateUser(email, password);

            rep.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
            rep.status(200).send(user);
        } catch (e) {
            if (e.message === 'Invalid Credentials') {
                rep.status(401).send(e.message);
                return;
            }
            console.error(e);
            rep.status(500).send('An unexpected error occurred');
        }
    });
}

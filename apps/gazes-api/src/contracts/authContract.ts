import { Type, Static } from "@sinclair/typebox";


export type RegisterBody = Static<typeof RegisterBodySchema>;

export const RegisterBodySchema = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ pattern: "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$" }),
    username: Type.String(),
});


export type LoginBody = Static<typeof LoginBodySchema>;

export const LoginBodySchema = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String(),
});


export interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

export const RegisterBodySchema = {
  type: "object",
  required: ["email", "password", "username"],
  properties: {
    email: {
      type: "string",
      pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    },
    password: { 
        type: "string",
        pattern: "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$",
    },
    username: { type: "string" },
  },
};

export interface LoginBody {
  email: string;
  password: string;
}

export const LoginBodySchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
};

export interface JWTToken {
  iss?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

// services/types.ts

export interface LoginData {
    token: string;
    user: object;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: LoginData;
}

export interface Response {
    success: boolean;
    message: string;
    data: object;
}

export interface UserData {
    email: string;
    password: string;
    first_name: string,
    last_name: string,
    chain: string,
    phone: string,
}

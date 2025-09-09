import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role?: string; // optional if you store roles
    };
}

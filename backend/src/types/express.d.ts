import { User } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

// Este export vacío es necesario para que TypeScript trate esto como un módulo
export {};

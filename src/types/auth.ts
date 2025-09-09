export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  entityType: 'user';
}

export interface AuthenticatedNgo {
  ngoId: string;
  email: string;
  name: string;
  entityType: 'ngo';
}

export type AuthenticatedEntity = AuthenticatedUser | AuthenticatedNgo;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      ngo?: AuthenticatedNgo;
      entity?: AuthenticatedEntity;
    }
  }
}

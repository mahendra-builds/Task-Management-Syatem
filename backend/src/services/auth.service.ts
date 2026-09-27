import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken } from '../utils/jwt';
import { badRequest, conflict, unauthorized } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validators';

const prisma = new PrismaClient();

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
} as const;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw conflict('A user with this email already exists');
    }
    const hashed = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: Role.MEMBER,
      },
      select: PUBLIC_USER_SELECT,
    });
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw unauthorized('Invalid email or password');
    }
    if (!user.isActive) {
      throw unauthorized('Account is deactivated');
    }
    const ok = await verifyPassword(input.password, user.password);
    if (!ok) {
      throw unauthorized('Invalid email or password');
    }
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const { password: _password, ...safe } = user;
    void _password;
    return { user: safe, token };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw badRequest('User not found');
    }
    return user;
  },

  async logout() {
    // Stateless JWT — the client discards the token.
    // If refresh tokens are wired in, revoke them here.
    return { message: 'Logged out' };
  },
};

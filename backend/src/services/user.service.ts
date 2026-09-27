import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
  unauthorized,
} from '../middleware/errorHandler';
import {
  AdminUpdateUserInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validators/user.validators';

const prisma = new PrismaClient();

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userService = {
  async listAll() {
    return prisma.user.findMany({
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw notFound('User not found');
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: PUBLIC_USER_SELECT,
    });
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound('User not found');
    const ok = await verifyPassword(input.currentPassword, user.password);
    if (!ok) throw unauthorized('Current password is incorrect');
    const hashed = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Password updated' };
  },

  async adminUpdate(targetId: string, actorRole: Role, input: AdminUpdateUserInput) {
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw notFound('User not found');

    if (actorRole !== Role.ADMIN) {
      throw forbidden('Only admins can modify other users');
    }

    if (
      input.role === Role.MEMBER &&
      target.role === Role.ADMIN &&
      !(await this._lastAdminCheck(targetId))
    ) {
      throw badRequest('Cannot demote the last active admin');
    }

    return prisma.user.update({
      where: { id: targetId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: PUBLIC_USER_SELECT,
    });
  },

  async adminDelete(targetId: string, actorId: string, actorRole: Role) {
    if (actorRole !== Role.ADMIN) {
      throw forbidden('Only admins can delete users');
    }
    if (targetId === actorId) {
      throw badRequest('Admins cannot delete themselves');
    }
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw notFound('User not found');
    if (target.role === Role.ADMIN && !(await this._lastAdminCheck(targetId))) {
      throw badRequest('Cannot delete the last active admin');
    }
    try {
      await prisma.user.delete({ where: { id: targetId } });
    } catch {
      throw conflict('Cannot delete user with dependent records');
    }
    return { message: 'User deleted' };
  },

  async _lastAdminCheck(adminId: string): Promise<boolean> {
    const otherAdmins = await prisma.user.count({
      where: {
        role: Role.ADMIN,
        isActive: true,
        id: { not: adminId },
      },
    });
    return otherAdmins > 0;
  },
};

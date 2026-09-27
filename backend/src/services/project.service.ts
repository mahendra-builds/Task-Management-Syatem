import { PrismaClient, ProjectStatus, ProjectMemberRole, Prisma } from '@prisma/client';
import { notFound, forbidden, badRequest, conflict } from '../middleware/errorHandler';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from '../validators/project.validators';

const prisma = new PrismaClient();

const PROJECT_INCLUDE = {
  owner: {
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  },
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true, role: true },
      },
    },
  },
  _count: {
    select: { tasks: true, members: true },
  },
} satisfies Prisma.ProjectInclude;

export const projectService = {
  async list(userId: string, query: ListProjectsQuery) {
    const { status, q, page, pageSize } = query;
    const where: Prisma.ProjectWhereInput = {
      AND: [
        {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        ...(status ? [{ status }] : []),
        ...(q
          ? [
              {
                OR: [
                  { name: { contains: q } },
                  { description: { contains: q } },
                ],
              },
            ]
          : []),
      ],
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw notFound('Project not found');
    return project;
  },

  async create(userId: string, input: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? ProjectStatus.PLANNING,
        ownerId: userId,
        members: {
          create: { userId, role: ProjectMemberRole.OWNER },
        },
      },
      include: PROJECT_INCLUDE,
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_CREATED',
        actorId: userId,
        projectId: project.id,
        metadata: { name: project.name },
      },
    });

    return project;
  },

  async update(userId: string, id: string, input: UpdateProjectInput) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw notFound('Project not found');

    const isOwner = project.ownerId === userId;
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });
    const canEdit =
      isOwner ||
      (membership && (membership.role === ProjectMemberRole.MANAGER || membership.role === ProjectMemberRole.OWNER));

    if (!canEdit) throw forbidden('You do not have permission to edit this project');

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
      },
      include: PROJECT_INCLUDE,
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_UPDATED',
        actorId: userId,
        projectId: id,
        metadata: { changes: input },
      },
    });

    return updated;
  },

  async delete(userId: string, id: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw notFound('Project not found');
    if (project.ownerId !== userId) {
      throw forbidden('Only the project owner can delete it');
    }
    await prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  },

  async addMember(actorId: string, projectId: string, userId: string, role?: ProjectMemberRole) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw notFound('Project not found');
    await this._assertCanManageMembers(actorId, project);

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw notFound('User not found');
    if (!targetUser.isActive) throw badRequest('Cannot add inactive user');

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) throw conflict('User is already a member');

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: role ?? ProjectMemberRole.MEMBER,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, role: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_MEMBER_ADDED',
        actorId,
        projectId,
        metadata: { addedUserId: userId, role: member.role },
      },
    });

    return member;
  },

  async removeMember(actorId: string, projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw notFound('Project not found');
    await this._assertCanManageMembers(actorId, project);

    if (project.ownerId === userId) {
      throw badRequest('Cannot remove the project owner');
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw notFound('Member not found');

    await prisma.projectMember.delete({ where: { id: member.id } });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_MEMBER_REMOVED',
        actorId,
        projectId,
        metadata: { removedUserId: userId },
      },
    });

    return { message: 'Member removed' };
  },

  async _assertCanManageMembers(actorId: string, project: { id: string; ownerId: string }) {
    if (project.ownerId === actorId) return;
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId: actorId } },
    });
    if (membership && membership.role === ProjectMemberRole.MANAGER) return;
    throw forbidden('Only the project owner or a project manager can manage members');
  },
};

import { PrismaClient, Role, ProjectStatus, ProjectMemberRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.info('[seed] starting...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const memberHash = await bcrypt.hash('Member@123', 10);

  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Alice Manager',
      email: 'alice@example.com',
      password: passwordHash,
      role: Role.MANAGER,
      isActive: true,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Bob Member',
      email: 'bob@example.com',
      password: memberHash,
      role: Role.MEMBER,
      isActive: true,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Carol Member',
      email: 'carol@example.com',
      password: memberHash,
      role: Role.MEMBER,
      isActive: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Migrate the corporate website to a modern stack.',
      status: ProjectStatus.ACTIVE,
      ownerId: admin.id,
      members: {
        create: [
          { userId: manager.id, role: ProjectMemberRole.MANAGER },
          { userId: member1.id, role: ProjectMemberRole.MEMBER },
          { userId: member2.id, role: ProjectMemberRole.MEMBER },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'iOS + Android app for task management.',
      status: ProjectStatus.PLANNING,
      ownerId: manager.id,
      members: {
        create: [
          { userId: admin.id, role: ProjectMemberRole.MANAGER },
          { userId: member1.id, role: ProjectMemberRole.MEMBER },
        ],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage',
        description: 'Sketch + Figma layout for the homepage.',
        projectId: project.id,
        createdById: admin.id,
        assignedToId: member1.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Setup CI pipeline',
        description: 'GitHub Actions for build + test + deploy.',
        projectId: project.id,
        createdById: manager.id,
        assignedToId: member2.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Write project README',
        description: 'Document architecture and setup steps.',
        projectId: project.id,
        createdById: admin.id,
        assignedToId: member1.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
        completedAt: new Date(),
      },
      {
        title: 'Pick mobile tech stack',
        description: 'Decide between React Native and Flutter.',
        projectId: project2.id,
        createdById: manager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
      },
    ],
  });

  await prisma.activityLog.create({
    data: {
      action: 'PROJECT_CREATED',
      actorId: admin.id,
      projectId: project.id,
      metadata: { name: project.name },
    },
  });

  console.info('[seed] done.');
  console.info(`  Admin login: admin@example.com / Admin@123`);
  console.info(`  Member login: bob@example.com   / Member@123`);
}

main()
  .catch((e) => {
    console.error('[seed] error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, UserStatus, ChannelType } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const run = async () => {
  const passwordHash = await argon2.hash("Password123!");

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
      username: "alice",
      displayName: "Alice",
      status: UserStatus.ONLINE
    }
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
      username: "bob",
      displayName: "Bob",
      status: UserStatus.IDLE
    }
  });

  const server = await prisma.server.create({
    data: {
      name: "Hardcord HQ",
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id },
          { userId: bob.id }
        ]
      },
      roles: {
        create: [
          { name: "Admin", isDefault: false, position: 10 },
          { name: "Member", isDefault: true, position: 1 }
        ]
      },
      categories: {
        create: [{ name: "General", position: 1 }]
      }
    },
    include: { categories: true }
  });

  const textChannel = await prisma.channel.create({
    data: {
      name: "general",
      type: ChannelType.TEXT,
      serverId: server.id,
      categoryId: server.categories[0].id
    }
  });

  await prisma.message.createMany({
    data: [
      {
        channelId: textChannel.id,
        authorId: alice.id,
        content: "مرحبا بك في Hardcord!"
      },
      {
        channelId: textChannel.id,
        authorId: bob.id,
        content: "جاهزون لاختبار الدردشة الحية."
      }
    ]
  });

  const dmChannel = await prisma.channel.create({
    data: {
      name: "alice-bob",
      type: ChannelType.DM
    }
  });

  await prisma.dmParticipant.createMany({
    data: [
      { channelId: dmChannel.id, userId: alice.id },
      { channelId: dmChannel.id, userId: bob.id }
    ]
  });
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

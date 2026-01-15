-- Create enums
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'IDLE', 'DND', 'OFFLINE');
CREATE TYPE "ChannelType" AS ENUM ('TEXT', 'VOICE', 'DM', 'GROUP_DM');
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'MENTION', 'FRIEND_REQUEST', 'SYSTEM');

-- Create tables
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "bannerUrl" TEXT,
  "bio" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
  "customStatus" TEXT,
  "emailVerifiedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "refreshTokenHash" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "revokedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "VerificationToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "PasswordResetToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Server" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "iconUrl" TEXT,
  "bannerUrl" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Server_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "ServerMember" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "nickname" TEXT,
  "joinedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "mutedUntil" TIMESTAMP,
  "timeoutUntil" TIMESTAMP,
  CONSTRAINT "ServerMember_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerMember_unique" UNIQUE ("serverId", "userId")
);

CREATE TABLE "ServerBan" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "ServerBan_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerBan_unique" UNIQUE ("serverId", "userId")
);

CREATE TABLE "Role" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Role_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE
);

CREATE TABLE "RolePermission" (
  "id" TEXT PRIMARY KEY,
  "roleId" TEXT NOT NULL,
  "permission" BIGINT NOT NULL,
  CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE
);

CREATE TABLE "ServerMemberRole" (
  "id" TEXT PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  CONSTRAINT "ServerMemberRole_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerMemberRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE,
  CONSTRAINT "ServerMemberRole_unique" UNIQUE ("memberId", "roleId")
);

CREATE TABLE "ChannelCategory" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ChannelCategory_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE
);

CREATE TABLE "Channel" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT,
  "categoryId" TEXT,
  "name" TEXT NOT NULL,
  "type" "ChannelType" NOT NULL DEFAULT 'TEXT',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
  CONSTRAINT "Channel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChannelCategory"("id") ON DELETE SET NULL
);

CREATE TABLE "ChannelPermissionOverwrite" (
  "id" TEXT PRIMARY KEY,
  "channelId" TEXT NOT NULL,
  "roleId" TEXT,
  "memberId" TEXT,
  "allow" BIGINT NOT NULL DEFAULT 0,
  "deny" BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT "ChannelPermissionOverwrite_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE,
  CONSTRAINT "ChannelPermissionOverwrite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE
);

CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "channelId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "editedAt" TIMESTAMP,
  "deletedAt" TIMESTAMP,
  "pinnedAt" TIMESTAMP,
  CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Message_content_idx" ON "Message" USING GIN ("content");

CREATE TABLE "MessageReaction" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE,
  CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "MessageReaction_unique" UNIQUE ("messageId", "userId", "emoji")
);

CREATE TABLE "Thread" (
  "id" TEXT PRIMARY KEY,
  "parentMessageId" TEXT NOT NULL UNIQUE,
  "channelId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Thread_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "Message"("id") ON DELETE CASCADE,
  CONSTRAINT "Thread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE
);

CREATE TABLE "Attachment" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "filename" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE
);

CREATE TABLE "Invite" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP,
  "maxUses" INTEGER,
  "uses" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Invite_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
  CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "data" JSONB NOT NULL,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuditLog_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "FriendRequest" (
  "id" TEXT PRIMARY KEY,
  "requesterId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "FriendRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "FriendRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "FriendRequest_unique" UNIQUE ("requesterId", "recipientId")
);

CREATE TABLE "Block" (
  "id" TEXT PRIMARY KEY,
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Block_unique" UNIQUE ("blockerId", "blockedId")
);

CREATE TABLE "DmParticipant" (
  "id" TEXT PRIMARY KEY,
  "channelId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "DmParticipant_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE,
  CONSTRAINT "DmParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "DmParticipant_unique" UNIQUE ("channelId", "userId")
);

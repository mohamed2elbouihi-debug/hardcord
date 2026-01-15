export const Permissions = {
  VIEW_CHANNEL: 1n << 0n,
  SEND_MESSAGES: 1n << 1n,
  MANAGE_SERVER: 1n << 2n,
  MANAGE_CHANNELS: 1n << 3n,
  MANAGE_ROLES: 1n << 4n,
  KICK_MEMBERS: 1n << 5n,
  BAN_MEMBERS: 1n << 6n,
  MANAGE_MESSAGES: 1n << 7n
};

export const hasPermission = (bitfield: bigint, permission: bigint) => {
  return (bitfield & permission) === permission;
};

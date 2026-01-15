import { SetMetadata } from "@nestjs/common";

export const RequirePermissions = (...permissions: bigint[]) => SetMetadata("permissions", permissions);

import { User } from '../types';

type CompactUser = Partial<Pick<User, 'firstName' | 'lastName' | 'name' | 'email' | 'role' | 'member_type'>> & Pick<User, 'email'>;

export function isSystemAdminRole(role?: User['role'] | null): boolean {
  return role === 'admin' || role === 'owner';
}

export function getMemberRoleLabel(user?: Pick<User, 'role'> | null): string {
  if (!user) return 'Member';
  if (user.role === 'agent') return 'Agent';
  if (isSystemAdminRole(user.role)) return 'Admin';
  return 'Member';
}

export function getMemberRoleColor(user?: Pick<User, 'role'> | null): string {
  if (!user) return '#6b7280';
  if (user.role === 'agent') return '#2563eb';
  if (isSystemAdminRole(user.role)) return '#7c3aed';
  return '#0f766e';
}

export function getCompactUserName(user?: CompactUser | null): string {
  if (!user) return '';
  const firstName = user.firstName?.trim();
  if (firstName) return firstName;

  const name = user.name?.trim();
  if (name) {
    const [firstToken] = name.split(/\s+/);
    if (firstToken) return firstToken;
  }

  const emailPrefix = user.email?.split('@')[0]?.trim();
  return emailPrefix || '';
}

export function getMemberInitials(user: CompactUser): string {
  const firstName = user.firstName?.trim() || '';
  const lastName = user.lastName?.trim() || '';

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || firstName.charAt(0).toUpperCase();
  }

  const compactName = getCompactUserName(user);
  return compactName.slice(0, 2).toUpperCase();
}

export function canChangeMemberRole(actor?: Pick<User, 'role'> | null, target?: Pick<User, 'role' | 'member_type'> | null): boolean {
  if (!actor || !target) return false;
  if (!isSystemAdminRole(actor.role)) return false;
  if (target.role === 'owner') return false;
  if (target.member_type === 'agent') return false;
  return true;
}

export function isOnlyAdmin(users: Array<Pick<User, 'id' | 'role'>>, userId: string): boolean {
  const admins = users.filter((user) => isSystemAdminRole(user.role));
  return admins.length === 1 && admins[0]?.id === userId;
}

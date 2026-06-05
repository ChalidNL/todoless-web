import { User } from '../types';
import { getCompactUserName } from './member-role-utils';

type FamilyMember = Pick<User, 'id' | 'name' | 'email' | 'role' | 'family_id' | 'firstName' | 'lastName' | 'member_type' | 'member_status' | 'active'>;

type FamilyMembershipView = {
  familyId?: string;
  familyName: string;
  members: FamilyMember[];
};

const ROLE_ORDER: Record<string, number> = {
  owner: 0,
  admin: 1,
  member: 2,
  agent: 3,
};

function compareMembers(left: FamilyMember, right: FamilyMember): number {
  const roleDiff = (ROLE_ORDER[left.role || 'member'] ?? 99) - (ROLE_ORDER[right.role || 'member'] ?? 99);
  if (roleDiff !== 0) return roleDiff;

  const leftName = (getCompactUserName(left) || left.name || left.email || '').toLocaleLowerCase();
  const rightName = (getCompactUserName(right) || right.name || right.email || '').toLocaleLowerCase();
  return leftName.localeCompare(rightName, 'nl');
}

export function buildFamilyMembershipView(
  users: FamilyMember[],
  currentFamilyId?: string,
  currentFamilyName?: string
): FamilyMembershipView {
  const members = users
    .filter((user) => {
      if (currentFamilyId) {
        return user.family_id === currentFamilyId;
      }

      return !user.family_id;
    })
    .sort(compareMembers);

  return {
    familyId: currentFamilyId,
    familyName: currentFamilyName || (currentFamilyId ? 'Current family' : 'No family assigned'),
    members,
  };
}

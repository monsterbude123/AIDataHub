import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { AuthenticatedUser } from './auth.service';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<string> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>
    );

    // If user has 'admin' role, they can manage everything
    if (user.roles.includes('admin')) {
      can(Action.Manage, 'all');
    } else {
      // Grant permissions based on user's permission codes
      // Permission codes are expected to be in format: "action:subject" (e.g., "read:users", "create:roles")
      for (const permissionCode of user.permissions) {
        const [actionStr, subject] = permissionCode.split(':');
        if (actionStr && subject) {
          const action = this.parseAction(actionStr);
          if (action) {
            can(action, subject);
          }
        }
      }

      // Default: users can read their own profile
      can(Action.Read, 'User');
    }

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
    });
  }

  private parseAction(actionStr: string): Action | null {
    const actionMap: Record<string, Action> = {
      manage: Action.Manage,
      create: Action.Create,
      read: Action.Read,
      update: Action.Update,
      delete: Action.Delete,
    };
    return actionMap[actionStr.toLowerCase()] || null;
  }
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  WRITE = 'write',
}

export enum SubjectType {
  ANY = 'any',
  USERS = 'users',
  ROLE = 'role',
  LABEL = 'label',
  USER = 'user',
}

// CHOOSE:
// One table for all permissions and have table_id column "permissions"
// One table for each table "post_permissions"

// table name: posts
// resource_id // if null any?
// subject: table, if null, any?
// subject_id: table item id, if null, any?
// action: enum

// Then we will create a decorator for route in which you'll ask for permissions
// This decorator will retrieve all subjects for the current user,
// and check if any of them match the permissions needed for the resource

// Permissions('create')
// Permissions(['create', 'read'])

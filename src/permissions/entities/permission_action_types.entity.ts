import { Entity, PrimaryColumn } from 'typeorm';
import { ActionType } from '../permissions.constants';

@Entity({ name: 'permission_actions' })
export class PermissionAction {
  @PrimaryColumn({ unique: true })
  id: ActionType;
}

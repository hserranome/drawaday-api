import { Entity, PrimaryColumn } from 'typeorm';
import { SubjectType } from '../permissions.constants';

@Entity({ name: 'permission_subjects' })
export class PermissionSubject {
  @PrimaryColumn({ unique: true })
  id: SubjectType;
}

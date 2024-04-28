import { PermissionAction } from 'src/permissions/entities/permission_action_types.entity';
import { PermissionSubject } from 'src/permissions/entities/permission_subject_types.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'post_permissions' })
export class PostPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PermissionAction)
  @JoinColumn({ name: 'action' })
  action: PermissionAction;

  @ManyToOne(() => PermissionSubject)
  @JoinColumn({ name: 'subject' })
  subject: PermissionSubject;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}

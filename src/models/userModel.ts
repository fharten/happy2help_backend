import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from '../types/userRole';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 200, nullable: true })
  firstName?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  lastName?: string;

  @Column({ type: 'text', length: 255, nullable: true })
  image?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  contactEmail?: string;

  @Column({ type: 'text', length: 200, unique: true })
  loginEmail: string;

  @Column({ select: false, length: 30 })
  password: string;

  @Column({ type: 'text', length: 200, nullable: true })
  phone?: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value || '[]'),
    },
    nullable: true,
  })
  skills?: string[];

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value || '[]'),
    },
    nullable: true,
  })
  ngoMemberships?: string[];

  @Column({ nullable: true })
  yearOfBirth?: number;

  @Column({ nullable: true })
  zipCode?: number;

  @Column({ type: 'text', length: 200, nullable: true })
  city?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  state?: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

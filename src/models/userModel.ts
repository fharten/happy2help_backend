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

  @Column({ type: 'text', length: 200 })
  firstName: string;

  @Column({ type: 'text', length: 200 })
  lastName: string;

  @Column({ type: 'text', length: 255 })
  image: string;

  @Column({ type: 'text', length: 200, nullable: true })
  contactEmail?: string;

  @Column({ type: 'text', length: 200 })
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
  })
  skills: string[];

  @Column({
    type: 'simple-enum',
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
  })
  ngoMemberships: string[];

  @Column()
  yearOfBirth: number;

  @Column()
  zipCode: number;

  @Column({ type: 'text', length: 200 })
  city: string;

  @Column({ type: 'text', length: 200 })
  state: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

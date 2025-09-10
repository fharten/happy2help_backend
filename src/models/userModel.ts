import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserRole } from '../types/userRole';
import { Project } from './projectModel';
import { Application } from './applicationModel';

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

  // ACCEPTED APPLICATIONS (many-to-many)
  @ManyToMany(() => Project, project => project.participants, { eager: true })
  @JoinTable({
    name: 'user_projects',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'projectId', referencedColumnName: 'id' },
  })
  projects: Project[];

  // ALL APPLICATIONS (one-to-many)
  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  async comparePasswords(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // REMOVE PASSWORD FROM USER OBJECT
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Project } from './projectModel';

@Entity()
export class Ngo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 200, nullable: true })
  name?: string;

  @Column({ type: 'text', length: 255, nullable: true })
  image?: string;

  @Column({ default: false })
  isNonProfit: boolean;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value || '[]'),
    },
    nullable: true,
  })
  industry?: string[];

  @OneToMany(() => Project, project => project.ngo)
  projects: Project[];

  @Column({ type: 'text', length: 255, nullable: true })
  streetAndNumber?: string;

  @Column({ nullable: true })
  zipCode?: number;

  @Column({ type: 'text', length: 200, nullable: true })
  city?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  state?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  principal: string;

  @Column({ type: 'text', length: 200, nullable: true })
  contactEmail?: string;

  @Column({ type: 'text', length: 200 })
  loginEmail: string;

  @Column({ length: 30 })
  password: string;

  @Column({ type: 'text', length: 200, nullable: true })
  phone?: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async comparePasswords(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // REMOVE PASSWORD FROM NGO OBJECT
  toJSON() {
    const { password, ...ngoWithoutPassword } = this;
    return ngoWithoutPassword;
  }
}

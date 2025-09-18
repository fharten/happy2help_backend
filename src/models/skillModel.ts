import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Project } from './projectModel';
import { Application } from './applicationModel';
import { User } from './userModel';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ type: 'text', length: 200 })
  description: string;

  @ManyToMany(() => Project, project => project.skills)
  projects: Project[];

  @ManyToMany(() => Application, application => application.skills)
  applications: Application[];

  @ManyToMany(() => User, user => user.skills)
  users: User[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Project } from './projectModel';
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
}

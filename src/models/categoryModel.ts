import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Project } from './projectModel';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 100, unique: true })
  name: string;

  @ManyToMany(() => Project, project => project.categories)
  projects: Project[];
}

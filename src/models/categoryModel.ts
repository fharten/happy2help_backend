import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Project } from './projectModel';
import { Ngo } from './ngoModel';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', length: 500, nullable: true })
  description?: string;

  // Many-to-Many relationship with Project
  @ManyToMany(() => Project, project => project.categories)
  projects: Project[];

  // Many-to-Many relationship with Ngo
  @ManyToMany(() => Ngo, ngo => ngo.categories)
  ngos: Ngo[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './categoryModel';
import { Skill } from './skillModel';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value || '[]'),
    },
  })
  images: string[];

  @ManyToMany(() => Category, category => category.projects, { eager: true })
  @JoinTable({
    name: 'project_categories', // Junction table name
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @Column({ type: 'text', length: 200 })
  city: string;

  @Column({ type: 'int', width: 5 })
  zipCode: number;

  @Column({ type: 'text', length: 200 })
  state: string;

  @Column({ type: 'text', length: 200 })
  principal: string;

  @Column({ type: 'text', length: 200, nullable: true })
  compensation?: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToMany(() => Skill, skill => skill.projects, { eager: true })
  @JoinTable({
    name: 'project_skills', // Junction table name
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  skills: Skill[];

  @Column()
  startingAt: Date;

  @Column()
  endingAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Category } from './categoryModel';
import { Skill } from './skillModel';
import { Ngo } from './ngoModel';
import { User } from './userModel';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ngoId ist der Foreign Key, und speichert die ID des jeweiligen NGOs
  @Column({ type: 'uuid' })
  ngoId: string;

  // Beziehung zu Ngo (n:1):
  /**
   * Jedes Project gehört genau zu einem Ngo (ManyToOne).
   * Dies ist die Nebenseite der Beziehung.
   * Gegenstück im Ngo-Modell: @OneToMany(() => Project, project => project.ngo)
   * Zielentität: () => Ngo – Verweist auf die Ngo-Tabelle.
   * Rückbezug: ngo.projects – Das Feld im Ngo-Modell, das alle zugehörigen Projekte enthält.
   */
  @ManyToOne(() => Ngo, ngo => ngo.projects, { eager: true })
  @JoinColumn({ name: 'ngoId' })
  ngo: Ngo;

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

  @Column({ type: 'text', length: 200, nullable: true })
  principal: string;

  @Column({ type: 'text', length: 200, nullable: true })
  compensation?: string;

  @ManyToMany(() => User, user => user.projects)
  participants: User[];

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

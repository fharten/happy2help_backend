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
import { Application } from './applicationModel';

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

  // Beziehung zu Project (1:n):
  /**
   * Ein Ngo kann mehrere Projekte besitzen (OneToMany).
   * Dies ist die Hauptseite der Beziehung.
   * Gegenstück im Project-Modell: @ManyToOne(() => Ngo, ngo => ngo.projects)
   * Zielentität: () => Project – Verweist auf die Project-Tabelle.
   * Rückbezug: project.ngo – Das Feld im Project-Modell, das auf dieses Ngo verweist.
   */
  @OneToMany(() => Project, project => project.ngo)
  projects: Project[];

  // APPLICATIONS FOR NGO'S PROJECTS (one-to-many)
  @OneToMany(() => Application, application => application.ngo)
  applications: Application[];

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

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Ngo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', length: 200 })
  name!: string;

  @Column({ type: 'text', length: 255 })
  image!: string;

  @Column()
  isNonProfit!: boolean;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value || '[]'),
    },
  })
  industry!: string[];

  @Column({ type: 'text', length: 255 })
  streetAndNumber!: string;

  @Column()
  zipCode!: number;

  @Column({ type: 'text', length: 200 })
  city!: string;

  @Column({ type: 'text', length: 200 })
  state!: string;

  @Column({ type: 'text', length: 200 })
  principal!: string;

  @Column({ type: 'text', length: 200, nullable: true })
  contactEmail?: string;

  @Column({ type: 'text', length: 200, nullable: true })
  phone?: string;

  @Column({ default: false })
  isActivated!: boolean;

  @Column({ default: false })
  isDisabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

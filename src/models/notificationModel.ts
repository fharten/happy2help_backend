import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: false })
  read: boolean;
}
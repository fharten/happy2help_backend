import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApplicationStatus } from '../types/applicationRole';

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  ngoId: string;

  @Column({
    type: 'varchar',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  token: string;

  @Column()
  userId: string;

  @Column()
  entityType: 'user' | 'ngo';

  @Column()
  @Index()
  family: string; // TOKEN FAMILY FOR ROTATION

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  @Index()
  isRevoked: boolean;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedReason?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

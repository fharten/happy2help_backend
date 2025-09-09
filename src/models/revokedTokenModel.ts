import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  jti: string; // JWT ID

  @Column()
  userId: string;

  @Column()
  entityType: 'user' | 'ngo';

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  revokedReason?: string;

  @CreateDateColumn()
  revokedAt: Date;
}

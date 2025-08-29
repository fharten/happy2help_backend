import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

export enum ApplicationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
}


@Entity()
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    projectId: string;

    @Column('uuid')
    userId: string;

    @Column({ 
        type: 'enum', 
        enum: ApplicationStatus, 
        default: ApplicationStatus.PENDING,
    })
    status: string;
}
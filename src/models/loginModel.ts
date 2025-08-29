import {
    Column,
    Entity,
} from 'typeorm';

@Entity()
export class Login {
    @Column({ select: false, length: 20 })
    password: string;

    @Column({ type: 'text', length: 200 })
    email: string;

}
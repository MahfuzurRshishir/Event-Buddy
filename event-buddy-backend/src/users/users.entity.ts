import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { EventRegistration } from '../events/events.reg.entity';

export type UserRole = 'USER' | 'ADMIN';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => EventRegistration, registration => registration.user)
    registrations: EventRegistration[];
}
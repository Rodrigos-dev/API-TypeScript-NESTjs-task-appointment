import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
@Index(['name'])
@Index(['email'])
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
    
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER, // Define um valor padrão, se necessário
    })
    role: Role;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

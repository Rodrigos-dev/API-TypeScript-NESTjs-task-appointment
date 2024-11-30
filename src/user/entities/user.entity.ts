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

    @Column({ nullable: true})
    codeForgetPassword: string;
    
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER, // Define um valor padrão, se necessário
    })
    role: Role;

    @Column({ nullable: true})
    urlAvatar: string;

    @Column({ nullable: true})
    avatarName: string;

    @Column({ nullable: true})
    mimeType: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

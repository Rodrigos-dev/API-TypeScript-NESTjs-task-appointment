import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class PushNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    message: string;

    @Column({nullable: true})
    title: string;

    @Column({nullable: true})
    imageUrl: string;

    @Column({nullable: true})
    icon: string;

    @Column({default: false})
    allUsers: boolean;

    @Column({ nullable: true })
    userId: number;   
    
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

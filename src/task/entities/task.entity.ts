import { StatusTaskEnum } from "src/commom/enums/task.enums";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: StatusTaskEnum,
        default: StatusTaskEnum.PENDING,
    })
    status: StatusTaskEnum;

    @Column()
    createdByUserId: number;

    @Column({ type: 'date' })
    dateEvent: string;

    @Column()
    startTime: string;

    @Column()
    endTime: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => User, (user) => user.tasks, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    @JoinColumn()
    user: User;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

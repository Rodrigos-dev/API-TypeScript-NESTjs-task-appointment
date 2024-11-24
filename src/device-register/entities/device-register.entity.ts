import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum SystemType {
    IOS = 'ios',
    ANDROID = 'android',
}

export class DeviceRegister {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: true })
    userId: number;

    @Column({ nullable: true })
    token: string;

    @Column({
        type: 'enum',
        enum: SystemType,
    })
    systemType: SystemType;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

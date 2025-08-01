import { RoleEnum } from "src/commom/enums/user-enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class Avatar {
  urlAvatar: string;
  avatarName: string;
  mimeType: string;
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

    @Column({ nullable: true })
    codeForgetPassword: string;

    @Column({
        type: 'enum',
        enum: RoleEnum,
        default: RoleEnum.USER, // Define um valor padrão, se necessário
    })
    role: RoleEnum;

    @Column({ type: 'simple-json', nullable: true })
    avatar: Avatar;    

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;
}

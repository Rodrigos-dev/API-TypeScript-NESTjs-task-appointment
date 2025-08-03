import { RoleEnum } from "src/commom/enums/user-enums";
import { Task } from "src/task/entities/task.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @OneToMany(() => Task, (task) => task.user, {
    cascade: true,
  })
  tasks: Task[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}

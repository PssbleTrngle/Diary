import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Index } from "typeorm";
import Apikey from "./Apikey";
import Entry from "./Entry";
import User from "./User";
import { Service } from "./Service";

@Entity()
@Index('service_per_user', (l: Login) => [l.service, l.user], { unique: true })
@Index('identification_per_service', (l: Login) => [l.service, l.identification], { unique: true })
export default class Login extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    identification!: string;

    @Column({ select: false })
    refresh_token!: string;

    @ManyToOne(() => Service, service => service.logins, { eager: true })
    service!: Service;

    @ManyToOne(() => User, user => user.logins, { eager: true })
    user!: User;

}
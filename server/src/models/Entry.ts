import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./Service";
import Timestamps from "./Timestamps";
import User from "./User";

@Entity({ orderBy: { 'created': 'DESC' } })
export default class Entry extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => Timestamps)
    timestamps!: Timestamps;

    @Column({ length: 128 })
    title!: string;

    @Column()
    text!: string;

    @ManyToOne(() => Service, service => service.entries, { nullable: true, eager: true })
    service!: Service;

    @ManyToOne(() => User, user => user.entries, { eager: true })
    user!: User;

}

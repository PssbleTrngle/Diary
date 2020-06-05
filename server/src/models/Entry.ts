import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, AfterInsert, Index } from "typeorm";
import { Service } from "./Service";
import Timestamps from "./Timestamps";
import User from "./User";

export type IEntry = {
    [K in keyof Entry]?: Entry[K];
};

@Index('api_id_per_user', e => [e.apiId, e.user], { unique: true })
@Entity({ orderBy: { 'created': 'DESC' } })
export default class Entry extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    link?: string;

    @Column({ nullable: true })
    apiId?: string;

    @Column(() => Timestamps)
    timestamps!: Timestamps;

    @Column({ length: 128 })
    title!: string;

    @Column({ nullable: true })
    text?: string;

    @ManyToOne(() => Service, service => service.entries, { nullable: true, eager: true })
    service?: Service;

    @ManyToOne(() => User, user => user.entries, { eager: true })
    user!: User;

}

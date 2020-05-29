import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import Entry from "./Entry";
import Login from "./Login";

@Entity()
export class Service extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 64, unique: true })
    name!: string;

    @OneToMany(() => Entry, entry => entry.service, { nullable: true })
    entries!: Entry[];

    @OneToMany(() => Login, login => login.service)
    logins!: Login[];

    @Column()
    client_id!: string;

    @Column({ select: false })
    secret!: string;

    @Column()
    url!: string;

}

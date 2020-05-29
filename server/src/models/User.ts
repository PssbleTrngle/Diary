import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Apikey from "./Apikey";
import Entry from "./Entry";
import Login from "./Login";

@Entity()
export default class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true, transformer: {
            to: (v: string) => v.toLowerCase(),
            from: (v: string) => v.toLowerCase(),
        }
    })
    username!: string;

    @Column({ select: false })
    password_hash!: string;

    @Column({ nullable: true })
    email!: string;

    @OneToMany(() => Entry, entry => entry.user)
    entries!: Entry[];

    @OneToMany(() => Apikey, key => key.user)
    keys!: Apikey[];

    @OneToMany(() => Login, login => login.user)
    logins!: Login[];

}
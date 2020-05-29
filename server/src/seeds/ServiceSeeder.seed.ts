import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import { Service } from "../models/Service";

export default class ServiceSeeder implements Seeder {
    public async run(_: Factory, connection: Connection) {

        const services = [
            { name: 'GitHub', client_id: 'Iv1.5bef29358fcac340', secret: 'b868f7a41268ecb95a73ba17114920d9c3776f8f', url: 'https://github.com/login/oauth/authorize' },
            //{ name: 'Spotify', client_id: '9247971fbbbb48de993129005903eb0e', secret: 'a44e5675b0b24980854b602e7f0f6e02' },
        ]

        await connection
            .createQueryBuilder()
            .insert()
            .into(Service)
            .values(services)
            .execute()

    }
}
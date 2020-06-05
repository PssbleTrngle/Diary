import { Connection, DeepPartial } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import { Service } from "../models/Service";

export default class ServiceSeeder implements Seeder {
    public async run(_: Factory, connection: Connection) {

        const services: { [K in keyof Service]?: Service[K] }[] = [
            {
                name: 'GitHub',
                client_id: 'Iv1.5bef29358fcac340',
                client_secret: 'b868f7a41268ecb95a73ba17114920d9c3776f8f',
                auth_url: 'https://github.com/login/oauth/authorize',
                token_url: 'https://github.com/login/oauth/access_token',
                api_url: 'https://api.github.com',
                token_type: 'token',
            },
            {
                name: 'Spotify',
                client_id: '9247971fbbbb48de993129005903eb0e',
                client_secret: 'a44e5675b0b24980854b602e7f0f6e02',
                auth_url: 'https://accounts.spotify.com/authorize',
                token_url: 'https://accounts.spotify.com/api/token',
                api_url: 'https://api.spotify.com/v1',
                token_type: 'Bearer',
                scope: 'user-library-read'
            },
        ]

        if (process.env.DEBUG === 'true') {
            await Service.delete({});
        }

        await connection
            .createQueryBuilder()
            .insert()
            .into(Service)
            .values(services)
            .execute()

    }
}
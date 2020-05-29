import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import Entry from "../models/Entry";
import User from "../models/User";
import { Service } from "../models/Service";

export default class EntrySeeder implements Seeder {
    public async run(factory: Factory, connection: Connection) {

        if (process.env.DEBUG === 'true') {
            await Entry.delete({});
        }

        const user = await User.findOneOrFail({ order: { id: 'ASC' } });
        const services = await Service.find();

        await factory(Entry)({ user, services }).createMany(40);

    }
}

import { define } from 'typeorm-seeding';
import Faker from 'faker';
import Entry from '../models/Entry';
import User from '../models/User';
import { Service } from '../models/Service';

interface Context {
    user: User;
    services?: Service[];
}

define<Entry,Context>(Entry, (faker, context) => {

    const services = context?.services ?? [];
    const user = context?.user;
    if(!user) throw new Error('User has to be defined in context for the entry factory');

    const text = faker.lorem.sentences(faker.random.number(10) + 2);
    const title = faker.lorem.words(faker.random.number(2) + 3);
    const created = faker.date.past(faker.random.boolean() ? 2 : 0.1);

    const service = services.length > 0 ? services[faker.random.number(services.length)] : undefined;

    return Entry.create({ title, text, user, service, timestamps: { created } });
})
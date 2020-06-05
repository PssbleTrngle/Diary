import { Response } from "express";
import { AuthRequest } from "..";
import Entry, { IEntry } from '../models/Entry';
import Login from '../models/Login';
import { Service } from "../models/Service";
import { HttpError } from "./ResourceController";
import { DeepPartial } from "typeorm";

export type Importer = (login: Login) => Promise<Partial<DeepPartial<IEntry>>[]>;

export default class ImportController {

    private static logics: { service: string, importer: Importer }[] = [];

    static register(service: string, importer: Importer) {
        this.logics.push({ service: service.toLowerCase(), importer });
    }

    async list(req: AuthRequest) {
        const logins = await Login.find({ user: req.user });
        const logics = ImportController.logics.map(l => l.service);

        return logins
            .map(l => l.service)
            .filter(s => logics.includes(s.name.toLowerCase()))
    }

    async import(req: AuthRequest, res: Response) {
        const service = await Service.findOne(req.params.id)
        if (!service) return null;

        const importer = ImportController.logics.find(i => i.service === service.name.toLowerCase())?.importer;
        if (!importer) throw new HttpError(400, `Importing from ${service.name} is not supported`);

        const login = await Login.findOne({ user: req.user, service });

        if (!login) throw new HttpError(400, `Not authenticated with ${service.name}`);

        const entries = await importer(login);

        const existing = async (entry: Entry) => Entry.findOne({ apiId: entry.apiId, user: req.user });

        await Promise.all(entries.map(async values => {

            const exists = await Entry.count({ apiId: values.apiId });

            if (!exists) {
                values.user = req.user;
                values.service = service;
                return Entry.create(values).save();
            } else {
                return Entry.update({ apiId: values.apiId }, values);
            }
        }));

        return true;
    }

}
import bcrypt from 'bcrypt';
import * as bodyParser from "body-parser";
import chalk from "chalk";
import express, { NextFunction } from "express";
import { ParamsDictionary, Request, Response } from 'express-serve-static-core';
import fs from 'fs';
import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import AuthController from "./controller/AuthController";
import ImportController from "./controller/ImportController";
import { debug, error, success } from "./logging";
import Apikey from "./models/Apikey";
import User from "./models/User";
import { Routes } from "./routes";
import { AxiosError } from 'axios';

export type AuthRequest = Request<ParamsDictionary, Response, any> & {
    user: User,
    key: Apikey,
};
export type ApiFunc<R extends Request = AuthRequest> = (req: R, res: Response, next: NextFunction) => unknown;
export type App = {
    get(url: string, ...func: ApiFunc[]): unknown,
    post(url: string, ...func: ApiFunc[]): unknown,
    delete(url: string, ...func: ApiFunc[]): unknown,
    put(url: string, ...func: ApiFunc[]): unknown,
    use(url: string, ...func: ApiFunc[]): unknown,
} & express.Express;

import config from '../ormconfig';

createConnection(config as any).then(async connection => {

    connection.synchronize();

    // create express app
    const app: App = express();
    app.use(bodyParser.json());

    function wrapper(func: ApiFunc): ApiFunc {
        return async (req, res, next) => {
            try {
                const r = func(req, res, next);
                const result = r instanceof Promise ? await r : r;

                if (result !== void 0) {
                    if (!!result) {

                        if (typeof result === 'number') {
                            res.status(result).send();
                        } if (result === true) {
                            res.status(200).send();
                        } else {
                            res.json(result);
                        }

                    } else {
                        res.status(404).send('Not found');
                    }
                } else {
                    next();
                }

            } catch (e) {

                const status_code = e.status_code ?? 500;
                if (status_code === 500 && process.env.DEBUG === 'true') {
                    error('Controller encountered unwanted error:')
                    error(e.message);

                    if (e.isAxiosError && e.response) {
                        error(e.response?.data);
                    }
                }

                res.status(status_code).send(e.message ?? 'Internal server error');
            }
        }
    }

    fs.readdirSync(`${__dirname}/services`)
        .filter(file => file.endsWith('.js'))
        .forEach(file => {

            const service = file.substring(0, file.lastIndexOf('.')).toLowerCase();
            const { importer } = require(`${__dirname}/services/${file}`).default;
            if (importer) ImportController.register(service, importer);

            debug(`Registered logic for '${service}'`);

        });

    app.use(express.static('/client'));
    app.get('/', (_, res) => {
        if (process.env.NODE_ENV === 'development')
            res.redirect('http://localhost:3000')
        else
            res.sendFile('/client/index.html')
    });

    // register express routes from defined application routes
    Routes.forEach(({ controller, action, route, method, auth }) => {

        if (auth) (app as any)[method](route, wrapper(new AuthController().authenticate));

        const c = new controller();

        (app as any)[method](route, wrapper((req: Request, res: Response, next: Function) => {
            debug(`[${method.toUpperCase()}] -> '${route}'`);
            return c[action](req, res, next);
        }));
    });

    // Insert default users for development
    if (process.env.DEBUG) {

        const anyUser = await User.findOne()
        const { DEV_PASSWORD } = process.env;

        if (!anyUser && DEV_PASSWORD) {

            const password_hash = await new Promise<string>((res, rej) => bcrypt.hash(DEV_PASSWORD, 10, (e, hash) => {
                if (e) rej(e);
                else res(hash);
            }));

            for (const username of ['dev', 'dev2'])
                await User.create({ username, password_hash, dev: true }).save()

            debug('Created dev users');

        }

    }

    const PORT = process.env.PORT ?? 8080;
    app.listen(PORT, () => {
        success(`Server started on port ${chalk.underline(PORT)}`);
        console.log();
    });


}).catch(error => console.log(error));

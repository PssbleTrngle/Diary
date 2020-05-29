import "reflect-metadata";
import { createConnection, getManager } from "typeorm";
import * as bodyParser from "body-parser";
import express, { NextFunction } from "express";
import { Routes } from "./routes";
import User from "./models/User";
import { debug, success, error } from "./logging";
import bcrypt from 'bcrypt';
import chalk from "chalk";
import { ParamsDictionary, Request, Response } from 'express-serve-static-core';
import Apikey from "./models/Apikey";
import AuthController from "./controller/AuthController";

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

createConnection().then(async connection => {

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

                const code = e.code ?? 500;
                if (code === 500 && process.env.DEBUG === 'true') {
                    error('Controller encountered unwanted error:')
                    console.log(e);
                }

                res.status(code).send(e.message ?? 'Internal server error');
            }
        }
    }

    // register express routes from defined application routes
    Routes.forEach(({ controller, action, route, method, auth }) => {

        if (auth) app.use(route, wrapper(new AuthController().authenticate));

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
                await User.create({ username, password_hash }).save()

            debug('Created dev users');

        }

    }

    const PORT = process.env.PORT ?? 8080;
    app.listen(PORT, () => {
        success(`Server started on port ${chalk.underline(PORT)}`);
        console.log();
    });


}).catch(error => console.log(error));

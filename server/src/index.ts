import "reflect-metadata";
import { createConnection, getManager } from "typeorm";
import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { Routes } from "./routes";
import User from "./models/User";
import { debug, success } from "./logging";
import bcrypt from 'bcrypt';
import chalk from "chalk";

createConnection().then(async connection => {

    connection.synchronize();

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // setup express app here
    // ...

    const PORT = process.env.PORT ?? 8080;
    app.listen(PORT);

    // insert new users for test
    if (process.env.DEBUG) {

        const anyUser = await User.findOne()
        const { DEV_PASSWORD } = process.env;

        if (!anyUser && DEV_PASSWORD) {

            const hash = await new Promise<string>((res, rej) => bcrypt.hash(DEV_PASSWORD, 10, (e, hash) => {
                if (e) rej(e);
                else res(hash);
            }));

            await User.create({ username: 'dev', password_hash: hash }).save();
            debug('Created dev user');

        }

    }

    success(`Server started on port ${chalk.underline(PORT)}`);

}).catch(error => console.log(error));

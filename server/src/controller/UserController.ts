import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import User from "../models/User";

export class UserController {

    async all() {
        return User.find();
    }

    async one(request: Request) {
        return User.findOne(request.params.id);
    }

    async save(request: Request) {
        return User.save(request.body);
    }

    async remove(request: Request) {
        const user = await User.findOne(request.params.id);
        return user?.remove();
    }

}
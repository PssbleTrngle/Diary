import { Response } from "express";
import querystring from 'querystring';
import { AuthRequest } from "..";
import Login from "../models/Login";
import { Service } from "../models/Service";
import jwt from 'jsonwebtoken';

export default class ServiceController {

    async redirected(req: AuthRequest, res: Response) {
        
    }

    async authorize(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const service = await Service.findOne(id);
        if (!service) return null;

        const login = await Login.findOne({ user: req.user, service });

        if (login) res.redirect('/');
        else {
            const { url, client_id } = service;
            const redirect_uri = req.url;

            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT Secret missing, contact admin')

            const state = jwt.sign(`${req.user.id}:${service.secret}`, secret)

            const params = querystring.stringify({
                client_id, redirect_uri, state
            });

            res.redirect(`${url}?${params}`)
        }
    }

}
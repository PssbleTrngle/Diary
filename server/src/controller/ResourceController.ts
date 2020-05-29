import { BaseEntity, FindOneOptions, DeepPartial, getRepository } from "typeorm";
import { AuthRequest } from "..";
import User from "../models/User";
import Timestamps from "../models/Timestamps";

export class HttpError extends Error {
    constructor(public code: number, message?: string) {
        super(message);
    }
}

export interface Entity extends BaseEntity {
    user?: User;
    timestamps?: Timestamps;
}
export type EntityStatic<E extends Entity> = { new(): E } & typeof BaseEntity;

/**
 * @param Resource The Entity model
 * @param owned If the entity model should only be accecible to the associated user
 */
export default function <E extends Entity>(Resource: EntityStatic<E>, owned: boolean) {
    return class ResourceController {

        private authorized(entity: Entity | undefined | null, req: AuthRequest) {
            if (owned && entity) {
                if (!entity.user) throw new Error(`User not included in owned entity ${Resource}`)
                if (entity.user.id !== req.user.id) {
                    throw new HttpError(401, 'Not authorized')
                }
            }
        }

        async all(req: AuthRequest) {

            const getNumber = (key: string) => {
                const i = Number.parseInt((req.query[key] ?? '').toString());
                return isNaN(i) ? undefined : i;
            }

            const limit = getNumber('limit') ?? 10;
            const offset = getNumber('offset') ?? 0;

            const resources = await Resource.find({
                skip: offset, take: limit,
                where: owned ? { user: req.user } : {},
            });

            return resources;
        }

        async one(req: AuthRequest) {
            const entity = await Resource.findOne<Entity>(req.params.id);
            this.authorized(entity, req);
            return entity;
        }

        async save(req: AuthRequest) {
            const values: DeepPartial<typeof Resource> = {
                ...req.body, user: req.user,
            }
            return Resource.create(values).save();
        }

        async update(req: AuthRequest) {
            const entity = await Resource.findOne<Entity>(req.params.id);
            this.authorized(entity, req);
            return Resource.getRepository().update(req.params.id, req.body)
        }

        async remove(req: AuthRequest) {
            const entity = await Resource.findOne<Entity>(req.params.id);
            this.authorized(entity, req);
            return entity?.remove();
        }

    }
}
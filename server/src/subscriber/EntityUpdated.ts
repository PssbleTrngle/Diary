import { EntitySubscriberInterface, EventSubscriber, UpdateEvent, InsertEvent } from "typeorm";
import { Entity } from "../controller/ResourceController";
import { debug } from "../logging";

@EventSubscriber()
export class EntityUpdated implements EntitySubscriberInterface<any> {

    beforeUpdate(event: UpdateEvent<Entity>) {
        if (event.entity.timestamps) {
            event.entity.timestamps.updated = new Date();
        }
    }

    /*
    beforeInsert(event: InsertEvent<Entity>) {
        if (event.entity.timestamps) {
            const date = new Date();
            event.entity.timestamps.created = date;
            event.entity.timestamps.updated = date;
        }
    }
    */

}

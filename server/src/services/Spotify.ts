import Login from "../models/Login";
import Entry from "../models/Entry";
import { Importer } from "../controller/ImportController";
import { DeepPartial } from "typeorm";
import { Service } from "../models/Service";

interface Track {
    added_at: string;
    track: {
        id: string;
        name: string;
        uri: string;
    }
}

const importer: Importer = async (login: Login) => {

    const { items } = await login.accessApi<{ items: Track[] }>('me/tracks');

    return items.map(({ track, added_at }) => ({
        apiId: track.id,
        title: `Saved *${track.name}*`,
        link: track.uri,
        timestamps: {
            created: new Date(added_at),
        }
    }));

    /*
    return repos.map(r => ({
        apiId: r.id,
        link: r.html_url,
        timestamps: {
            created: new Date(r.created_at),
        },
        title: r.owner.id === login.apiId
            ? `Created repository ${r.name}`
            : `${r.owner.login} created repository ${r.name}`,
        text: r.description || undefined,
    }));
*/
}

export default { importer };
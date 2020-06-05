import Login from "../models/Login";
import Entry from "../models/Entry";
import { Importer } from "../controller/ImportController";

interface Repo {
    id: number;
    name: string;
    private: boolean;
    owner: {
        login: string;
        id: number;
    },
    html_url: string;
    description: string;
    created_at: string;
}

const importer: Importer = async (login: Login) => {

    const repos = await login.accessApi<Repo[]>('user/repos');

    return repos.map(r => ({
        apiId: r.id.toString(),
        link: r.html_url,
        timestamps: {
            created: new Date(r.created_at),
        },
        title: r.owner.id === login.apiId
            ? `Created repository *${r.name}*`
            : `*${r.owner.login}* created repository *${r.name}*`,
        text: r.description || undefined,
    }));

}

export default { importer };
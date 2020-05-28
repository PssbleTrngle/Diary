import querystring, { ParsedUrlQueryInput } from 'querystring';
import format from 'dateformat';

/**
 * Replaced once we know the format the data will be sent by the server
 */
type Response<O> = O;


interface IObserver<O> {
    url: string;
    params?: ParsedUrlQueryInput | string;
    callback: (result?: O, error?: Error) => unknown;
}

type Method = 'post' | 'delete' | 'put' | 'get';
class Api {

    private observers: Set<IObserver<any>> = new Set();

    private authorization() {
        const saved = localStorage.getItem('apikey');
        if(!saved) throw new Error('Not logged in');
        return saved;
    }

    async isLoggedIn() {
        try {
            this.authorization();
            return true;
        } catch {
            return false;
        }
    }

    call<O>(observer: IObserver<O>) {
        const { url, params, callback } = observer;
        this.fetch<O>(url, params)
            .then(r => callback(r))
            .catch(e => callback(undefined, e));
    }

    /**
     * Update all current subscribers
     */
    update() {
        this.observers.forEach(o => this.call(o));
    }

    /**
     * Subscibe to the current url
     * Will be updated every time a non GET request is retrieved
     * @param url The api url
     * @param params Optional query params
     */
    subscribe<O>(url: string, params?: ParsedUrlQueryInput | string) {
        return {
            then: (callback: (result?: O, error?: Error) => unknown) => {
                const o = { url, params, callback };
                this.observers.add(o);
                this.call(o);
                return () => {
                    this.observers.delete(o);
                }
            }
        }
    }

    /**
     * Sent a GET request
     * @param endpoint The api url
     * @param params Optional query params
     */
    async fetch<O>(endpoint: string, params?: ParsedUrlQueryInput | string) {
        const query = typeof params === 'string' ? params : querystring.encode(params ?? {});
        return this.method<O>('get', `${endpoint}/?${query}`);
    }

    /**
     * Uploads the file to the api
     * @param endpoint The api url
     * @param file The file object
     * @param method The HTML method
     */
    async upload(endpoint: string, file: File, key = 'file', method: Method = 'post') {

        const body = new FormData()
        body.append(key, file)

        return await fetch(endpoint, {
            method: method.toUpperCase(),
            headers: {
                'Accept': 'application/json',
                //'Content-Type': 'application/json',
                'Authorization': this.authorization(),
            },
            body,
        });
    }

    private async method<O>(method: Method, endpoint: string, args?: any, update = true) {

        const response = await fetch(endpoint, {
            method: method.toUpperCase(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.authorization(),
            },
            body: args ? JSON.stringify(args) : undefined,
        });

        if (update && method !== 'get') this.update();

        if (response.status === 200)
            return response.json() as Promise<Response<O>>;
        else
            throw new Error('Not logged in');

    }

    async post<O = string>(url: string, args: any = {}, update = true) {
        return this.method<O>('post', url, args, update);
    }

    async put<O = string>(url: string, args: any = {}, update = true) {
        return this.method<O>('put', url, args, update);
    }

    async delete<O = string>(url: string, args: any = {}, update = true) {
        return this.method<O>('delete', url, args, update);
    }

    async logout() {
        window.location.reload();
    }

    /**
     * Retrieves a new api key from the api and saves it
     * @param base64 The encoded username and password
     */
    async login(username: string, password: string) {
        const { platform, vendor } = navigator;

        const base64 = new Buffer(`${username}: ${password}`).toString('base64');
        const date = format(new Date());

        const response = await fetch('apikey', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64}`,
            },
            body: JSON.stringify({ purpose: `${vendor} ${platform}, ${date}` }),
        });

        this.update();

        if (response.status !== 201) throw new Error('Invalid credentials');

        const { data } = await response.json()
        localStorage.setItem('apikey', data);

        window.location.reload();

    }

}



const API = new Api();

export default API;
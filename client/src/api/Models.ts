export interface IModel {
    id: number;
}

export interface IUser extends IModel {
    username: string;
    email?: string;
}
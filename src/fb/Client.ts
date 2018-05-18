import {disposeMaster, getDefaultLibraryFilename, getMaster, Master, Provider, Status} from "node-firebird-native-api";

export interface IClient {
    master: Master;
    dispatcher: Provider;
}

export class Client {

    private _client?: IClient;

    get client(): IClient | undefined {
        return this._client;
    }

    public async create(): Promise<void> {
        if (this._client) {
            throw new Error("Client already created");
        }

        const master = getMaster(getDefaultLibraryFilename());
        this._client = {
            master,
            dispatcher: (await master.getDispatcherAsync())!
        };
    }

    public async destroy(): Promise<void> {
        if (!this._client) {
            throw new Error("Need created client");
        }

        // TODO ???
        // await this.statusAction((status) => this._client!.dispatcher.shutdownAsync(status, 0, -3));
        this._client.dispatcher!.releaseSync();
        disposeMaster(this._client.master);
        this._client = undefined;
    }

    public async statusAction<T>(action: (status: Status) => Promise<T>): Promise<T> {
        const status = (await this.client!.master.getStatusAsync())!;
        try {
            return await action(status);
        } finally {
            await status.disposeAsync();
        }
    }
}

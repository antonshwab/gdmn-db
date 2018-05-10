import {
    disposeMaster,
    getDefaultLibraryFilename,
    getMaster,
    Master,
    Provider,
    Status,
    Util
} from "node-firebird-native-api";

export interface IClient {
    master: Master;
    dispatcher: Provider;
    util: Util;
}

export class Context {

    private _client?: IClient;

    get client(): IClient | undefined {
        return this._client;
    }

    public create(): void {
        if (this._client) {
            throw new Error("Context already created");
        }

        const master = getMaster(getDefaultLibraryFilename());
        this._client = {
            master,
            dispatcher: master.getDispatcherSync()!,
            util: master.getUtilInterfaceSync()!
        };
    }

    public destroy(): void {
        if (!this._client) {
            throw new Error("Need created context");
        }

        this.statusActionSync((status) => this._client!.dispatcher!.shutdownSync(status, 0, -3));
        this._client!.dispatcher!.releaseSync();
        disposeMaster(this._client!.master!);
    }

    public async statusAction<T>(action: (status: Status) => Promise<T>): Promise<T> {
        const status = this.client!.master.getStatusSync()!;
        try {
            return await action(status);
        } finally {
            status.disposeSync();
        }
    }

    public statusActionSync<T>(action: (status: Status) => T): T {
        const status = this._client!.master.getStatusSync()!;
        try {
            return action(status);
        } finally {
            status.disposeSync();
        }
    }
}

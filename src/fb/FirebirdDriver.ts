import {AConnection} from "../AConnection";
import {ADriver} from "../ADriver";
import {FirebirdConnection} from "./FirebirdConnection";

export class FirebirdDriver extends ADriver {

    public newConnection(): AConnection {
        return new FirebirdConnection();
    }
}

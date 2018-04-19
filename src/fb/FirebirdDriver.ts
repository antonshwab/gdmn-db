import {AConnection} from "../AConnection";
import {ADriver} from "../ADriver";
import {DBStructure} from "../DBStructure";
import {FirebirdConnection} from "./FirebirdConnection";
import {FirebirdDBStructure} from "./FirebirdDBStructure";
import {FirebirdTransaction} from "./FirebirdTransaction";

export class FirebirdDriver extends ADriver {

    public async readDBStructure(transaction: FirebirdTransaction): Promise<DBStructure> {
        return FirebirdDBStructure.readStructure(transaction);
    }

    public newConnection(): AConnection {
        return new FirebirdConnection();
    }
}

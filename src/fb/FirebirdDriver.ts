import {ADatabase} from "../ADatabase";
import {ADriver} from "../ADriver";
import {FirebirdDatabase} from "./FirebirdDatabase";

export class FirebirdDriver extends ADriver {

    public newDatabase(): ADatabase {
        return new FirebirdDatabase();
    }
}

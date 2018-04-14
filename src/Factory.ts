import {ADriver} from "./ADriver";
import {FirebirdDriver} from "./fb/FirebirdDriver";

export abstract class Factory {

    /** Firebird driver */
    static get FBDriver(): ADriver {
        return new FirebirdDriver();
    }
}

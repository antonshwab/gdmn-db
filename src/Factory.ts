import {FirebirdDriver} from "./fb/FirebirdDriver";

export abstract class Factory {

    /** Firebird driver */
    static get FBDriver(): FirebirdDriver {
        return new FirebirdDriver();
    }
}

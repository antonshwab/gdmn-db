import {FirebirdModule} from "./fb/FirebirdModule";

export abstract class Factory {

    /**
     * Firebird driver
     *
     * @returns {FirebirdModule}
     */
    static get FBModule(): FirebirdModule {
        return new FirebirdModule();
    }
}

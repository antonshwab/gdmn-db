import {FirebirdModule} from "./fb/FirebirdModule";

export abstract class Factory {

    static get FBModule(): FirebirdModule {
        return new FirebirdModule();
    }
}
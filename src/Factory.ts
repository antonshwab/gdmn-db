import {FirebirdModule} from "./fb/FirebirdModule";
import {FirebirdModule2} from "./fb2/FirebirdModule2";

export abstract class Factory {

    static get FBModule(): FirebirdModule {
        return new FirebirdModule();
    }

    static get FBModule2(): FirebirdModule2 {
        return new FirebirdModule2();
    }
}
import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";

@Injectable()
export class LocalEventService {

    private _operationsUpdated =  new Subject<string>();

    get operationsUpdated() {
        return this._operationsUpdated.asObservable();
    }

    emitOperationUpdated(paymentId: string) {
        this._operationsUpdated.next(paymentId);
    }
}
"use strict";
var HTTP_METHODS;
(function (HTTP_METHODS) {
    HTTP_METHODS[HTTP_METHODS["POST"] = 0] = "POST";
    HTTP_METHODS[HTTP_METHODS["GET"] = 1] = "GET";
})(HTTP_METHODS || (HTTP_METHODS = {}));
var HTTP_STATUSES;
(function (HTTP_STATUSES) {
    HTTP_STATUSES[HTTP_STATUSES["OK"] = 200] = "OK";
    HTTP_STATUSES[HTTP_STATUSES["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HTTP_STATUSES || (HTTP_STATUSES = {}));
class Observer {
    handlers;
    isUnsubscribed;
    _unsubscribe;
    constructor(handlers, isUnsubscribed = false) {
        this.handlers = handlers;
        this.isUnsubscribed = isUnsubscribed;
    }
    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }
    error(error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }
            this.unsubscribe();
        }
    }
    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }
            this.unsubscribe();
        }
    }
    unsubscribe() {
        this.isUnsubscribed = true;
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}
class Observable {
    _subscribe;
    constructor(_subscribe) {
        this._subscribe = _subscribe;
    }
    static from(values) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));
            observer.complete();
            return () => {
                console.log("unsubscribed");
            };
        });
    }
    subscribe(obs) {
        const observer = new Observer(obs);
        observer._unsubscribe = this._subscribe(observer);
        return {
            unsubscribe() {
                observer.unsubscribe();
            },
        };
    }
}
const userMock = {
    name: "User Name",
    age: 26,
    roles: ["user", "admin"],
    createdAt: new Date(),
    isDeleated: false,
};
const requestsMock = [
    {
        method: HTTP_METHODS.POST,
        host: "service.example",
        path: "user",
        body: userMock,
        params: {},
    },
    {
        method: HTTP_METHODS.GET,
        host: "service.example",
        path: "user",
        params: {
            id: "3f5h67s4s",
        },
    },
];
const handleRequest = (request) => {
    // handling of request
    return { status: HTTP_STATUSES.OK };
};
const handleError = (error) => {
    // handling of error
    return { status: HTTP_STATUSES.INTERNAL_SERVER_ERROR };
};
const handleComplete = () => console.log("complete");
const requests$ = Observable.from(requestsMock);
const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete,
});
subscription.unsubscribe();

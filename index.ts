interface IHadnler {
  next: (value: IRequest) => { status: HTTP_STATUSES };
  error: (err: IError) => { status: HTTP_STATUSES };
  complete: () => void;
}

type Subcribe = (obs: Observer) => () => void;

enum HTTP_METHODS {
  POST,
  GET,
}

enum HTTP_STATUSES {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

type UserRole = "user" | "admin";

interface IUser {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleated: boolean;
}

interface IRequest {
  method: HTTP_METHODS;
  host: string;
  path: string;
  body?: IUser;
  params: Object;
}

interface IError {
  code: HTTP_STATUSES.INTERNAL_SERVER_ERROR;
}

class Observer {
  _unsubscribe?: () => void;

  constructor(private handlers: IHadnler, private isUnsubscribed = false) {}

  next(value: IRequest) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: IError) {
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
  constructor(private _subscribe: Subcribe) {}

  static from(values: IRequest[]) {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: IHadnler) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: IUser = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: IRequest[] = [
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

const handleRequest = (request: IRequest) => {
  // handling of request
  return { status: HTTP_STATUSES.OK };
};
const handleError = (error: IError) => {
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

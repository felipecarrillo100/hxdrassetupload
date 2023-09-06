# NDBSqlite    

## Description
The NDBSqlite is a library to quickly publish tables in SQLITE as a Rest API

The Components are:

* [NDBModel.ts](src%2FNDBModel.ts) Any model you define must extend from this model 
* [NDBRepository.ts](src%2FNDBRepository.ts) The repository provides access to the database
* [NDBController.ts](src%2FNDBController.ts) The controllers creates REST API entries using express router 
* [QueryResult.ts](src%2FQueryResult.ts) Provide some types for input output parameters
* [NDBSqLite.ts](src%2FNDBSqLite.ts) It provides a simplified creation and initialization of a Sqlite database, optional 

## To build
This is the source code of an npm package. To build install and build the library. This will create a lib folder with the transpiled library.
```
npm install
npm run build
```

## To test
Some test have been added that run in nodejs.
```
npm run test
```

## To install

Simply install the NPM package in to your project

```
npm install ndbsqlite
``` 
## To use
1) Define your own models extending from NDBModel
```ts
class TestModel extends NDBModel {
    static TableName = "TestModel";

    private _id: number;
    private _a: string;
    private _b: string;

    constructor(options?:{id?: number, a: string, b: string}) {
        super();
        this._id = options?.id;
        this._a = options?.a;
        this._b = options?.b;
    }
    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
    }
    get a(): string {
        return this._a;
    }
    set a(value: string) {
        this._a = value;
    }
    get b(): string {
        return this._b;
    }
    set b(value: string) {
        this._b = value;
    }
    static getKeys() {
        return ["id", "a", "b"];
    }
}
```

2) Create controllers using NDBController and attach them to your Express app using an express Router and mount your app at any endpoint you like

```ts
// Create a SQLIte databse file and connect to it. 
// You can create it manually using the sqlite3 package or use the NDBSqLite class degined in this package
const ndbSqlite = new NDBSqLite({filePath:"ndb.db.sqlite"});

// Pass an sql file defining your tables
ndbSqlite.init("./sql/dbschema.sql").then(db=>{
    
    // Pass the sqlite database and your model, type it with the class of our model
    const controller = new NDBController<TestModel>({db, model: TestModel});
    const app = express();
    app.use(express.json());
    
    const router = Router()
    controller.addRoutes(router);

    // This api will be mapped to http://localhost:3000/test
    app.use(ROUTE, "/test");

    app.listen(3000, ()=> {
        console.log("Listening on port " + 3000);
    })
});

```


## Requirements.
* Sqlite3 is used to provide the sqlite functionality
* Express is optional and only required if you need  create the REST API 

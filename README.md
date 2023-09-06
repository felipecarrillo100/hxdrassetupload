# HxDRAssetUpload    

## Description
Pocket size library to upload assets to HxDR (beta)

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
    const hxDrAsseUpload= new HxDRAssetUpload({db});
    hxDrAsseUpload.start();
    
    // ...  execute your tasks here i.e.
    const asset = new HxDRAssetUploadTask({
        assetName: assetName,
        assetId: "",
        parentFolderId: "647dc49f-4696-4660-941e-8eb4ed66dccf",
        assetType: AssetTypeEnum.OBJ_UPLOAD,
        status: HxDRUploadStatusEnum.NEW
    })
    this.hxdrAsseUpload.addNewTask(asset, files).then(value=>{
        res.json(value);
    });



   hxDrAsseUpload.stop();

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

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


## Requirements.
* Sqlite3 is used to provide the sqlite functionality
* Express is optional and only required if you need  create the REST API 

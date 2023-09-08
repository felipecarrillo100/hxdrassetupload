import {describe, expect, it} from '@jest/globals';
import {initializeGraphQlClient} from "./hxdrlib/MutationLibrary";
import fetch from "cross-fetch";
import introspection from "./hxdrlib/introspection";
import {GraphqlClient} from "./graphql/GraphqlClient";
import {HxDRAssetUpload} from "./HxDRAssetUpload";
import path from "path";
import {NDBSqLite} from "ndbsqlite/lib/NDBSqLite";
import {HxDRAssetUploadTask} from "./core/models/HxDRAssetUploadTask";
import {AssetTypeEnum} from "./hxdrlib/AssetTypeEnum";
import {HxDRUploadStatusEnum} from "./core/models/HxDRUploadStatusEnum";
import fs from "fs";

const parentFolderId = "647dc49f-4696-4660-941e-8eb4ed66dccf";
const projectId = "301dd3ab-76cc-4ac7-9786-a8bc015d2cad";

const fileToken = path.join(__dirname, "../testassertions", "token.txt");
const validToken = fs.readFileSync(fileToken, "utf8").trim();

describe('HxDRAssetUpload ',  () => {
    let __token = "";

    const HxDRServer = "https://uat-hxdr.com";
    function getToken() {
        return __token;
    }

    function setToken(t:string) {
        __token = t;
    }

    const uri = `${HxDRServer}/graphql`; // <-- add the URL of the GraphQL server here
    const graphqlClient = new GraphqlClient({
        accessTokeProvider:getToken,
        uri,
        possibleTypes: introspection.possibleTypes,
        fetch: fetch
    });
    initializeGraphQlClient(graphqlClient.createClient());




    it('HxDRAssetUpload Create Delete Folder', async () => {
        let response = null;
        setToken(validToken);

        const database = new NDBSqLite({filePath:"test.db.sqlite"});

        const sqlpath = path.join(__dirname, "./sql/dbschema.sql");
        const db = await database.init(sqlpath);

        const hxDrAsseUpload= new HxDRAssetUpload({db});

        const result = await hxDrAsseUpload.createFolder("OneFolder", parentFolderId, projectId);


        if (result.success) {
            const newFolderId = result.id;
            const result2 = await hxDrAsseUpload.deleteFolder(newFolderId, projectId);
            expect(result2.success).toBe(true);
        } else {
            expect(false).toBe(true);
        }
    })

    it('HxDRAssetUpload Create Delete Asset (by TaskID)', async () => {
        let response = null;
        setToken(validToken);

        const database = new NDBSqLite({filePath:"test.db.sqlite"});

        const sqlpath = path.join(__dirname, "./sql/dbschema.sql");
        const db = await database.init(sqlpath);

        const hxDrAsseUpload= new HxDRAssetUpload({db});

        const task = new HxDRAssetUploadTask({
            assetName: "testAsset",
            assetId: "",
            parentFolderId: parentFolderId,
            assetType: AssetTypeEnum.OBJ_UPLOAD,
            status:  HxDRUploadStatusEnum.NEW
        })
        const result = await hxDrAsseUpload.addNewTask(task, [
            "C:\\git\\ortho2obj\\output10p\\texture_0.png",
            "C:\\git\\ortho2obj\\output10p\\wall.mtl",
            "C:\\git\\ortho2obj\\output10p\\wall.obj",
            "C:\\git\\ortho2obj\\output10p\\wall.prj"
        ]);
        if (result.success) {
            const result2 = await hxDrAsseUpload.deleteTask(result.id);
            expect(result2.success).toBe(true);
        } else {
            expect(false).toBe(true);
        }
    })

    it('HxDRAssetUpload Create Delete Asset (by AssetId)', async () => {
        let response = null;
        setToken(validToken);

        const database = new NDBSqLite({filePath:"test.db.sqlite"});

        const sqlpath = path.join(__dirname, "./sql/dbschema.sql");
        const db = await database.init(sqlpath);

        const hxDrAsseUpload= new HxDRAssetUpload({db});

        const task = new HxDRAssetUploadTask({
            assetName: "testAsset",
            assetId: "",
            parentFolderId: parentFolderId,
            assetType: AssetTypeEnum.OBJ_UPLOAD,
            status:  HxDRUploadStatusEnum.NEW
        })
        const result = await hxDrAsseUpload.addNewTask(task, [
            "C:\\git\\ortho2obj\\output10p\\texture_0.png",
            "C:\\git\\ortho2obj\\output10p\\wall.mtl",
            "C:\\git\\ortho2obj\\output10p\\wall.obj",
            "C:\\git\\ortho2obj\\output10p\\wall.prj"
        ]);
        if (result.success) {
            const result2 = await hxDrAsseUpload.deleteAsset(result.assetId);
            expect(result2.success).toBe(true);
        } else {
            expect(false).toBe(true);
        }
    })

    it('HxDRAssetUpload Simple delete (by folderId)', async () => { 8989
        let response = null;
        setToken(validToken);

        const database = new NDBSqLite({filePath:"test.db.sqlite"});

        const sqlpath = path.join(__dirname, "./sql/dbschema.sql");
        const db = await database.init(sqlpath);

        const hxDrAsseUpload= new HxDRAssetUpload({db});
        const folderId = "5380e4eb-ad57-41e5-b968-04a59f43b3ea";
        const projectId = "301dd3ab-76cc-4ac7-9786-a8bc015d2cad";

        const result2 = await hxDrAsseUpload.deleteFolder(folderId, projectId);
        expect(result2.success).toBe(true);

    })
})


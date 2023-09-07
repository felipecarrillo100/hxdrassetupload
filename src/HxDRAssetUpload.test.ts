import {describe, expect, it} from '@jest/globals';
import {initializeGraphQlClient} from "./hxdrlib/MutationLibrary";
import fetch from "cross-fetch";
import introspection from "./hxdrlib/introspection";
import {GraphqlClient} from "./graphql/GraphqlClient";
import {HxDRAssetUpload} from "./HxDRAssetUpload";
import path from "path";
import {NDBSqLite} from "ndbsqlite/lib/NDBSqLite";

const parentFolderId = "647dc49f-4696-4660-941e-8eb4ed66dccf";
const projectId = "301dd3ab-76cc-4ac7-9786-a8bc015d2cad";

const validToken = "eyJraWQiOiJLUm5aWWNXdFBYWTB3RUtTVU9LU3YzYnN5c3g0c291WmF6YWd5MjhOOEpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4NGRlNGMzNC1hZTIwLTQ4MjYtODY3MC0zYjA3ZmI5ZDEzYTkiLCJjb2duaXRvOmdyb3VwcyI6WyJVU0VSIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0NrS3Z2eHVBdyIsImNsaWVudF9pZCI6IjQ4bTVrdGVqaGNqcXBhZmZyOWtvbWdhZXNnIiwiZXZlbnRfaWQiOiIxZjcwNWJhNC0wNDk3LTQxYzItYmIzNi03MTA2NjQwZWVmOTciLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjkzODM4Mzc4LCJleHAiOjE2OTQxNTU2MjksImlhdCI6MTY5NDA2OTIyOSwianRpIjoiYTA1YzVjNDYtYjkzNS00NzEzLTg0YzctODIxMmViNmRjYWMzIiwidXNlcm5hbWUiOiI4NGRlNGMzNC1hZTIwLTQ4MjYtODY3MC0zYjA3ZmI5ZDEzYTkifQ.LXlt_NHB6RpSFE5jhSNuzdhskX_l9pisscKct-Av1HjC-IvOOapdjDc92XxfYkxa8hNid-uvXljYalTqyf_ktztv5Cs4308PZupj6XEVVmiZE3jxw605Zge1yNMkxX722h7kDzoeX5A1PEJZugRPhem6tYX8lg0ntM_e_sluu2lzxGDND7LEorti8CTFc1tF-NbrOP2auH9wWVOVT_r7clkbyXeR0tQqrPLM7dywQPSbTo_0InfA3ikn03_fu7Jt-7Dqhq0CUj3zS1irfvn5RUi3MnuiqEqsY1H2P-_C8a9htmiJz9ElInrUluKx20jdvQjWhTQikyTory9Hqd_asg"
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

})


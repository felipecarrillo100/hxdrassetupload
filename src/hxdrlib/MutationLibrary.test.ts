import {describe, expect, it} from '@jest/globals';
import {createAssetV3, createFolder, deleteAsset, deleteFolder, initializeGraphQlClient} from "./MutationLibrary";
import {GraphqlClient} from "../graphql/GraphqlClient";
import introspection from "./introspection";
import fetch from "cross-fetch";
import {AssetTypeEnum} from "./AssetTypeEnum";
import path from "path";
import fs from "fs";

const parentFolderId = "647dc49f-4696-4660-941e-8eb4ed66dccf";
const projectId = "301dd3ab-76cc-4ac7-9786-a8bc015d2cad";

const fileToken = path.join(__dirname, "../../testassertions", "token.txt");
const validToken = fs.readFileSync(fileToken, "utf8").trim();
describe('MutationLibrary ',  () => {
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


    it('MutationLibrary Invalid Token', async () => {
        let response = null;
        setToken("");
        try {
            response = await createFolder({
                name: "JustAName",
                parentFolderId: "647dc49f-4696-4660-941e-8eb4ed66dccf",
                projectId: "301dd3ab-76cc-4ac7-9786-a8bc015d2cad"
            });
        } catch (err) {
            expect(false).toBe(true);
        }

        const r = response.data.createFolderV2;

        expect(r.__typename).toBe("FolderErrorOperationNotAllowedOutput");
    })

    it('MutationLibrary Create Delete Folder', async () => {
        let response = null;
        setToken(validToken);
        try {
            response = await createFolder({
                name: "JustAName",
                parentFolderId,
                projectId
            });
        } catch (err) {
            expect(false).toBe(true);
        }
        const r = response.data.createFolderV2;

        if (r.__typename === "FolderErrorDuplicateNameOutput") {
            expect(false).toBe(true);
        } else
        if (r.__typename === "FolderOutput") {
            const response2 = await deleteFolder({id: r.id, projectId });
            const d = response2.data.deleteFolderV2;

            expect(d.__typename).toBe("DeleteFolderOutput");
        } else {
            expect(false).toBe(true);
        }
    })

    it('MutationLibrary Create Delete Asset', async () => {
        let response = null;
        setToken(validToken);
        try {
            response = await createAssetV3({
                name: "JustAnAssetName",
                folderId: parentFolderId,
                assetType: AssetTypeEnum.OBJ_UPLOAD,
            });
        } catch (err) {
            expect(false).toBe(true);
        }
        const r = response.data.createAssetV3;

        if (r.__typename === "AssetErrorDuplicateNameOutput") {
            expect(false).toBe(true);
        } else
        if (r.__typename === "GroupedAssetOutput") {
            const response2 = await deleteAsset({assetId: r.id});
            const d = response2.data.deleteAssetV2;

            expect(d.__typename).toBe("DeleteAssetOutput");
        } else {
            expect(false).toBe(true);
        }
    })
})


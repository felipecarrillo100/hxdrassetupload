import {
    CompleteAssetFile,
    CreateAssetV2, CreateAssetV3,
    CreateFileInAsset,
    CreateFolder, DeleteAsset, DeleteFolder,
    FileUploadURL,
    FinalizeAsset
} from "./queries/graphql.mutations";
import {ApolloClient, NormalizedCacheObject} from "@apollo/client";
import {AssetTypeEnum} from "./AssetTypeEnum";

export interface ETAGCHUNK {
    "part": number;
    "etag": string;
}

export interface URLCHUNK {
    "part": number;
    "url": string;
}

let client = null;

export function initializeGraphQlClient(aClient:  ApolloClient<NormalizedCacheObject>) {
    client =  aClient;
}

export function createFolder(params: {
    name: string;
    projectId: string;
    parentFolderId: string;
}) {
    return client.mutate({
        mutation: CreateFolder,
        variables: {
            "params": params
        }
    });
}

export function createAssetV2(params: {
    folderId: string;
    name: string;
    assetType: AssetTypeEnum;
}) {
    return client.mutate({
        mutation: CreateAssetV2,
        variables: {
            params: params
        }
    });
}

export function createAssetV3(params: {
    folderId: string;
    name: string;
    assetType: AssetTypeEnum;
}) {
    return client.mutate({
        mutation: CreateAssetV3,
        variables: {
            params: params
        }
    });
}

export function addFileToAsset(parameters: {
    "groupedAssetId": string;
    "fileName": string;
    "fileSize": number;
}) {
    return  client.mutate({
        mutation: CreateFileInAsset,
        variables: {
            "groupedAssetId": parameters.groupedAssetId,
            "fileName": parameters.fileName,
            "fileSize": parameters.fileSize
        }
    });
}

export function FileUploadSignedUrl( parameters: {fileId: string, partNumber: number}) {
    return  client.mutate({
        mutation: FileUploadURL,
        variables: {
            "chunkIndex": parameters.partNumber,
            "fileId": parameters.fileId
        }
    });
}


export async function CompleteChunkUpload(params: {fileId: string; multipartUploadsETags: ETAGCHUNK[]}) {
    return  client.mutate({
        mutation: CompleteAssetFile,
        variables: {
            params: params
        }
    });
}

export async function TriggerPipeline(assetId: string) {
    return  client.mutate({
        mutation: FinalizeAsset,
        variables: {
            assetId: assetId
        }
    });
}

export async function deleteFolder(parameters:{id:string; projectId: string;}) {
    return  client.mutate({
        mutation: DeleteFolder,
        variables: {
            "id": parameters.id,
            "projectId": parameters.projectId
        }
    });
}

export async function deleteAsset(parameters:{assetId:string}) {
    return  client.mutate({
        mutation: DeleteAsset,
        variables: {
            instanceId: parameters.assetId
        }
    });
}

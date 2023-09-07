import {NDBRepository} from "ndbsqlite/lib/NDBRepository";
import {HxDRAssetUploadTask} from "./core/models/HxDRAssetUploadTask";
import {HxDRFile} from "./core/models/HxDRFile";
import {HxDRFileChunk} from "./core/models/HxDRFileChunk";
import {AssetUploadTask} from "./core/tasks/AssetUploadTask";
import {FileUploadTask} from "./core/tasks/FileUploadTask";
import {ChunkUploadTask} from "./core/tasks/ChunkUploadTask";
import {BufferUploadTask} from "./core/tasks/BufferUploadTask";
import {Database} from "sqlite3";
import {getFilesInfoSimplified} from "./fileutils/FileUtils";
import {createAssetV3, createFolder, deleteAsset, deleteFolder} from "./hxdrlib/MutationLibrary";
import {AssetTypeEnum} from "./hxdrlib/AssetTypeEnum";
import {HxDRUploadStatusEnum} from "./core/models/HxDRUploadStatusEnum";

const ChunkSize = 5 * 1024 * 1024;
export class HxDRAssetUpload {
    private assetsRepository: NDBRepository<HxDRAssetUploadTask>;
    private filesRepository: NDBRepository<HxDRFile>;
    private chunksRepository: NDBRepository<HxDRFileChunk>;
    private assetUploadTask: AssetUploadTask;
    private filetUploadTask: FileUploadTask;
    private chunkUploadTask: ChunkUploadTask;
    private bufferUploadTask: BufferUploadTask;
    private db: Database;
    constructor(options:{
        db: Database
    }) {
        this.db = options.db;
        this.assetsRepository = new NDBRepository<HxDRAssetUploadTask>({db: this.db, model:HxDRAssetUploadTask});
        this.filesRepository = new NDBRepository<HxDRFile>({db: this.db, model:HxDRFile});
        this.chunksRepository = new NDBRepository<HxDRFileChunk>({db: this.db, model:HxDRFileChunk});

        this.assetUploadTask = new AssetUploadTask({
            assetRepository: this.assetsRepository,
            filesRepository: this.filesRepository,
            chunksRepository: this.chunksRepository
        });
        this.filetUploadTask = new FileUploadTask({
            assetRepository: this.assetsRepository,
            filesRepository: this.filesRepository,
            chunksRepository: this.chunksRepository
        });
        this.chunkUploadTask = new ChunkUploadTask({
            assetRepository: this.assetsRepository,
            filesRepository: this.filesRepository,
            chunksRepository: this.chunksRepository
        });
        this.bufferUploadTask = new BufferUploadTask({
            assetRepository: this.assetsRepository,
            filesRepository: this.filesRepository,
            chunksRepository: this.chunksRepository
        });
    }

    public start() {
        this.assetUploadTask.startTask()
        this.filetUploadTask.startTask();
        this.chunkUploadTask.startTask();
        this.bufferUploadTask.startTask();
    }
    public stop() {
        this.assetUploadTask.stopTask()
        this.filetUploadTask.stopTask();
        this.chunkUploadTask.stopTask();
        this.bufferUploadTask.stopTask();
    }

    //*****/
    private calculateChunks(fileSizeInBytes, chunkSize) {
        return  Math.ceil(fileSizeInBytes / chunkSize);
    }
    public async addNewTask(task: HxDRAssetUploadTask, files: string[]) {
        let assetFiles = []
        try {
            assetFiles = getFilesInfoSimplified(files);
        } catch (fileError) {
            return {success: false, cause: "File Error"};
        }
        let createAssetResult = null;
        try {
            createAssetResult = await createAssetV3({
                folderId: task.parentFolderId,
                name: task.assetName,
                assetType: task.assetType as AssetTypeEnum,
            });
        } catch (graphqlError) {
            return {success: false, cause: "Failed to create asset"};
        }
        const createAsset = createAssetResult.data.createAssetV3;

        // Expects: __typename===GroupedAssetOutput
        if (createAsset.__typename === "AssetErrorDuplicateNameOutput") {
            return ({success: false, cause: "Asset already exists"});
        }

        if (createAsset.__typename === "AssetErrorOperationNotAllowedOutput") {
            return  ({success: false, cause: "Create asset not allowed"});;
        }
        task.assetId = createAsset.id;
        const assetId = await this.assetsRepository.add(task);
        for (const file of assetFiles) {
            const assetFile = new HxDRFile({
                name: file.name,
                fileId: "",
                path: file.path,
                size: file.fileSizeInBytes,
                parts: this.calculateChunks(file.fileSizeInBytes, ChunkSize),
                chunkSize: ChunkSize,
                task_id: assetId,
                status: HxDRUploadStatusEnum.NEW
            })
            const file_Id = await this.filesRepository.add(assetFile);
            for (let i=0; i<assetFile.parts; ++i) {
                const chunk = new HxDRFileChunk({
                    url: "",
                    etag: "",
                    part: i+1,
                    start: i*assetFile.chunkSize,
                    size: i===assetFile.parts-1? assetFile.size % assetFile.chunkSize : assetFile.chunkSize,
                    status: HxDRUploadStatusEnum.NEW,
                    file_id: file_Id
                })
                const chunkId = await this.chunksRepository.add(chunk);
            }
        }

        return({success: true, cause: "", id:assetId, assetId: createAsset.id});
    }


    public async deleteAsset(assetId: string) {
        let result = null;
        let id = undefined;
        const assetQueryResults = await this.assetsRepository.queryLike({query:{assetId}});
        try {
            result = await deleteAsset({assetId});
        } catch (e) {
            if (e.graphQLErrors.length===1 && e.graphQLErrors[0].extensions.code === "NOT_FOUND") {
                return {success: false, cause: "NOT_FOUND", id: id, assetId}
            } else {
                return {success: false, cause: "HxDR graphQLErrors", id: id, assetId}
            }
        }
        if (result && result.data && result.data.deleteAssetV2.success) {
            if (assetQueryResults.matches>0) {
                id = assetQueryResults.items[0].id
                await this.assetsRepository.delete(id);
            }
            return {success: true, cause: "", id, assetId}
        } else {
            return {success: false, cause: "HxDR API can't delete", id, assetId}
        }
    }
    public async deleteTask(id: number) {
        let assetEntry = null;
        try {
            assetEntry = await this.assetsRepository.get(id);
        } catch (e) {
            return {success: false, cause: "Not Found", id: id}
        }
        let result = null;
        try {
            result = await deleteAsset({assetId: assetEntry.assetId});
        } catch (e) {
            if (e.graphQLErrors.length===1 && e.graphQLErrors[0].extensions.code === "NOT_FOUND") {
                await this.assetsRepository.delete(id);
                return {success: false, cause: "NOT_FOUND", id: id, assetId: assetEntry.assetId}
            } else {
                return {success: false, cause: "HxDR graphQLErrors", id: id, assetId: assetEntry.assetId}
            }
        }
        if (result && result.data && result.data.deleteAssetV2.success) {
            await this.assetsRepository.delete(id);
            return {success: true, cause: "", id: id, assetId: assetEntry.assetId}
        } else {
            return {success: false, cause: "HxDR API can't delete", id: id, assetId: assetEntry.assetId}
        }
    }

    public async deleteFolder(folderId: string, projectId: string) {
        let result = null;
        try {
            result = await deleteFolder({id: folderId, projectId });;
        } catch (e) {
            if (e.graphQLErrors.length===1 && e.graphQLErrors[0].extensions.code === "NOT_FOUND") {
                return {success: false, cause: "NOT_FOUND", folderId,  projectId}
            } else {
                return {success: false, cause: "HxDR graphQLErrors", folderId,  projectId}
            }
        }
        if (result && result.data && result.data.deleteFolderV2.__typename==="DeleteFolderOutput") {
            return {success: true, cause: "", folderId,  projectId}
        } else {
            return {success: false, cause: "HxDR API can't delete", folderId,  projectId}
        }
    }

    public async createFolder(name: string, folderId: string, projectId: string) {
        let result = null;
        try {
            result = await createFolder({parentFolderId: folderId, projectId, name });
        } catch (e) {
            if (e.graphQLErrors.length===1 && e.graphQLErrors[0].extensions.code === "NOT_FOUND") {
                return {success: false, cause: "NOT_FOUND", folderId,  projectId}
            } else {
                return {success: false, cause: "HxDR graphQLErrors", folderId,  projectId}
            }
        }
        if (result && result.data && result.data.createFolderV2.__typename==="FolderErrorDuplicateNameOutput"){
            return {success: false, cause: "Duplicated name", id: result.data.createFolderV2.id, folderId, projectId}
        } else
        if (result && result.data && result.data.createFolderV2.__typename==="FolderOutput") {
            return {success: true, cause: "", id: result.data.createFolderV2.id, folderId, projectId}
        } else {
            return {success: false, cause: "HxDR API can't delete folder", folderId,  projectId}
        }
    }
}

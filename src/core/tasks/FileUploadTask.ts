import {PeriodicTask} from "./PeriodicTask";
import {NDBRepository} from "ndbsqlite/lib/NDBRepository";
import {HxDRAssetUploadTask} from "../models/HxDRAssetUploadTask";
import {HxDRFile} from "../models/HxDRFile";
import {HxDRFileChunk} from "../models/HxDRFileChunk";
import {HxDRUploadStatusEnum} from "../models/HxDRUploadStatusEnum";
import {addFileToAsset, CompleteChunkUpload} from "../../hxdrlib/MutationLibrary";

export class FileUploadTask extends PeriodicTask {
    private capacity =100;

    private assetRepository: NDBRepository<HxDRAssetUploadTask>;
    private filesRepository: NDBRepository<HxDRFile>;
    private chunksRepository: NDBRepository<HxDRFileChunk>;
    private busyProcessing: boolean = false;
    private busyFinishedTasks: boolean = false;

    constructor(options:{
        assetRepository: NDBRepository<HxDRAssetUploadTask>
        filesRepository: NDBRepository<HxDRFile>
        chunksRepository: NDBRepository<HxDRFileChunk>
    }) {
        super({period: 1000});
        this.assetRepository = options.assetRepository;
        this.filesRepository = options.filesRepository;
        this.chunksRepository = options.chunksRepository;
    }

    private async startChunks(fileEntry: HxDRFile) {
        const queryResult = await this.chunksRepository.queryLikeGroup({
            limit: 10000,
            group: fileEntry.id,
            query: {status: HxDRUploadStatusEnum.NEW}
        });
        for (const chunkItem of queryResult.items) {
            const chunk = new HxDRFileChunk({id:chunkItem.id, status: HxDRUploadStatusEnum.PROCESSING});
            await this.chunksRepository.update(chunk);
            console.log(`Chunk-t ${chunkItem.id} moved from NEW to PROCESSING`)
        }
    }
    protected async mainJob ()  {
        if (!this.busyProcessing) {
            this.busyProcessing = true;
            try {
                await this.processAssetFiles();
            } catch (e) {
                console.log(e);
            }
            this.busyProcessing = false;
        }
        if (!this.busyFinishedTasks) {
            this.busyFinishedTasks = true;
            try {
                this.processCompletedTasks();
            } catch (e) {
                console.log(e);
            }
            this.busyFinishedTasks = false;
        }
    }

    private async processAssetFiles() {
        const  addFileToHxDR = async (fileEntry: HxDRFile) =>{
            const asset = await this.assetRepository.get(fileEntry.task_id);
            addFileToAsset({
                "groupedAssetId": asset.assetId,
                "fileName": fileEntry.name,
                "fileSize": fileEntry.size
            }).then(async result => {
                const fileId = result.data.addFileV2.id;
                const up = new HxDRFile({id: fileEntry.id, status: HxDRUploadStatusEnum.UPLOADING, fileId});
                await this.filesRepository.update(up);
                await this.startChunks(fileEntry);
                console.log(`FileX ${fileEntry.name} moved from Processing to Uploading`)
            });
        }
        const queryResult = await this.filesRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.PROCESSING}
        });

        const promises =[];
        for (const file of queryResult.items) {
            addFileToHxDR(file);
        }
    }

    private async processCompletedTasks() {
        const queryResult = await this.filesRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.UPLOADING}
        });
        for (const currentFile of queryResult.items) {
            const chunksQueryResult = await this.chunksRepository.queryLikeGroup( {
                limit:10000,
                group:currentFile.id,
                query:{status:HxDRUploadStatusEnum.COMPLETED}
            });
            if (chunksQueryResult.group === chunksQueryResult.matches) {
                const u = new HxDRFile({id:currentFile.id, status: HxDRUploadStatusEnum.UPLOADED});
                await this.filesRepository.update(u);
                console.log(`File ${currentFile.name} moved from Uploading to completed`);
                const parts = chunksQueryResult.items.map(ch=> ({part: ch.part, etag: ch.etag}));
                const result = await CompleteChunkUpload({fileId:currentFile.fileId, multipartUploadsETags:parts});
                console.log("Multipart Completed: "+JSON.stringify(result.data.completeMultipartUpload));
                const v = new HxDRFile({id:currentFile.id, status: HxDRUploadStatusEnum.COMPLETED});
                await this.filesRepository.update(v);
            }
        }
    }


}

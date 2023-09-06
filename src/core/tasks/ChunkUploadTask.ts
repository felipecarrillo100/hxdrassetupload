import {PeriodicTask} from "./PeriodicTask";
import {NDBRepository} from "ndbsqlite/lib/NDBRepository";
import {HxDRAssetUploadTask} from "../models/HxDRAssetUploadTask";
import {HxDRFile} from "../models/HxDRFile";
import {HxDRFileChunk} from "../models/HxDRFileChunk";
import {HxDRUploadStatusEnum} from "../models/HxDRUploadStatusEnum";
import {addFileToAsset, FileUploadSignedUrl} from "../../hxdrlib/MutationLibrary";

export class ChunkUploadTask extends PeriodicTask {
    private capacity =100;
    private busyProcessing: boolean = false;
    private busyFinishedTasks: boolean = false;

    private assetRepository: NDBRepository<HxDRAssetUploadTask>;
    private filesRepository: NDBRepository<HxDRFile>;
    private chunksRepository: NDBRepository<HxDRFileChunk>;

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


    protected async mainJob ()  {
        if (!this.busyProcessing) {
            this.busyProcessing = true;
            try {
                await this.processChunksFiles();
            } catch (e) {
                console.log(e);
            }
            this.busyProcessing = false;
        }
        if (!this.busyFinishedTasks) {
            this.busyProcessing = true;
            try {
                this.clearCapacity();
            } catch (e) {
                console.log(e);
            }
            this.busyProcessing = false;
        }
    }

    private async processChunksFiles() {
        const  addChunkToHxDR = async (chunk) =>{
            const file = await this.filesRepository.get(chunk.file_id);
            FileUploadSignedUrl({
                fileId: file.fileId, partNumber:chunk.part
            }).then(async result => {
                const url = result.data.multipartUploadURL.uploadUrl
                const up = new HxDRFileChunk({id: chunk.id, url, status: HxDRUploadStatusEnum.UPLOADING});
                await this.chunksRepository.update(up);
                console.log(`Chunk ${chunk.id} moved from Processing to Uploading`)
            });
        }
        const queryResult = await this.chunksRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.PROCESSING}
        });

        for (const chunk of queryResult.items) {
            addChunkToHxDR(chunk);
        }
    }

    private async clearCapacity() {
        const queryResult = await this.chunksRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.UPLOADED}
        });
        for (const currentChunk of queryResult.items) {
            if (currentChunk.etag &&  currentChunk.etag.length > 2) {
                const u = new HxDRFileChunk({id: currentChunk.id, status:HxDRUploadStatusEnum.COMPLETED});
                await this.chunksRepository.update(u);
                console.log(`Chunk ${currentChunk.id} moved from UPLOADED to COMPLETED`)
            }
        }
    }

}

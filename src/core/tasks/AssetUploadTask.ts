import {PeriodicTask} from "./PeriodicTask";
import {NDBRepository} from "ndbsqlite/lib/NDBRepository";
import {HxDRAssetUploadTask} from "../models/HxDRAssetUploadTask";
import {HxDRFile} from "../models/HxDRFile";
import {HxDRFileChunk} from "../models/HxDRFileChunk";
import {HxDRUploadStatusEnum} from "../models/HxDRUploadStatusEnum";
import {TriggerPipeline} from "../../hxdrlib/MutationLibrary";

export class AssetUploadTask extends PeriodicTask {
    private capacity =100;
    private busyNewTasks = false;
    private busyProcessingTasks = false;
    private busyFinishedTasks = false;

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
        if (!this.busyNewTasks) {
            this.busyNewTasks = true;
            try {
                await this.addNewTasks();
            } catch (e) {
                console.log(e);
            }
            this.busyNewTasks = false;
        }
        if (!this.busyProcessingTasks) {
            this.busyProcessingTasks = true;
            try {
                await this.processAssetFiles();
            } catch (e) {
                console.log(e);
            }
            this.busyProcessingTasks = false;
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

    private async addNewTasks() {
        const queryResult = await this.assetRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.NEW}
        });
        for (const asset of queryResult.items) {
            const u = new HxDRAssetUploadTask();
            u.id = asset.id;
            u.status = HxDRUploadStatusEnum.PROCESSING;
            await this.assetRepository.update(u);
            console.log(`Asset ${asset.assetName} moved from NEW to PROCESSING`)
        }
    }


    private async processAssetFiles() {
        const queryResult = await this.assetRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.PROCESSING}
        });
        for (const asset of queryResult.items) {
                const fileQueryResult = await this.filesRepository.queryLikeGroup( {limit:10000, group:asset.id, query:{status:HxDRUploadStatusEnum.NEW}});
                for (const file of fileQueryResult.items) {
                    const uf = new HxDRFile({id:file.id, status:HxDRUploadStatusEnum.PROCESSING});
                    await this.filesRepository.update(uf);
                    console.log(`File ${file.name} moved NEW to PROCESSING`)
                }
            const ua = new HxDRAssetUploadTask({id:asset.id, status:HxDRUploadStatusEnum.UPLOADING});
            await this.assetRepository.update(ua);
            console.log(`Asset ${asset.assetName} moved from PROCESSING to UPLOADING`)
        }
    }

    private async processCompletedTasks() {
        const queryResult = await this.assetRepository.queryLike({
            limit: this.capacity,
            query: {status: HxDRUploadStatusEnum.UPLOADING}
        });
        for (const asset of queryResult.items) {
            const fileQueryResult = await this.filesRepository.queryLikeGroup({
                limit: 10000,
                group: asset.id,
                query: {status: HxDRUploadStatusEnum.COMPLETED}
            });
            if (fileQueryResult.group === fileQueryResult.matches) {
                const u = new HxDRAssetUploadTask();
                u.id = asset.id;
                u.status = HxDRUploadStatusEnum.COMPLETED;
                await this.assetRepository.update(u);
                console.log(`Asset ${asset.assetName} moved from UPLOADING to COMPLETED`);
                TriggerPipeline(asset.assetId).then(result => {
                    console.log(JSON.stringify(result));
                });
            }
        }
    }

}

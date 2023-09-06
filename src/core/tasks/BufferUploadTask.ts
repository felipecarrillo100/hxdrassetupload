import {PeriodicTask} from "./PeriodicTask";
import {NDBRepository} from "ndbsqlite/lib/NDBRepository";
import {HxDRAssetUploadTask} from "../models/HxDRAssetUploadTask";
import {HxDRFile} from "../models/HxDRFile";
import {HxDRFileChunk} from "../models/HxDRFileChunk";
import {HxDRUploadStatusEnum} from "../models/HxDRUploadStatusEnum";
import {loadFileChunkSync} from "../../fileutils/FileUtils";

import {fetchRetry} from "../../fetchutils/fetchretry";
const mime = require('mime');

export class BufferUploadTask extends PeriodicTask {
    private busy = false;
    private MAX = 100;

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
        if (!this.busy) {
            this.processChunksFiles();
        }
    }

    private async processChunksFiles() {

        const queryResult = await this.chunksRepository.queryLike({
            limit: this.MAX,
            query: {status: HxDRUploadStatusEnum.UPLOADING}
        });

        const promises =[];
        this.busy = queryResult.items.length>0
        for (const chunkItem of queryResult.items) {
            const fileItem = await this.filesRepository.get(chunkItem.file_id);
            const mime_type = mime.getType(fileItem.name)
            const buffer = loadFileChunkSync({fileName: fileItem.path, chunkSize:fileItem.chunkSize, start: chunkItem.start, size:chunkItem.size});

            const promise = new Promise((resolve)=>{
                BufferUploadTask.UploadBufferToChunk({chunk:chunkItem, buffer: buffer, mime_type}).then(async chunkItem => {
                    await this.chunksRepository.update(chunkItem);
                    if (chunkItem.status === HxDRUploadStatusEnum.UPLOADED) {
                        console.log(`Chunk ${chunkItem.id} moved from UPLOADING to UPLOADED`);
                    } else {
                        console.log(`Chunk ${chunkItem.id} moved from UPLOADING to FAIL`);
                    }
                    resolve(true);
                })
            })
            promises.push(promise);
        }

        Promise.all(promises).then(chunkItems => {
            this.busy = false;
        })

    }

    private static UploadBufferToChunk(options:{chunk: HxDRFileChunk, buffer: any, mime_type: string}) {
        return new Promise<HxDRFileChunk>((resolve) => {
            fetchRetry(options.chunk.url, 100, 5, {
                method: 'PUT',
                body: options.buffer,
                headers: {
                    "Accept":"*/*",
                    "Accept-Encoding":"gzip, deflate, br",
                    "Accept-Language": "en,es;q=0.9,en-US;q=0.8,nl;q=0.7,uk;q=0.6",
                    "Access-Control-Request-Headers": "content-type,x-multipart-chunk",
                    "Access-Control-Request-Method":"PUT",
                    "Connection":"keep-alive",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                    "Content-Length": options.buffer.length,
                    "Content-Type": options.mime_type
                }
            }).then(response=>{
                if (response.ok) {
                    response.text().then(()=>{
                        const etagQuoted = response.headers.get("etag") as string;
                        const etag = etagQuoted.replace(/"/g, "")
                        const chunk = new HxDRFileChunk({id:options.chunk.id, etag, status:HxDRUploadStatusEnum.UPLOADED});
                        resolve(chunk);
                    })
                } else {
                    const chunk = new HxDRFileChunk();
                    chunk.id = options.chunk.id;
                    chunk.status = HxDRUploadStatusEnum.FAILED
                    resolve(chunk);
                }
            }, ()=>{
                const chunk = new HxDRFileChunk();
                chunk.id = options.chunk.id;
                chunk.status = HxDRUploadStatusEnum.FAILED
                resolve(chunk);
            });
        })
    }

}

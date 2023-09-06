import {NDBModel} from "ndbsqlite/lib/NDBModel";

export interface HxDRFileChunkConstructorOptions {
    id?: number;
    url?: string;
    etag?: string;
    part?: number;
    start?: number;
    size?: number;
    status?: number;
    file_id?: number;
}
export class HxDRFileChunk extends NDBModel {
    static TableName = "HxDRFileChunk";

    private _id: number;
    private _url: string;
    private _etag: string;
    private _part: number;
    private _start: number;
    private _size: number;
    private _status: number;
    private _file_id: number;

    constructor(options?: HxDRFileChunkConstructorOptions) {
        super();
        if (!options) return;
        this._id = options.id;
        this._url = options.url;
        this._etag = options.etag;
        this._part = options.part;
        this._start = options.start;
        this._size = options.size;
        this._status = options.status;
        this._file_id = options.file_id;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }

    get etag(): string {
        return this._etag;
    }

    set etag(value: string) {
        this._etag = value;
    }

    get part(): number {
        return this._part;
    }

    set part(value: number) {
        this._part = value;
    }

    get start(): number {
        return this._start;
    }

    set start(value: number) {
        this._start = value;
    }

    get size(): number {
        return this._size;
    }

    set size(value: number) {
        this._size = value;
    }

    get status(): number {
        return this._status;
    }

    set status(value: number) {
        this._status = value;
    }

    get file_id(): number {
        return this._file_id;
    }

    set file_id(value: number) {
        this._file_id = value;
    }

    public static  getKeys() {
        return [
            "id",
            "url",
            "etag",
            "part",
            "start",
            "size",
            "status",
            "file_id"
        ]
    }

    public static getTextSearchKey() {
        return "name";
    }

    public static getGroupName() {
        return "file_id";
    }
}

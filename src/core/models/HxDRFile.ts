import {NDBModel} from "ndbsqlite/lib/NDBModel";
export interface HxDRFileConstructorOptions {
    id?: number;
    fileId?: string;
    name?: string;
    path?: string;
    size?: number;
    parts?: number;
    chunkSize?: number;
    status?: number;
    task_id?: number;
}
export class HxDRFile extends NDBModel {
    static TableName = "HxDRFile";

    private _id: number;
    private _fileId: string;
    private _name: string;
    private _path: string;
    private _size: number;
    private _parts: number;
    private _chunkSize: number;
    private _status: number;
    private _task_id: number;

    constructor(options?: HxDRFileConstructorOptions) {
        super();
        if (!options) return;
        this._id = options.id;
        this._fileId = options.fileId;
        this._name = options.name;
        this._path = options.path;
        this._size = options.size;
        this._parts = options.parts;
        this._chunkSize = options.chunkSize;
        this._status = options.status;
        this._task_id = options.task_id;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get fileId(): string {
        return this._fileId;
    }

    set fileId(value: string) {
        this._fileId = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get path(): string {
        return this._path;
    }

    set path(value: string) {
        this._path = value;
    }

    get size(): number {
        return this._size;
    }

    set size(value: number) {
        this._size = value;
    }

    get parts(): number {
        return this._parts;
    }

    set parts(value: number) {
        this._parts = value;
    }

    get chunkSize(): number {
        return this._chunkSize;
    }

    set chunkSize(value: number) {
        this._chunkSize = value;
    }

    get status(): number {
        return this._status;
    }

    set status(value: number) {
        this._status = value;
    }

    get task_id(): number {
        return this._task_id;
    }

    set task_id(value: number) {
        this._task_id = value;
    }

    public static getKeys() {
        return [
            "id",
            "fileId",
            "name",
            "path",
            "size",
            "parts",
            "chunkSize",
            "status",
            "task_id"
        ]
    }

    public static getTextSearchKey() {
        return "name";
    }

    public static getGroupName() {
        return "task_id"
    }
}

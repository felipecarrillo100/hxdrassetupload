import {NDBModel} from "ndbsqlite/lib/NDBModel";

interface HxDRAssetUploadTaskConstructorOptions {
    id?: number;
    assetName?: string;
    assetId?: string;
    parentFolderId?: string;
    assetType?: string;
    status?: number;
}
export class HxDRAssetUploadTask extends NDBModel {
    static TableName = "HxDRAssetUploadTask";

    private _id: number;
    private _assetName: string;
    private _assetId: string;
    private _assetType: string;
    private _parentFolderId: string;
    private _status: number;
    constructor(options?: HxDRAssetUploadTaskConstructorOptions) {
        super();
        if (!options) return;
        this._id = options.id;
        this._assetName = options.assetName;
        this._assetId = options.assetId;
        this._assetType = options.assetType;
        this._parentFolderId = options.parentFolderId;
        this._status = options.status;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get assetName(): string {
        return this._assetName;
    }

    set assetName(value: string) {
        this._assetName = value;
    }

    get assetId(): string {
        return this._assetId;
    }

    set assetId(value: string) {
        this._assetId = value;
    }

    get assetType(): string {
        return this._assetType;
    }

    set assetType(value: string) {
        this._assetType = value;
    }

    get parentFolderId(): string {
        return this._parentFolderId;
    }

    set parentFolderId(value: string) {
        this._parentFolderId = value;
    }

    get status(): number {
        return this._status;
    }

    set status(value: number) {
        this._status = value;
    }

    public static getKeys() {
        return [
            "id",
            "assetName",
            "assetId",
            "assetType",
            "parentFolderId",
            "status"
        ]
    }

    public static getTextSearchKey() {
        return "assetName";
    }

}

CREATE TABLE IF NOT EXISTS HxDRAssetUploadTask (
                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   assetName VARCHAR(320) NOT NULL,
    assetId VARCHAR(64) NOT NULL,
    assetType VARCHAR(64) NOT NULL,
    parentFolderId VARCHAR(64) NOT NULL,
    status INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS HxDRFile (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        fileId VARCHAR(64) NOT NULL,
    name VARCHAR(320) NOT NULL,
    path VARCHAR(320) NOT NULL,
    size INTEGER NOT NULL,
    parts INTEGER NOT NULL,
    chunkSize INTEGER NOT NULL,
    status INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    FOREIGN KEY (task_id)
    REFERENCES HxDRAssetUploadTask (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS HxDRFileChunk (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             url VARCHAR(2200) NOT NULL,
    etag VARCHAR(64) NOT NULL,
    part INTEGER NOT NULL,
    start INTEGER NOT NULL,
    size INTEGER NOT NULL,
    status INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    FOREIGN KEY (file_id)
    REFERENCES HxDRFile (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
    );

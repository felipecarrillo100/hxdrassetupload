import fs from "fs";
import path from "path";

export interface FileInfoSimplified {
    name: string;
    extension: string;
    fileSizeInBytes: number;
    path: string;
}

export const getFilesInfoSimplified = (files:string[]) => {
    const response = [] as FileInfoSimplified[];
    for (let file of files) {
        const extension = path.extname(file);
        const fullPath = path.normalize(file);
        const fileSizeInBytes = fs.statSync(fullPath).size;
        const name = path.basename(fullPath);
        response.push({ name, extension, fileSizeInBytes, path:fullPath });
    }
    return response;
}

export function loadFileChunkSync(d: {fileName?: string, start: number, size: number, chunkSize: number, filePointer?: number}) {
    const filePointer = d.filePointer ? d.filePointer : fs.openSync(d.fileName, 'r');
    const chunkBuffer = Buffer.alloc(d.chunkSize);
    let bytesRead = fs.readSync(filePointer, chunkBuffer, 0, d.size, d.start);
    if (!d.filePointer) fs.closeSync(filePointer);
    return chunkBuffer.subarray(0, bytesRead);
}

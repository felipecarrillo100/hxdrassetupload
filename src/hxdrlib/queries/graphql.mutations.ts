import {gql} from "@apollo/client";

export const DeleteFolder = gql`mutation deleteFolder($id: ID!, $projectId: ID!) {
  deleteFolderV2(folderId: $id, projectId: $projectId) {
    __typename
  }
}
`
;

export const CreateFileInAsset = gql`mutation createAssetFile($fileName: String!, $fileSize: BigInteger!, $groupedAssetId: ID!) {
  addFileV2(
    params: {fileName: $fileName, fileSize: $fileSize, groupedAssetId: $groupedAssetId}
  ) {
    __typename
    ... on FileOutput {
      id
      __typename
    }
  }
}`

export const FileUploadURL = gql`query presignedUrl($fileId: ID!, $chunkIndex: Int!) {
  multipartUploadURL(params: {fileId: $fileId, partNumber: $chunkIndex}) {
    __typename
    ... on MultipartUploadUrlOutput {
      uploadUrl
      __typename
    }
  }
}`;

export const CompleteAssetFile = gql`mutation finalizeAssetFile($params: MultipartUploadCompleteInput!) {
  completeMultipartUpload(params: $params) {
    executed
    __typename
  }
}`;

export const FinalizeAsset = gql`mutation finalizeAsset($assetId: ID!) {
  completeAssetFileList(groupedAssetId: $assetId) {
    executed
    message
    __typename
  }
}`;

export const CreateAssetV3 = gql`mutation createAsset($params: CreateAssetInputV3!) {
  createAssetV3(params: $params) {
    __typename
    ... on GroupedAssetOutput {
      ...Asset
      __typename
    }
  }
}

fragment Asset on GroupedAssetOutput {
  id
  folder {
    id
    __typename
  }
  assetSize
  name
  thumbnailPath
  createdAt
  modifiedAt
  createdBy {
    id
    email
    firstName
    lastName
    profilePictureUrl
    __typename
  }
  assetType
  assetStatus
  downloadLink
  sharingCode
  asset {
    id
    artifactsV2 {
      contents {
        ...AssetArtifact
        __typename
      }
      __typename
    }
    __typename
  }
  ...AssetTree
  __typename
}

fragment AssetArtifact on ArtifactItemOutput {
  id
  dataCategory
  addresses {
    contents {
      ...AssetArtifactAddress
      __typename
    }
    __typename
  }
  __typename
}

fragment AssetArtifactAddress on AddressOutput {
  __typename
  ... on Renderable {
    id
    endpoint
    label
    consumptionType
    serviceType
    __typename
  }
  ... on AddressHspcOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressLtsOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressCubemapJsonOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressOgc3DOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    qualityFactor
    __typename
  }
  ... on AddressDownloadableOutput {
    expirationDate
    label
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
}

fragment ProcessingPipeline on ProcessingPipelineInfoOutput {
  id
  name
  status
  errors {
    type
    __typename
  }
  __typename
}

fragment AssetTree on GroupedAssetOutput {
  folder {
    id
    name
    isRootFolder
    parentFolder {
      id
      name
      isRootFolder
      parentFolder {
        id
        name
        isRootFolder
        parentFolder {
          id
          name
          isRootFolder
          parentFolder {
            id
            name
            isRootFolder
            parentFolder {
              id
              name
              isRootFolder
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}`;


export const CreateAssetV2 = gql`mutation createAsset($params: CreateAssetInput!) {
  createAssetV2(params: $params) {
    __typename
    ... on GroupedAssetOutput {
      ...Asset
      __typename
    }
  }
}

fragment Asset on GroupedAssetOutput {
  id
  folder {
    id
    __typename
  }
  assetSize
  name
  thumbnailPath
  createdAt
  modifiedAt
  createdBy {
    id
    email
    firstName
    lastName
    profilePictureUrl
    __typename
  }
  assetType
  assetStatus
  downloadLink
  sharingCode
  asset {
    id
    artifactsV2 {
      contents {
        ...AssetArtifact
        __typename
      }
      __typename
    }
    __typename
  }
  ...AssetTree
  __typename
}

fragment AssetArtifact on ArtifactItemOutput {
  id
  dataCategory
  addresses {
    contents {
      ...AssetArtifactAddress
      __typename
    }
    __typename
  }
  __typename
}

fragment AssetArtifactAddress on AddressOutput {
  __typename
  ... on Renderable {
    id
    endpoint
    label
    consumptionType
    serviceType
    __typename
  }
  ... on AddressHspcOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressLtsOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressCubemapJsonOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
  ... on AddressOgc3DOutput {
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    qualityFactor
    __typename
  }
  ... on AddressDownloadableOutput {
    expirationDate
    label
    processingPipelineInfo {
      ...ProcessingPipeline
      __typename
    }
    __typename
  }
}

fragment ProcessingPipeline on ProcessingPipelineInfoOutput {
  id
  name
  status
  errors {
    type
    __typename
  }
  __typename
}

fragment AssetTree on GroupedAssetOutput {
  folder {
    id
    name
    isRootFolder
    parentFolder {
      id
      name
      isRootFolder
      parentFolder {
        id
        name
        isRootFolder
        parentFolder {
          id
          name
          isRootFolder
          parentFolder {
            id
            name
            isRootFolder
            parentFolder {
              id
              name
              isRootFolder
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}`;

export const CreateFolder = gql`mutation createFolder($params: CreateFolderInput!) {
    createFolderV2(params: $params) {
        __typename
    ...Folder
    }
}

fragment Folder on FolderOutput {
    id
    modifiedAt
    createdAt
    description
    name
    includedFoldersSummary: folders(
        paging: {pageNumber: 0, pageOffset: 0, pageSize: 0}
) {
        total
        __typename
    }
    includedAssetsSummary: assets(
        paging: {pageSize: 10, pageNumber: 0, pageOffset: 0}
    filter: {not: {byAssetType: HXCP_PURCHASE}}
) {
        contents {
            id
            thumbnailPath
            __typename
        }
        total
        __typename
    }
...FolderTree
    __typename
}

fragment FolderTree on FolderOutput {
    isNestingLevelReached
    nestingLevel
    parentFolder {
        nestingLevel
        id
        name
        parentFolder {
            nestingLevel
            id
            name
            parentFolder {
                nestingLevel
                id
                name
                parentFolder {
                    nestingLevel
                    id
                    name
                    parentFolder {
                        nestingLevel
                        id
                        name
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }
    __typename
}`
;

export const DeleteAsset = gql`mutation deleteAsset($instanceId: ID!) {
  deleteAssetV2(groupedAssetId: $instanceId) {
    __typename
    ... on DeleteAssetOutput {
      success
      __typename
    }
  }
}`
;

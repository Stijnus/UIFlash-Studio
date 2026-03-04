/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface Artifact {
  id: string;
  styleName: string;
  modelName?: string;
  html: string;
  status: "streaming" | "complete" | "error";
  isGenerating?: boolean;
  streamingCode?: string;
  usage?: UsageMetadata;
}

export interface Session {
  id: string;
  prompt: string;
  timestamp: number;
  artifacts: Artifact[];
  images?: UploadedImage[];
}

export interface UploadedImage {
  id: string;
  data?: string;
  mimeType: string;
  url: string;
}

export interface Generation {
  id: string;
  styleName: string;
  html: string;
  streamingCode: string;
  isGenerating: boolean;
  /** 0-100 progress value derived from streaming bytes received */
  streamingProgress: number;
  modelName?: string;
  usage?: UsageMetadata;
}

export interface GeneratedAsset {
  data: string;
  mimeType: string;
  url: string;
}

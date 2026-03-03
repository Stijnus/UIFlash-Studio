/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Artifact {
  id: string;
  styleName: string;
  modelName?: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface Session {
    id: string;
    prompt: string;
    timestamp: number;
    artifacts: Artifact[];
    images?: { data: string; mimeType: string }[];
}

export interface ComponentVariation { name: string; html: string; }
export interface LayoutOption { name: string; css: string; previewHtml: string; }
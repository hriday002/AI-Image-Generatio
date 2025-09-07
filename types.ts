import { ASPECT_RATIOS } from './constants';

export type AspectRatio = typeof ASPECT_RATIOS[number];

export interface ImageConfig {
  numberOfImages: number;
  aspectRatio: AspectRatio;
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  images: string[];
  config: ImageConfig;
  timestamp: number;
  sourceImage?: string; // base64 data URL
}

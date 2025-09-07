

import { GoogleGenAI, Modality } from "@google/genai";
import { ImageConfig, UploadedImage } from '../types';
import { IMAGE_MODEL_NAME, IMAGE_EDIT_MODEL_NAME } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImages = async (prompt: string, config: ImageConfig): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: IMAGE_MODEL_NAME,
            prompt,
            config: {
                numberOfImages: config.numberOfImages,
                aspectRatio: config.aspectRatio,
                outputMimeType: 'image/jpeg',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("No images were generated. The prompt may have been blocked.");
        }

        const imageUrls = response.generatedImages.map(img => {
            const base64ImageBytes: string = img.image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        });

        return imageUrls;
    } catch (error) {
        console.error("Error generating images:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate images: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating images.");
    }
};

export const generateFromImageAndPrompt = async (prompt: string, image: UploadedImage): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_EDIT_MODEL_NAME,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: image.base64,
                            mimeType: image.mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No images were generated. The prompt may have been blocked.");
        }

        const imageUrls: string[] = [];
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                imageUrls.push(`data:${mimeType};base64,${base64ImageBytes}`);
            }
        }
        
        if (imageUrls.length === 0) {
             throw new Error("The model did not return any images. The prompt may have been blocked or the model couldn't fulfill the request.");
        }

        return imageUrls;
    } catch (error) {
        console.error("Error generating from image and prompt:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate images: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating images.");
    }
};

import React, { useState, useRef } from 'react';
import type { ImageConfig, AspectRatio, UploadedImage } from '../types';
import { ASPECT_RATIOS } from '../constants';

interface PromptControlsProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: (prompt: string, config: ImageConfig, image?: UploadedImage) => void;
    isLoading: boolean;
    uploadedImage: UploadedImage | null;
    onImageUpload: (image: UploadedImage) => void;
    onImageRemove: () => void;
    generationCount: number;
    generationLimit: number;
}

const fileToBase64 = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

const SUGGESTION_KEYWORDS = [
  'photorealistic', 'hyperrealistic', 'cinematic', 'epic', '4K', '8K', 'detailed', 'intricate', 'studio lighting',
  'fantasy', 'sci-fi', 'steampunk', 'cyberpunk', 'vaporwave', 'gothic', 'baroque',
  'oil painting', 'watercolor', 'sketch', 'illustration', 'comic book style', 'abstract', 'minimalist',
  'by artgerm', 'by greg rutkowski', 'by makoto shinkai',
  'vibrant colors', 'monochromatic', 'moody', 'serene', 'dynamic',
  'portrait', 'landscape', 'wide shot', 'close-up', 'macro',
  'unreal engine', 'octane render'
];
const MAX_PROMPT_LENGTH = 1000;


const PromptControls: React.FC<PromptControlsProps> = ({ prompt, setPrompt, onGenerate, isLoading, uploadedImage, onImageUpload, onImageRemove, generationCount, generationLimit }) => {
    const [config, setConfig] = useState<ImageConfig>({
        numberOfImages: 1,
        aspectRatio: '1:1',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const handleFileChange = async (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                try {
                    const uploadedImage = await fileToBase64(file);
                    onImageUpload(uploadedImage);
                } catch (error) {
                    console.error("Error converting file to base64", error);
                }
            }
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onGenerate(prompt, config, uploadedImage ?? undefined);
        }
    };
    
    const handleConfigChange = <K extends keyof ImageConfig>(key: K, value: ImageConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        const lastSpaceIndex = prompt.lastIndexOf(' ');
        const lastCommaIndex = prompt.lastIndexOf(',');
        const lastSeparatorIndex = Math.max(lastSpaceIndex, lastCommaIndex);

        const basePrompt = prompt.substring(0, lastSeparatorIndex + 1);
        const newPrompt = `${basePrompt}${suggestion} `;
        
        setPrompt(newPrompt);
        setSuggestions([]);
    };
    
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setPrompt(value);

        const lastSpaceIndex = value.lastIndexOf(' ');
        const lastCommaIndex = value.lastIndexOf(',');
        const lastSeparatorIndex = Math.max(lastSpaceIndex, lastCommaIndex);
        const currentWord = value.substring(lastSeparatorIndex + 1).trim().toLowerCase();

        if (currentWord) {
            const filteredSuggestions = SUGGESTION_KEYWORDS.filter(kw =>
                kw.toLowerCase().startsWith(currentWord)
            );
            setSuggestions(filteredSuggestions);
            setActiveSuggestionIndex(0);
        } else {
            setSuggestions([]);
        }
    };

    const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (suggestions[activeSuggestionIndex]) {
                    e.preventDefault();
                    handleSuggestionClick(suggestions[activeSuggestionIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setSuggestions([]);
            }
        }
    };

    const isImageEditing = !!uploadedImage;
    const isLimitReached = generationCount >= generationLimit;

    return (
        <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-gray-700">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                         <textarea
                            value={prompt}
                            onChange={handlePromptChange}
                            onKeyDown={handlePromptKeyDown}
                            onBlur={() => setTimeout(() => setSuggestions([]), 150)} // delay to allow click
                            placeholder={isImageEditing ? "Describe what you want to change..." : "Describe your vision..."}
                            className="w-full h-full min-h-[112px] p-4 pb-6 bg-gray-900 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                            disabled={isLoading}
                            maxLength={MAX_PROMPT_LENGTH}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1" role="listbox">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                        className={`px-4 py-2 cursor-pointer text-sm ${index === activeSuggestionIndex ? 'bg-purple-800' : 'hover:bg-purple-900/50'}`}
                                        role="option"
                                        aria-selected={index === activeSuggestionIndex}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className={`absolute bottom-2 right-3 text-xs pointer-events-none ${prompt.length >= MAX_PROMPT_LENGTH ? 'text-red-400' : prompt.length > MAX_PROMPT_LENGTH - 100 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {prompt.length} / {MAX_PROMPT_LENGTH}
                        </div>
                    </div>
                    <div className="w-full md:w-52">
                        {uploadedImage ? (
                            <div className="relative h-full aspect-square group">
                                <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} alt="Upload preview" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={onImageRemove}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div 
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`h-full aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:border-purple-600'}`}
                            >
                                 <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileChange(e.target.files)}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <p className="text-sm text-center text-gray-400">Upload an image</p>
                                <p className="text-xs text-center text-gray-500">(Optional)</p>
                            </div>
                        )}
                    </div>
                </div>
               
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div className="flex flex-col">
                        <label htmlFor="num-images" className={`text-sm font-medium mb-1 ${isImageEditing ? 'text-gray-600' : 'text-gray-400'}`}>Images</label>
                        <select
                            id="num-images"
                            value={isImageEditing ? 1 : config.numberOfImages}
                            onChange={(e) => handleConfigChange('numberOfImages', parseInt(e.target.value))}
                            className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || isImageEditing}
                        >
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        {isImageEditing && <p className="text-xs text-gray-500 mt-1">Not available for image editing.</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="aspect-ratio" className={`text-sm font-medium mb-1 ${isImageEditing ? 'text-gray-600' : 'text-gray-400'}`}>Aspect Ratio</label>
                         <select
                            id="aspect-ratio"
                            value={config.aspectRatio}
                            onChange={(e) => handleConfigChange('aspectRatio', e.target.value as AspectRatio)}
                            className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || isImageEditing}
                        >
                            {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                        </select>
                         {isImageEditing && <p className="text-xs text-gray-500 mt-1">Original aspect ratio will be used.</p>}
                    </div>
                    <div className="flex flex-col">
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim() || isLimitReached}
                            className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                        >
                            {isLoading ? (
                               <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spinner-rotate"></div>
                            ) : 'Generate'}
                        </button>
                         {isLimitReached && (
                            <p className="text-xs text-red-400 mt-1 text-center">Generation limit reached.</p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PromptControls;
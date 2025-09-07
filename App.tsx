
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PromptControls from './components/PromptControls';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ImageCard from './components/ImageCard';
import Sidebar from './components/Sidebar';
import ImagePreviewModal from './components/ImagePreviewModal';
import SubscriptionManager from './components/SubscriptionManager';
import { generateImages, generateFromImageAndPrompt } from './services/geminiService';
import type { ImageConfig, HistoryItem, UploadedImage } from './types';

const FREE_GENERATION_LIMIT = 5;

const App: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    
    const [generationLimit, setGenerationLimit] = useState<number>(() => {
        try {
            const savedLimit = localStorage.getItem('generationLimit');
            if (savedLimit === 'Infinity') return Infinity;
            return savedLimit ? parseInt(savedLimit, 10) : FREE_GENERATION_LIMIT;
        } catch (e) {
            console.error("Failed to parse generation limit from localStorage", e);
            return FREE_GENERATION_LIMIT;
        }
    });

    const [generationCount, setGenerationCount] = useState<number>(() => {
        try {
            const savedCount = localStorage.getItem('generationCount');
            return savedCount ? parseInt(savedCount, 10) : 0;
        } catch (e) {
            console.error("Failed to parse generation count from localStorage", e);
            return 0;
        }
    });
    
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('image-gen-history');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.error("Failed to parse history from localStorage", e);
            return [];
        }
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    useEffect(() => {
        try {
            localStorage.setItem('image-gen-history', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);

    useEffect(() => {
        try {
            localStorage.setItem('generationLimit', String(generationLimit));
        } catch (e) {
            console.error("Failed to save generation limit to localStorage", e);
        }
    }, [generationLimit]);

    useEffect(() => {
        try {
            localStorage.setItem('generationCount', String(generationCount));
        } catch (e) {
            console.error("Failed to save generation count to localStorage", e);
        }
    }, [generationCount]);

    const handleGenerate = useCallback(async (currentPrompt: string, config: ImageConfig, image?: UploadedImage) => {
        if (!currentPrompt.trim()) return;

        if (generationCount >= generationLimit) {
            setError(`You have reached your generation limit of ${generationLimit}. Please enter a new coupon code to continue.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const generatedImageUrls = image
                ? await generateFromImageAndPrompt(currentPrompt, image)
                : await generateImages(currentPrompt, config);
            
            setImages(generatedImageUrls);
            
            setGenerationCount(prev => prev + 1);
            
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                prompt: currentPrompt,
                images: generatedImageUrls,
                config,
                timestamp: Date.now(),
                sourceImage: image ? `data:${image.mimeType};base64,${image.base64}` : undefined,
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [generationLimit, generationCount]);

    const handlePromptSelect = (item: HistoryItem) => {
        setPrompt(item.prompt);
        setImages([]); // Clear current results
        setError(null);
        if (item.sourceImage) {
            const [header, base64] = item.sourceImage.split(',');
            if (header && base64) {
                 const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
                 setUploadedImage({ base64, mimeType });
            } else {
                console.error("Invalid source image format in history item");
                setUploadedImage(null);
            }
        } else {
            setUploadedImage(null);
        }
    };
    
    const handleImageSelect = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const WelcomeMessage = () => (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-300">Welcome to the AI Image Generator</h2>
        <p className="mt-2 text-gray-400">Enter a prompt to create unique images, or upload an image to edit it.</p>
      </div>
    );

    const MenuButton = () => (
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-20 bg-gray-800/80 p-2 rounded-md text-white"
        aria-label="Open history sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-white">
            {selectedImage && <ImagePreviewModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
            
            <div className="flex">
                <Sidebar 
                    history={history}
                    onPromptSelect={handlePromptSelect}
                    onImageSelect={handleImageSelect}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                
                <div className="flex-1 min-w-0">
                    <Header />
                    <main className="container mx-auto p-4 md:p-8 relative">
                        <MenuButton />
                        <div className="max-w-4xl mx-auto">
                            <SubscriptionManager
                                generationLimit={generationLimit}
                                setGenerationLimit={setGenerationLimit}
                                generationCount={generationCount}
                            />
                            
                            <div className="mb-8">
                                {error && <ErrorDisplay message={error} />}
                                
                                {isLoading && (
                                    <div className="text-center p-8">
                                        <LoadingSpinner />
                                        <p className="mt-4 text-gray-400">Generating your masterpiece... please wait.</p>
                                    </div>
                                )}

                                {!isLoading && !error && images.length === 0 && <WelcomeMessage />}

                                {images.length > 0 && (
                                    <>
                                        <h2 className="text-2xl font-semibold mb-4 text-center">Latest Generation</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {images.map((src, index) => (
                                                <ImageCard key={index} src={src} onClick={() => handleImageSelect(src)} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <PromptControls 
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                prompt={prompt}
                                setPrompt={setPrompt}
                                uploadedImage={uploadedImage}
                                onImageUpload={setUploadedImage}
                                onImageRemove={() => setUploadedImage(null)}
                                generationLimit={generationLimit}
                                generationCount={generationCount}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;
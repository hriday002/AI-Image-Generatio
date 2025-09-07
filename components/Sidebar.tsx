import React from 'react';
import { HistoryItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  onPromptSelect: (item: HistoryItem) => void;
  onImageSelect: (imageUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onPromptSelect, onImageSelect, isOpen, onClose }) => {
  const allImages = history.flatMap(item => item.images);

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-800/90 backdrop-blur-lg border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:h-screen overflow-y-auto`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">History</h2>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white" aria-label="Close sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-purple-400 mb-2">Prompts</h3>
            {history.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {history.map(item => (
                  <li key={item.id}>
                    <button 
                      onClick={() => {
                        onPromptSelect(item);
                        onClose();
                      }} 
                      className="w-full text-left text-sm text-gray-300 p-2 rounded-md bg-gray-700/50 hover:bg-purple-900/50 transition-colors flex items-center justify-between"
                      title={item.prompt}
                    >
                      <span className="truncate">{item.prompt}</span>
                      {item.sourceImage && (
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 ml-2 text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Your recent prompts will appear here.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-purple-400 mb-2">Generated Images</h3>
            {allImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {allImages.map((src, index) => (
                  <button key={index} onClick={() => onImageSelect(src)} className="aspect-square bg-gray-700 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                    <img src={src} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Your generated images will appear here.</p>
            )}
          </div>
        </div>
      </aside>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const FullScreenPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activePanelId = useUIStore(state => state.activePanelId);
  const closeActivePanel = useUIStore(state => state.closeActivePanel);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeActivePanel();
      }
    };
    if (activePanelId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanelId, closeActivePanel]);

  // Don't render anything if no panel is active
  if (!activePanelId) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={closeActivePanel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-7xl h-[85vh] bg-black/90 border border-red-900/50 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/50 bg-red-900/10">
            <h2 className="text-xl font-mono text-white tracking-[0.2em] font-medium">
              // CLASSIFIED // {activePanelId.toUpperCase()}
            </h2>
            <button
              onClick={closeActivePanel}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

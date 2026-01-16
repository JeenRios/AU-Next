'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'confirm' | 'alert';

interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  confirm: (message: string, title?: string) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => {
    setModal(config);
  };

  const confirm = (message: string, title: string = 'Confirm Action'): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        },
      });
    });
  };

  const alert = (message: string, title: string = 'Notice'): Promise<void> => {
    return new Promise((resolve) => {
      setModal({
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setModal(null);
          resolve();
        },
      });
    });
  };

  return (
    <ModalContext.Provider value={{ showModal, confirm, alert }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={modal.onCancel}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modal.title}
              </h3>
            </div>
            
            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {modal.message}
              </p>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {modal.type === 'confirm' && modal.onCancel && (
                <button
                  onClick={modal.onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {modal.cancelText || 'Cancel'}
                </button>
              )}
              <button
                onClick={modal.onConfirm}
                className="px-4 py-2 text-white bg-gradient-to-r from-[#c9a227] to-[#f0d78c] rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {modal.confirmText || (modal.type === 'confirm' ? 'Confirm' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

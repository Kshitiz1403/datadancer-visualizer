import React from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  subtitle?: string;
}

const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, title, data, subtitle }) => {
  const [copied, setCopied] = React.useState(false);

  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Use React portal to render modal at document body level
  return createPortal(
    <div className="json-modal-backdrop" onClick={handleBackdropClick}>
      <div className="json-modal">
        <div className="json-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="json-modal-subtitle">{subtitle}</p>}
          </div>
          <div className="json-modal-actions">
            <button 
              className="json-modal-copy-btn"
              onClick={handleCopy}
              title="Copy JSON"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              className="json-modal-close-btn"
              onClick={onClose}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="json-modal-content">
          <pre className="json-display">{jsonString}</pre>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JsonModal; 
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isLoading = false,
}: ConfirmationModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-200 ${
          animating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-gold">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-full bg-destructive/10 flex-shrink-0">
              <AlertTriangle size={18} className="text-destructive" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-sans">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                  Deleting…
                </span>
              ) : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

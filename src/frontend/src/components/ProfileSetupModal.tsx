import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ isOpen, onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile({ name: name.trim(), bio: undefined, avatarUrl: undefined });
      toast.success('Profile created!');
      onComplete();
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ${
          animating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
      >
        <div className="bg-card border border-gold/30 rounded-xl p-8 w-full max-w-md shadow-gold-lg">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-gold/10 border border-gold/20">
              <User size={24} className="text-gold" />
            </div>
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-foreground">Welcome!</h2>
              <p className="text-sm text-muted-foreground mt-1 font-sans">
                Please enter your name to get started.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Your Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="w-full bg-gold text-navy hover:bg-gold-light font-semibold"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-navy border-t-transparent rounded-full" />
                  Saving…
                </span>
              ) : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

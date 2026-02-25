import { useState, useRef } from 'react';
import { ImageIcon, Upload, Save, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetHeroImage, useUpdateHeroImage } from '../hooks/useQueries';

export default function HeroImageSettings() {
  const { data: currentHeroUrl = '', isLoading } = useGetHeroImage();
  const updateHeroImage = useUpdateHeroImage();

  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync input with fetched value when loaded (only once)
  const [synced, setSynced] = useState(false);
  if (!isLoading && !synced && currentHeroUrl) {
    setUrlInput(currentHeroUrl);
    setSynced(true);
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveUrl = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updateHeroImage.mutateAsync(urlInput.trim());
      showSuccess('Hero image updated successfully!');
    } catch {
      setErrorMsg('Failed to update hero image. Make sure you have admin access.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMsg('');
    setErrorMsg('');
    setIsUploading(true);

    try {
      // Convert file to a data URL so it can be stored as a URL string
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      setUrlInput(dataUrl);
      await updateHeroImage.mutateAsync(dataUrl);
      showSuccess('Hero image uploaded and saved!');
    } catch {
      setErrorMsg('Upload failed. Please try entering a URL instead.');
    } finally {
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewUrl = urlInput.trim() || currentHeroUrl;
  const isBusy = updateHeroImage.isPending || isUploading;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <ImageIcon size={18} className="text-gold" />
        <h3 className="font-serif text-lg font-semibold text-foreground">Hero Image</h3>
      </div>

      {/* Preview */}
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border bg-charcoal"
        style={{ height: '160px' }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Hero preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/40 to-navy/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-foreground drop-shadow-lg opacity-80">
                Preview
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon size={32} className="opacity-30" />
            <span className="text-xs font-sans">No hero image set</span>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="hero-url" className="text-sm font-sans text-muted-foreground">
          Image URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="hero-url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/hero-image.jpg"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground font-sans text-sm flex-1"
          />
          <Button
            onClick={handleSaveUrl}
            disabled={isBusy || !urlInput.trim()}
            className="bg-gold text-navy hover:bg-gold-light font-semibold font-sans shrink-0"
          >
            {updateHeroImage.isPending && !isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={15} className="mr-1.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-sans text-muted-foreground">
          Or upload an image file
        </Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="hero-file-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="border-border text-muted-foreground hover:border-gold/40 hover:text-gold font-sans text-sm"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={14} className="mr-1.5" />
                Choose File
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-400 font-sans animate-in fade-in duration-200">
          <CheckCircle2 size={15} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-destructive font-sans animate-in fade-in duration-200">
          <AlertCircle size={15} />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg('')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground font-sans">
        The hero image appears at the top of the public landing page with a dark overlay for text legibility.
      </p>
    </div>
  );
}

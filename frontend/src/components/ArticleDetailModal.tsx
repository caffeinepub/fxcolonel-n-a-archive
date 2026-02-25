import { useEffect, useRef, useState } from 'react';
import { X, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Article } from '../backend';
import { formatDate } from '../utils/formatters';

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

interface ModalContentProps {
  article: Article;
  publishedDate: string;
  sanitizedHtml: string;
}

function ModalContent({ article, publishedDate, sanitizedHtml }: ModalContentProps) {
  // coverImageUrl is ExternalBlob | undefined — get the direct URL string if present
  const coverSrc = article.coverImageUrl ? article.coverImageUrl.getDirectURL() : null;

  return (
    <div>
      {/* Cover image */}
      {coverSrc && (
        <div className="rounded-lg overflow-hidden mb-5 h-52 sm:h-64">
          <img
            src={coverSrc}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Keywords */}
      {article.seoKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.seoKeywords.map(kw => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15"
            >
              <Tag className="w-2.5 h-2.5" />
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3">
        {article.title}
      </h2>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-5 pb-4 border-b border-border/40">
        {article.author && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {article.author}
          </span>
        )}
        {publishedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {publishedDate}
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className="article-prose text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}

export default function ArticleDetailModal({ article, isOpen, onClose }: ArticleDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = 'hidden';
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleTouchEnd = () => {
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 100) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
  };

  if (!visible || !article) return null;

  const publishedDate = article.publishedAt ? formatDate(article.publishedAt) : '';
  const sanitizedHtml = sanitizeHtml(article.body.rawHtml);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Mobile: Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`absolute inset-x-0 bottom-0 md:hidden transition-transform duration-300 ease-out ${
          animating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ willChange: 'transform' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-card rounded-t-2xl border-t border-border max-h-[92vh] flex flex-col overflow-hidden">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Close Button */}
          <div className="flex justify-end px-4 pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-4 pb-8">
            <ModalContent
              article={article}
              publishedDate={publishedDate}
              sanitizedHtml={sanitizedHtml}
            />
          </div>
        </div>
      </div>

      {/* Desktop/Tablet: Centered Popup */}
      <div
        className={`absolute inset-0 hidden md:flex items-center justify-center p-4 lg:p-8 transition-all duration-300 ${
          animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-gold">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              {publishedDate}
              {article.author && (
                <>
                  <span className="mx-1">·</span>
                  <User size={14} />
                  {article.author}
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <ModalContent
              article={article}
              publishedDate={publishedDate}
              sanitizedHtml={sanitizedHtml}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

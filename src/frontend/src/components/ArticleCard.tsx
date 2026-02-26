import React from 'react';
import { Article, ArticleStatus } from '../backend';
import { formatDate, truncateText, stripHtml } from '../utils/formatters';
import { Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  article: Article;
  index?: number;
  onClick?: () => void;
  showDraftBadge?: boolean;
}

export default function ArticleCard({ article, index = 0, onClick, showDraftBadge = false }: ArticleCardProps) {
  const isDraft = article.status === ArticleStatus.draft;
  const excerpt = truncateText(stripHtml(article.body.rawHtml), 120);
  const delay = Math.min(index * 80, 500);

  // coverImageUrl is ExternalBlob | undefined — get the direct URL string if present
  const coverSrc = article.coverImageUrl ? article.coverImageUrl.getDirectURL() : null;

  return (
    <article
      onClick={onClick}
      className={`
        group relative flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden
        cursor-pointer transition-all
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
        animate-in fade-in
        ${isDraft ? 'opacity-80 hover:opacity-100' : ''}
      `}
      style={{ animationDelay: `${delay}ms`, animationDuration: '500ms' }}
    >
      {/* Cover Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-secondary/50 shrink-0">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
            <span className="font-serif text-3xl text-muted-foreground/30 font-bold">
              {article.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Draft badge overlay */}
        {(isDraft || showDraftBadge) && (
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="outline"
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border-warning/70 text-warning bg-background/80 backdrop-blur-sm"
            >
              Draft
            </Badge>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Keywords */}
        {article.seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.seoKeywords.slice(0, 3).map(kw => (
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
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 mb-3">
            {excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70 mt-auto pt-3 border-t border-border/30">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {article.author}
            </span>
          )}
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

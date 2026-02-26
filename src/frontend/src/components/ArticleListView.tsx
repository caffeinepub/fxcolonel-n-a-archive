import React, { useState } from "react";
import { Article, ArticleStatus } from "../backend";
import { formatDate } from "../utils/formatters";
import { useTogglePublishArticle, useDeleteArticle } from "../hooks/useQueries";
import { Edit2, Trash2, Eye, EyeOff, Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";

interface ArticleListViewProps {
  articles: Article[];
  onEdit: (article: Article) => void;
}

export default function ArticleListView({ articles, onEdit }: ArticleListViewProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [publishingId, setPublishingId] = useState<bigint | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const togglePublish = useTogglePublishArticle();
  const deleteArticle = useDeleteArticle();

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase())
  );

  const published = articles.filter((a) => a.status === ArticleStatus.published).length;
  const drafts = articles.filter((a) => a.status === ArticleStatus.draft).length;

  const showFeedback = (success: string | null, error: string | null) => {
    setActionSuccess(success);
    setActionError(error);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };

  const handlePublishToggle = async (article: Article) => {
    setPublishingId(article.id);
    setActionError(null);
    setActionSuccess(null);
    try {
      const newStatus =
        article.status === ArticleStatus.published
          ? ArticleStatus.draft
          : ArticleStatus.published;
      await togglePublish.mutateAsync({ id: article.id, newStatus });
      showFeedback(
        newStatus === ArticleStatus.published
          ? `"${article.title}" published successfully.`
          : `"${article.title}" moved to drafts.`,
        null
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showFeedback(null, `Failed to update status: ${message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: bigint, title: string) => {
    setDeletingId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteArticle.mutateAsync(id);
      showFeedback(`"${title}" deleted.`, null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showFeedback(null, `Failed to delete: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          Total: <span className="text-foreground font-medium">{articles.length}</span>
        </span>
        <span className="text-muted-foreground">
          Published:{" "}
          <span className="text-success font-medium">{published}</span>
        </span>
        <span className="text-muted-foreground">
          Drafts:{" "}
          <span className="text-gold font-medium">{drafts}</span>
        </span>
      </div>

      {/* Feedback messages */}
      {actionSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-success/10 border border-success/30 text-success text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles…"
          className="w-full pl-9 pr-4 py-2 rounded bg-navy text-foreground border border-[oklch(0.38_0.05_255)] placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {search ? "No articles match your search." : "No articles yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((article) => {
            const isPublished = article.status === ArticleStatus.published;
            const isDeleting = deletingId === article.id;
            const isPublishing = publishingId === article.id;

            return (
              <div
                key={String(article.id)}
                className="flex items-start sm:items-center justify-between gap-3 p-3 rounded border border-border bg-card hover:border-gold/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isPublished
                          ? "bg-success/20 text-success"
                          : "bg-gold/20 text-gold"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {article.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {article.author} · {formatDate(article.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(article)}
                    disabled={isDeleting || isPublishing}
                    className="p-1.5 rounded text-muted-foreground hover:text-gold hover:bg-accent transition-colors disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePublishToggle(article)}
                    disabled={isDeleting || isPublishing}
                    className="p-1.5 rounded text-muted-foreground hover:text-gold hover:bg-accent transition-colors disabled:opacity-50"
                    title={isPublished ? "Unpublish" : "Publish"}
                  >
                    {isPublishing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={isDeleting || isPublishing}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

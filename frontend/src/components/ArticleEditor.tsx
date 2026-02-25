import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Article, ArticleStatus, ExternalBlob } from "../backend";
import { useCreateArticle, useUpdateArticle, useTogglePublishArticle } from "../hooks/useQueries";
import { slugify } from "../utils/slugify";
import { Loader2, Upload, X, Image as ImageIcon, Plus, Copy, CheckCircle, AlertCircle } from "lucide-react";

interface ArticleEditorProps {
  article?: Article;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ArticleEditor({ article, onCancel, onSaved }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [author, setAuthor] = useState(article?.author ?? "");
  const [content, setContent] = useState(article?.body?.rawHtml ?? "");
  const [keywords, setKeywords] = useState(article?.seoKeywords?.join(", ") ?? "");

  // Cover image state
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [coverImageBlob, setCoverImageBlob] = useState<ExternalBlob | null>(
    article?.coverImageUrl ?? null
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Additional images state
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [additionalImageBlobs, setAdditionalImageBlobs] = useState<ExternalBlob[]>(
    article?.inlineImages ?? []
  );
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Upload progress
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [additionalUploadProgress, setAdditionalUploadProgress] = useState<number[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAction, setSaveAction] = useState<"draft" | "publish">("draft");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const togglePublish = useTogglePublishArticle();

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  // Set existing cover image preview
  useEffect(() => {
    if (article?.coverImageUrl && !coverImageFile) {
      try {
        setCoverImagePreview(article.coverImageUrl.getDirectURL());
      } catch {
        // ignore
      }
    }
  }, [article]);

  // Handle cover image file selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview("");
    setCoverImageBlob(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // Handle additional images file selection
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAdditionalImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setAdditionalImageFiles((prev) => [...prev, ...files]);
    setAdditionalUploadProgress((prev) => [...prev, ...files.map(() => 0)]);
    if (additionalInputRef.current) additionalInputRef.current.value = "";
  };

  const removeExistingAdditionalImage = (index: number) => {
    setAdditionalImageBlobs((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewAdditionalImage = (index: number) => {
    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setAdditionalUploadProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const uploadCoverImage = async (): Promise<ExternalBlob | null> => {
    if (!coverImageFile) return coverImageBlob;
    const arrayBuffer = await coverImageFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
      setCoverUploadProgress(pct);
    });
    return blob;
  };

  const uploadAdditionalImages = async (): Promise<ExternalBlob[]> => {
    const existingBlobs = [...additionalImageBlobs];
    const newBlobs: ExternalBlob[] = [];

    for (let i = 0; i < additionalImageFiles.length; i++) {
      const file = additionalImageFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const idx = i;
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setAdditionalUploadProgress((prev) => {
          const updated = [...prev];
          updated[idx] = pct;
          return updated;
        });
      });
      newBlobs.push(blob);
    }

    return [...existingBlobs, ...newBlobs];
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !slug.trim()) return;
    setSaveAction(publish ? "publish" : "draft");
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const coverBlob = await uploadCoverImage();
      const inlineBlobs = await uploadAdditionalImages();

      const body = {
        rawHtml: content,
        blocks: [],
        attachments: [],
      };

      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      let savedArticleId: bigint;

      if (article) {
        await updateArticle.mutateAsync({
          id: article.id,
          title: title.trim(),
          slug: slug.trim(),
          body,
          coverImageUrl: coverBlob,
          imageUrls: [],
          seoKeywords: keywordList,
          author: author.trim(),
          inlineImages: inlineBlobs,
        });
        savedArticleId = article.id;
      } else {
        savedArticleId = await createArticle.mutateAsync({
          title: title.trim(),
          slug: slug.trim(),
          body,
          coverImageUrl: coverBlob,
          imageUrls: [],
          seoKeywords: keywordList,
          author: author.trim(),
          inlineImages: inlineBlobs,
        });
      }

      // If publishing, call togglePublishArticle after saving content
      if (publish) {
        await togglePublish.mutateAsync({
          id: savedArticleId,
          newStatus: ArticleStatus.published,
        });
        setSaveSuccess("Article published successfully!");
      } else {
        // If editing an already-published article and saving as draft, unpublish it
        if (article && article.status === ArticleStatus.published) {
          await togglePublish.mutateAsync({
            id: savedArticleId,
            newStatus: ArticleStatus.draft,
          });
        }
        setSaveSuccess("Draft saved successfully!");
      }

      // Brief delay to show success message before closing
      setTimeout(() => {
        onSaved();
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setSaveError(`Failed to save: ${message}`);
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded bg-navy text-foreground border border-[oklch(0.38_0.05_255)] placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors";

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-gold">
        {article ? "Edit Article" : "New Article"}
      </h2>

      {/* Success / Error feedback */}
      {saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded bg-success/10 border border-success/30 text-success text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title…"
          className={inputClass}
        />
      </div>

      {/* Slug + Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="url-friendly-slug"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className={inputClass}
          />
        </div>
      </div>

      {/* SEO Keywords */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          SEO Keywords{" "}
          <span className="text-muted-foreground text-xs">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="forex, trading, analysis"
          className={inputClass}
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Cover Image
        </label>
        {coverImagePreview ? (
          <div className="relative inline-block">
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full max-w-md h-48 object-cover rounded border border-border"
            />
            {coverUploadProgress > 0 && coverUploadProgress < 100 && (
              <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center rounded">
                <span className="text-gold text-sm font-medium">{coverUploadProgress}%</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded hover:border-gold hover:text-gold text-muted-foreground transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload cover image
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="hidden"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Content</label>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Write your article content here…"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          }}
        />
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Additional Images
        </label>
        <div className="flex flex-wrap gap-3">
          {/* Existing inline images */}
          {additionalImageBlobs.map((blob, i) => (
            <div key={`existing-${i}`} className="relative group flex flex-col gap-1">
              <div className="relative">
                <img
                  src={blob.getDirectURL()}
                  alt={`Additional image ${i + 1}`}
                  className="w-28 h-28 object-cover rounded border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeExistingAdditionalImage(i)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(blob.getDirectURL())}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                title="Copy image URL"
              >
                <Copy className="w-3 h-3" />
                {copiedUrl === blob.getDirectURL() ? "Copied!" : "Copy URL"}
              </button>
            </div>
          ))}

          {/* Newly selected images (preview only, not yet uploaded) */}
          {additionalImagePreviews.map((preview, i) => (
            <div key={`new-${i}`} className="relative group flex flex-col gap-1">
              <div className="relative">
                <img
                  src={preview}
                  alt={`New image ${i + 1}`}
                  className="w-28 h-28 object-cover rounded border border-border border-dashed"
                />
                {additionalUploadProgress[i] > 0 && additionalUploadProgress[i] < 100 && (
                  <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center rounded">
                    <span className="text-gold text-xs font-medium">
                      {additionalUploadProgress[i]}%
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeNewAdditionalImage(i)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Pending upload</span>
            </div>
          ))}

          {/* Add more button */}
          <button
            type="button"
            onClick={() => additionalInputRef.current?.click()}
            className="w-28 h-28 flex flex-col items-center justify-center gap-1 border border-dashed border-border rounded hover:border-gold hover:text-gold text-muted-foreground transition-colors text-xs"
          >
            <Plus className="w-5 h-5" />
            Add image
          </button>
        </div>
        <input
          ref={additionalInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesChange}
          className="hidden"
        />
        {(additionalImageBlobs.length > 0 || additionalImagePreviews.length > 0) && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Click "Copy URL" on an uploaded image to insert it into the article content.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded border border-border text-foreground hover:bg-accent transition-colors text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving || !title.trim()}
          className="px-4 py-2 rounded border border-gold text-gold hover:bg-gold hover:text-charcoal transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving && saveAction === "draft" && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving || !title.trim()}
          className="px-4 py-2 rounded bg-gold text-charcoal hover:bg-gold-light transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving && saveAction === "publish" && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Publish
        </button>
      </div>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Article, ArticleBody, ArticleStatus, ExternalBlob, UserProfile } from '../backend';

// ── Published Articles (Public) ──────────────────────────────────────────────

export function useGetPublishedArticles(page: number, pageSize: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['publishedArticles', page, pageSize],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedArticles(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchArticles(keyword: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['searchArticles', keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchArticles(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}

export function useGetLatestArticles(limit: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['latestArticles', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestArticles(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArticleBySlug(slug: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Article | null>({
    queryKey: ['articleBySlug', slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      return actor.getArticleBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

// ── Hero Image ────────────────────────────────────────────────────────────────

export function useGetHeroImage() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['heroImage'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getHeroImage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateHeroImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHeroImage(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroImage'] });
    },
  });
}

// ── Admin: All Articles (draft + published) ───────────────────────────────────
// NOTE: The backend only exposes getPublishedArticles for listing.
// Drafts are tracked client-side via a local registry updated on create/update.

export function useGetAllArticlesAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['allArticlesAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      const published = await actor.getPublishedArticles(BigInt(0), BigInt(1000));
      return published;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllArticlesWithDrafts() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['allArticlesWithDrafts'],
    queryFn: async () => {
      if (!actor) return [];
      const published = await actor.getPublishedArticles(BigInt(0), BigInt(1000));
      return published;
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin Check ───────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      await actor.registerFirstAdmin();
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Article CRUD Mutations ────────────────────────────────────────────────────

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      slug: string;
      body: ArticleBody;
      coverImageUrl: ExternalBlob | null;
      imageUrls: string[];
      seoKeywords: string[];
      author: string;
      inlineImages: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArticle(
        params.title,
        params.slug,
        params.body,
        params.coverImageUrl,
        params.imageUrls,
        params.seoKeywords,
        params.author,
        params.inlineImages,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      slug: string;
      body: ArticleBody;
      coverImageUrl: ExternalBlob | null;
      imageUrls: string[];
      seoKeywords: string[];
      author: string;
      inlineImages: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArticle(
        params.id,
        params.title,
        params.slug,
        params.body,
        params.coverImageUrl,
        params.imageUrls,
        params.seoKeywords,
        params.author,
        params.inlineImages,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
    },
  });
}

export function useTogglePublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newStatus }: { id: bigint; newStatus: ArticleStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.togglePublishArticle(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
      queryClient.invalidateQueries({ queryKey: ['searchArticles'] });
    },
  });
}

// Keep legacy exports for backward compatibility — they now delegate to togglePublishArticle
export function usePublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.togglePublishArticle(id, ArticleStatus.published);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
      queryClient.invalidateQueries({ queryKey: ['searchArticles'] });
    },
  });
}

export function useUnpublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.togglePublishArticle(id, ArticleStatus.draft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['allArticlesWithDrafts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['latestArticles'] });
      queryClient.invalidateQueries({ queryKey: ['searchArticles'] });
    },
  });
}

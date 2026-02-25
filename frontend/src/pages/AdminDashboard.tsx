import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetAllArticlesAdmin,
  useGetCallerUserProfile,
  usePublishArticle,
} from '../hooks/useQueries';
import { Article, ArticleStatus } from '../backend';
import ArticleListView from '../components/ArticleListView';
import ArticleEditor from '../components/ArticleEditor';
import HeroImageSettings from '../components/HeroImageSettings';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { LayoutDashboard, FileText, Image, LogOut, ChevronDown, ChevronUp, BarChart2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type DashboardView = 'list' | 'editor';

export default function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: articles = [], isLoading: articlesLoading } = useGetAllArticlesAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const [view, setView] = useState<DashboardView>('list');
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [heroOpen, setHeroOpen] = useState(false);

  const publishArticle = usePublishArticle();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Loading state
  if (!isAuthenticated || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">
            {!isAuthenticated ? 'Please log in to access the dashboard.' : 'Verifying access…'}
          </p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You don't have admin privileges to access this dashboard.
          </p>
          <button
            onClick={async () => { await clear(); queryClient.clear(); }}
            className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setView('editor');
  };

  const handleCreate = () => {
    setEditingArticle(undefined);
    setView('editor');
  };

  const handleEditorSaved = () => {
    setView('list');
    setEditingArticle(undefined);
  };

  const publishedCount = articles.filter(a => a.status === ArticleStatus.published).length;
  const draftCount = articles.filter(a => a.status === ArticleStatus.draft).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Setup Modal */}
      <ProfileSetupModal
        isOpen={showProfileSetup}
        onComplete={() => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })}
      />

      {/* Dashboard Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <LayoutDashboard className="w-5 h-5 text-primary shrink-0" />
              <h1 className="font-serif text-base sm:text-lg font-bold text-foreground">
                <span className="hidden sm:inline">Admin </span>Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {view === 'editor' && (
                <button
                  onClick={() => { setView('list'); setEditingArticle(undefined); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Articles</span>
                </button>
              )}
              <button
                onClick={async () => { await clear(); queryClient.clear(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-destructive border border-border/50 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card border border-border/40 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground font-serif">{articles.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Articles</p>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Live</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground font-serif">{publishedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Published</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-card border border-border/40 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground font-serif">{draftCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Drafts</p>
          </div>
        </div>

        {/* Hero Image Settings */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <button
            onClick={() => setHeroOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Image className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm sm:text-base text-foreground">Hero Image Settings</span>
            </div>
            {heroOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {heroOpen && (
            <div className="px-4 sm:px-6 pb-6 border-t border-border/30">
              <div className="pt-4">
                <HeroImageSettings />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          {view === 'list' ? (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">Articles</h2>
                </div>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </button>
              </div>
              {articlesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ArticleListView
                  articles={articles}
                  onEdit={handleEdit}
                />
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <ArticleEditor
                article={editingArticle}
                onCancel={() => { setView('list'); setEditingArticle(undefined); }}
                onSaved={handleEditorSaved}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Code2, Terminal, Globe, Lock, BookOpen, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-navy text-sm">
        <code className="text-foreground/90 font-mono text-xs leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="text-gold">{icon}</span>
        <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EndpointCard({
  method,
  name,
  params,
  returns,
  description,
  example,
}: {
  method: 'query' | 'update';
  name: string;
  params: string;
  returns: string;
  description: string;
  example?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3 flex-wrap">
        <Badge
          variant="outline"
          className={`text-xs font-mono flex-shrink-0 ${
            method === 'query'
              ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
              : 'border-orange-500/40 text-orange-400 bg-orange-500/10'
          }`}
        >
          {method.toUpperCase()}
        </Badge>
        <code className="font-mono text-sm text-gold font-semibold">{name}</code>
      </div>
      <p className="text-sm text-muted-foreground font-sans">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-charcoal rounded p-2">
          <span className="text-muted-foreground">params: </span>
          <span className="text-foreground/80">{params}</span>
        </div>
        <div className="bg-charcoal rounded p-2">
          <span className="text-muted-foreground">returns: </span>
          <span className="text-foreground/80">{returns}</span>
        </div>
      </div>
      {example && <CodeBlock code={example} language="typescript" />}
    </div>
  );
}

export default function ApiReferencePage() {
  const agentExample = `import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./declarations/backend";

const agent = new HttpAgent({ host: "https://ic0.app" });
const canisterId = "YOUR_CANISTER_ID";

const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

// Fetch latest 10 articles
const articles = await backend.getLatestArticles(10n);

// Fetch paginated articles (page 0, 9 per page)
const page = await backend.getPublishedArticles(0n, 9n);

// Get article by slug
const article = await backend.getArticleBySlug("my-article-slug");

// Search articles
const results = await backend.searchArticles("forex");`;

  const httpExample = `// HTTP Query Interface (via IC HTTP Gateway)
// GET https://<canister-id>.raw.ic0.app/api/articles
// GET https://<canister-id>.raw.ic0.app/api/articles/<slug>

// Example using fetch:
const response = await fetch(
  "https://<canister-id>.raw.ic0.app/api/articles"
);
const articles = await response.json();`;

  const articleType = `type Article = {
  id: bigint;
  title: string;
  slug: string;
  body: {
    rawHtml: string;
    blocks: Block[];
    attachments: Attachment[];
  };
  coverImageUrl: string;
  imageUrls: string[];
  seoKeywords: string[];
  author: string;
  publishedAt?: bigint; // nanoseconds since epoch
  updatedAt: bigint;    // nanoseconds since epoch
  status: "published" | "draft";
};`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-3">
          <Code2 size={28} className="text-gold" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            API Reference
          </h1>
        </div>
        <p className="text-muted-foreground font-sans leading-relaxed">
          FxColonel N/A Archive exposes a public Candid interface on the Internet Computer.
          External applications can query articles without authentication using the IC agent or HTTP gateway.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10 text-xs">
            No Auth Required for Reads
          </Badge>
          <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 text-xs">
            Internet Computer
          </Badge>
          <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-xs">
            Candid Interface
          </Badge>
        </div>
      </div>

      {/* Public Endpoints */}
      <Section title="Public Query Endpoints" icon={<Globe size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          All query endpoints are publicly accessible without authentication. They use the anonymous principal.
        </p>
        <div className="space-y-4">
          <EndpointCard
            method="query"
            name="getPublishedArticles"
            params="page: bigint, pageSize: bigint"
            returns="Article[]"
            description="Returns a paginated list of published articles. Use page=0 for the first page."
            example={`const articles = await backend.getPublishedArticles(0n, 9n);`}
          />
          <EndpointCard
            method="query"
            name="getLatestArticles"
            params="limit: bigint"
            returns="Article[]"
            description="Returns the most recently published articles, sorted by publish date descending."
            example={`const latest = await backend.getLatestArticles(5n);`}
          />
          <EndpointCard
            method="query"
            name="getArticleBySlug"
            params="slug: string"
            returns="Article | null"
            description="Returns a single published article matching the given URL slug, or null if not found."
            example={`const article = await backend.getArticleBySlug("my-article-slug");`}
          />
          <EndpointCard
            method="query"
            name="getArticleById"
            params="id: bigint"
            returns="Article | null"
            description="Returns a single published article by its numeric ID, or null if not found."
            example={`const article = await backend.getArticleById(1n);`}
          />
          <EndpointCard
            method="query"
            name="searchArticles"
            params="keyword: string"
            returns="Article[]"
            description="Full-text search across article titles, body HTML, and SEO keywords. Returns matching published articles."
            example={`const results = await backend.searchArticles("forex strategy");`}
          />
        </div>
      </Section>

      {/* Admin Endpoints */}
      <Section title="Admin-Only Endpoints" icon={<Lock size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          These endpoints require the caller to be the admin principal (first authenticated user).
          They will trap with an authorization error for non-admin callers.
        </p>
        <div className="space-y-4">
          <EndpointCard
            method="update"
            name="createArticle"
            params="title, slug, body, coverImageUrl, imageUrls, seoKeywords, author"
            returns="bigint (article ID)"
            description="Creates a new article as a draft. Returns the new article's ID."
          />
          <EndpointCard
            method="update"
            name="updateArticle"
            params="id, title, slug, body, coverImageUrl, imageUrls, seoKeywords, author"
            returns="void"
            description="Updates an existing article's content and metadata."
          />
          <EndpointCard
            method="update"
            name="publishArticle"
            params="id: bigint"
            returns="void"
            description="Sets an article's status to published and records the publish timestamp."
          />
          <EndpointCard
            method="update"
            name="unpublishArticle"
            params="id: bigint"
            returns="void"
            description="Reverts an article to draft status."
          />
          <EndpointCard
            method="update"
            name="deleteArticle"
            params="id: bigint"
            returns="void"
            description="Permanently deletes an article."
          />
        </div>
      </Section>

      {/* Data Types */}
      <Section title="Data Types" icon={<BookOpen size={18} />}>
        <CodeBlock code={articleType} language="typescript" />
      </Section>

      {/* Integration Example */}
      <Section title="Integration Example (IC Agent)" icon={<Terminal size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          Use the <code className="text-gold font-mono text-xs">@dfinity/agent</code> package to query articles from any JavaScript/TypeScript application.
        </p>
        <CodeBlock code={agentExample} language="typescript" />
      </Section>

      {/* HTTP Gateway */}
      <Section title="HTTP Gateway" icon={<Globe size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          The canister exposes HTTP endpoints via the IC HTTP gateway for non-IC consumers.
          These endpoints return JSON-serialized article data.
        </p>
        <CodeBlock code={httpExample} language="javascript" />
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground font-sans">Available HTTP Routes</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs">GET</Badge>
              <code className="text-foreground/80">/api/articles</code>
              <span className="text-muted-foreground text-xs">→ JSON array of published articles</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs">GET</Badge>
              <code className="text-foreground/80">/api/articles/:slug</code>
              <span className="text-muted-foreground text-xs">→ Single article JSON or 404</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

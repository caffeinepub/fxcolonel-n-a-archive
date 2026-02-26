import { useState } from 'react';
import { Code2, Terminal, Globe, Lock, BookOpen, Copy, Check, User, Shield } from 'lucide-react';
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

// Get article by ID
const byId = await backend.getArticleById(1n);

// Search articles
const results = await backend.searchArticles("forex");

// Get hero image URL
const heroUrl = await backend.getHeroImage();`;

  const httpExample = `// HTTP Query Interface (via IC HTTP Gateway)
// GET https://<canister-id>.raw.ic0.app/api/articles
// GET https://<canister-id>.raw.ic0.app/api/articles/<slug>

// Example using fetch:
const response = await fetch(
  "https://<canister-id>.raw.ic0.app/api/articles"
);
const articles = await response.json();`;

  const articleType = `// Article status enum
enum ArticleStatus {
  published = "published",
  draft = "draft",
}

// User role enum
enum UserRole {
  admin = "admin",
  user = "user",
  guest = "guest",
}

// ExternalBlob — used for cover images and inline images
class ExternalBlob {
  getBytes(): Promise<Uint8Array>;
  getDirectURL(): string;
  static fromURL(url: string): ExternalBlob;
  static fromBytes(blob: Uint8Array): ExternalBlob;
  withUploadProgress(
    onProgress: (percentage: number) => void
  ): ExternalBlob;
}

type ArticleBody = {
  rawHtml: string;
  blocks: Block[];
  attachments: Attachment[];
};

type Block = {
  content: string;
  style: {
    color?: string;
    fontSize?: bigint;
    fontWeight?: string;
    background?: string;
  };
  layout?: {
    columns?: bigint;
    alignment?: string;
    padding?: bigint;
  };
  metadata?: {
    tag?: string;
    attributes?: string;
  };
};

type Attachment = {
  url: string;
  size: bigint;
  type: string;       // MIME type
  caption?: string;
};

type Article = {
  id: bigint;
  title: string;
  slug: string;
  body: ArticleBody;
  coverImageUrl?: ExternalBlob; // optional blob; call .getDirectURL() for <img src>
  inlineImages: ExternalBlob[]; // embedded images within the article body
  imageUrls: string[];
  seoKeywords: string[];
  author: string;
  publishedAt?: bigint;  // nanoseconds since epoch; undefined when draft
  updatedAt: bigint;     // nanoseconds since epoch
  status: ArticleStatus;
};

type UserProfile = {
  name: string;
  bio?: string;
  avatarUrl?: string;
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
          FX Colonel exposes a public Candid interface on the Internet Computer.
          External applications can query articles without authentication using the IC agent or HTTP gateway.
          Write operations require admin authentication via Internet Identity.
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
            description="Returns a paginated list of published articles. Use page=0n for the first page."
            example={`const articles = await backend.getPublishedArticles(0n, 9n);`}
          />
          <EndpointCard
            method="query"
            name="getLatestArticles"
            params="limit: bigint"
            returns="Article[]"
            description="Returns the most recently published articles up to the given limit, sorted by publish date descending."
            example={`const latest = await backend.getLatestArticles(5n);`}
          />
          <EndpointCard
            method="query"
            name="getArticleBySlug"
            params="slug: string"
            returns="Article | null"
            description="Returns a single published article matching the given URL slug, or null if not found or not published."
            example={`const article = await backend.getArticleBySlug("my-article-slug");`}
          />
          <EndpointCard
            method="query"
            name="getArticleById"
            params="id: bigint"
            returns="Article | null"
            description="Returns a single published article by its numeric ID, or null if not found or not published."
            example={`const article = await backend.getArticleById(1n);`}
          />
          <EndpointCard
            method="query"
            name="searchArticles"
            params="keyword: string"
            returns="Article[]"
            description="Full-text search across article titles, body HTML, and SEO keywords. Returns matching published articles only."
            example={`const results = await backend.searchArticles("forex strategy");`}
          />
          <EndpointCard
            method="query"
            name="getHeroImage"
            params="(none)"
            returns="string"
            description="Returns the current hero banner image URL. Returns an empty string if no hero image has been set."
            example={`const heroUrl = await backend.getHeroImage();`}
          />
        </div>
      </Section>

      {/* Admin Endpoints */}
      <Section title="Admin-Only Endpoints" icon={<Lock size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          These endpoints require the caller to be the registered admin principal (the first authenticated user to call{' '}
          <code className="text-gold font-mono text-xs">registerFirstAdmin</code>).
          Non-admin callers will receive an authorization trap error.
        </p>
        <div className="space-y-4">
          <EndpointCard
            method="update"
            name="createArticle"
            params="title: string, slug: string, body: ArticleBody, coverImageUrl: ExternalBlob | null, imageUrls: string[], seoKeywords: string[], author: string, inlineImages: ExternalBlob[]"
            returns="bigint (new article ID)"
            description="Creates a new article as a draft. Returns the newly assigned article ID. Pass null for coverImageUrl if no cover image."
            example={`const id = await backend.createArticle(
  "My Article",
  "my-article",
  { rawHtml: "<p>Hello</p>", blocks: [], attachments: [] },
  null,       // coverImageUrl
  [],         // imageUrls
  ["forex"],  // seoKeywords
  "FX Colonel",
  []          // inlineImages
);`}
          />
          <EndpointCard
            method="update"
            name="updateArticle"
            params="id: bigint, title: string, slug: string, body: ArticleBody, coverImageUrl: ExternalBlob | null, imageUrls: string[], seoKeywords: string[], author: string, inlineImages: ExternalBlob[]"
            returns="void"
            description="Updates an existing article's content and metadata. Preserves the article's current publish status and publishedAt timestamp."
          />
          <EndpointCard
            method="update"
            name="togglePublishArticle"
            params="id: bigint, newStatus: ArticleStatus"
            returns="void"
            description="Sets an article's status to either published or draft. When publishing, records the current timestamp as publishedAt. When unpublishing, clears publishedAt."
            example={`import { ArticleStatus } from "./declarations/backend";

// Publish an article
await backend.togglePublishArticle(1n, ArticleStatus.published);

// Unpublish (revert to draft)
await backend.togglePublishArticle(1n, ArticleStatus.draft);`}
          />
          <EndpointCard
            method="update"
            name="deleteArticle"
            params="id: bigint"
            returns="void"
            description="Permanently deletes an article by ID. Traps if the article does not exist."
            example={`await backend.deleteArticle(1n);`}
          />
          <EndpointCard
            method="update"
            name="updateHeroImage"
            params="url: string"
            returns="void"
            description="Sets the hero banner image URL displayed on the landing page. Pass an empty string to clear the hero image."
            example={`await backend.updateHeroImage("https://example.com/hero.jpg");`}
          />
        </div>
      </Section>

      {/* Auth & User Endpoints */}
      <Section title="Authentication & User Profile" icon={<User size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          These endpoints manage admin registration and user profiles. Authentication is performed via Internet Identity.
        </p>
        <div className="space-y-4">
          <EndpointCard
            method="update"
            name="registerFirstAdmin"
            params="(none)"
            returns="boolean"
            description="Registers the calling authenticated principal as admin if no admin exists yet. Returns true if the caller is now admin, false if the caller is anonymous or another admin is already registered."
            example={`const isAdmin = await backend.registerFirstAdmin();`}
          />
          <EndpointCard
            method="query"
            name="isCallerAdmin"
            params="(none)"
            returns="boolean"
            description="Returns true if the calling principal is the registered admin, false otherwise. Safe to call anonymously (returns false)."
            example={`const isAdmin = await backend.isCallerAdmin();`}
          />
          <EndpointCard
            method="query"
            name="getCallerUserRole"
            params="(none)"
            returns="UserRole"
            description="Returns the role of the calling principal: 'admin', 'user', or 'guest' (for anonymous callers)."
            example={`const role = await backend.getCallerUserRole();
// role === "admin" | "user" | "guest"`}
          />
          <EndpointCard
            method="update"
            name="assignCallerUserRole"
            params="user: Principal, role: UserRole"
            returns="void"
            description="Assigns a role to a given principal. Requires admin privileges."
          />
          <EndpointCard
            method="query"
            name="getCallerUserProfile"
            params="(none)"
            returns="UserProfile | null"
            description="Returns the profile for the calling authenticated user, or null if no profile has been saved yet. Requires the caller to have the 'user' role."
            example={`const profile = await backend.getCallerUserProfile();
if (profile) {
  console.log(profile.name, profile.bio);
}`}
          />
          <EndpointCard
            method="query"
            name="getUserProfile"
            params="user: Principal"
            returns="UserProfile | null"
            description="Returns the profile for a given principal. Callers may only view their own profile unless they are admin."
          />
          <EndpointCard
            method="update"
            name="saveCallerUserProfile"
            params="profile: UserProfile"
            returns="void"
            description="Saves or updates the profile for the calling authenticated user. Requires the caller to have the 'user' role."
            example={`await backend.saveCallerUserProfile({
  name: "FX Colonel",
  bio: "Forex analyst and trader.",
  avatarUrl: undefined,
});`}
          />
        </div>
      </Section>

      {/* Data Types */}
      <Section title="Data Types" icon={<BookOpen size={18} />}>
        <p className="text-sm text-muted-foreground font-sans">
          All types are defined in the generated{' '}
          <code className="text-gold font-mono text-xs">frontend/src/backend.d.ts</code> file.
          Import them directly rather than redefining.
        </p>
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

      {/* Notes */}
      <Section title="Notes & Gotchas" icon={<Shield size={18} />}>
        <div className="space-y-3 text-sm text-muted-foreground font-sans leading-relaxed">
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-foreground">ExternalBlob images</p>
            <p>
              <code className="text-gold font-mono text-xs">coverImageUrl</code> and entries in{' '}
              <code className="text-gold font-mono text-xs">inlineImages</code> are{' '}
              <code className="text-gold font-mono text-xs">ExternalBlob</code> instances, not plain strings.
              Call <code className="text-gold font-mono text-xs">.getDirectURL()</code> to get a usable URL for{' '}
              <code className="text-gold font-mono text-xs">&lt;img src&gt;</code>.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-foreground">Timestamps are nanoseconds</p>
            <p>
              <code className="text-gold font-mono text-xs">publishedAt</code> and{' '}
              <code className="text-gold font-mono text-xs">updatedAt</code> are{' '}
              <code className="text-gold font-mono text-xs">bigint</code> values in nanoseconds since the Unix epoch.
              Divide by <code className="text-gold font-mono text-xs">1_000_000n</code> to convert to milliseconds for{' '}
              <code className="text-gold font-mono text-xs">new Date()</code>.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-foreground">Admin bootstrap</p>
            <p>
              The first authenticated (non-anonymous) principal to call{' '}
              <code className="text-gold font-mono text-xs">registerFirstAdmin()</code> becomes the permanent admin.
              Subsequent calls by other principals are no-ops and return false.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

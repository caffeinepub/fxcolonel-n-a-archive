import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Article {
    id: bigint;
    status: ArticleStatus;
    coverImageUrl?: ExternalBlob;
    title: string;
    inlineImages: Array<ExternalBlob>;
    imageUrls: Array<string>;
    body: ArticleBody;
    slug: string;
    publishedAt?: Time;
    author: string;
    updatedAt: Time;
    seoKeywords: Array<string>;
}
export type Time = bigint;
export interface ArticleBody {
    rawHtml: string;
    blocks: Array<Block>;
    attachments: Array<Attachment>;
}
export interface Metadata {
    tag?: string;
    attributes?: string;
}
export interface Attachment {
    url: string;
    size: bigint;
    type: string;
    caption?: string;
}
export interface Style {
    background?: string;
    color?: string;
    fontWeight?: string;
    fontSize?: bigint;
}
export interface Block {
    content: string;
    metadata?: Metadata;
    layout?: Layout;
    style: Style;
}
export interface Layout {
    padding?: bigint;
    alignment?: string;
    columns?: bigint;
}
export interface UserProfile {
    bio?: string;
    name: string;
    avatarUrl?: string;
}
export enum ArticleStatus {
    published = "published",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArticle(title: string, slug: string, body: ArticleBody, coverImageUrl: ExternalBlob | null, imageUrls: Array<string>, seoKeywords: Array<string>, author: string, inlineImages: Array<ExternalBlob>): Promise<bigint>;
    deleteArticle(id: bigint): Promise<void>;
    getArticleById(id: bigint): Promise<Article | null>;
    getArticleBySlug(slug: string): Promise<Article | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHeroImage(): Promise<string>;
    getLatestArticles(limit: bigint): Promise<Array<Article>>;
    getPublishedArticles(page: bigint, pageSize: bigint): Promise<Array<Article>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerFirstAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchArticles(keyword: string): Promise<Array<Article>>;
    togglePublishArticle(id: bigint, newStatus: ArticleStatus): Promise<void>;
    updateArticle(id: bigint, title: string, slug: string, body: ArticleBody, coverImageUrl: ExternalBlob | null, imageUrls: Array<string>, seoKeywords: Array<string>, author: string, inlineImages: Array<ExternalBlob>): Promise<void>;
    updateHeroImage(url: string): Promise<void>;
}

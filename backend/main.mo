import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Order "mo:core/Order";

actor {
  type ArticleBody = {
    rawHtml : Text;
    blocks : [Block];
    attachments : [Attachment];
  };

  type Block = {
    content : Text;
    style : Style;
    layout : ?Layout;
    metadata : ?Metadata;
  };

  type Style = {
    color : ?Text;
    fontSize : ?Nat;
    fontWeight : ?Text;
    background : ?Text;
  };

  type Layout = {
    columns : ?Nat;
    alignment : ?Text;
    padding : ?Nat;
  };

  type Metadata = {
    tag : ?Text;
    attributes : ?Text;
  };

  type Attachment = {
    url : Text;
    type_ : Text;
    size : Nat;
    caption : ?Text;
  };

  public type Article = {
    id : Nat;
    title : Text;
    slug : Text;
    body : ArticleBody;
    coverImageUrl : ?Storage.ExternalBlob;
    imageUrls : [Text];
    seoKeywords : [Text];
    author : Text;
    publishedAt : ?Time.Time;
    updatedAt : Time.Time;
    status : ArticleStatus;
    inlineImages : [Storage.ExternalBlob];
  };

  public type ArticleStatus = {
    #draft;
    #published;
  };

  public type UserProfile = {
    name : Text;
    bio : ?Text;
    avatarUrl : ?Text;
  };

  module Article {
    public func compareByPublishedAt(a : Article, b : Article) : Order.Order {
      switch (a.publishedAt, b.publishedAt) {
        case (null, null) { #equal };
        case (?_, null) { #less };
        case (null, ?_) { #greater };
        case (?aTime, ?bTime) { Int.compare(aTime, bTime) };
      };
    };
  };

  let articles = Map.empty<Nat, Article>();
  var nextArticleId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── Blob Storage ─────────────────────────────────────────────────────────────
  include MixinStorage();

  // ── Access Control ───────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Persistent Admin State ───────────────────────────────────────────────────
  var adminId : ?Principal = null;
  var heroImageUrl : Text = "";

  // ── Role & Admin Helpers ─────────────────────────────────────────────────────

  // Read-only check: does NOT register the first caller as admin.
  func checkIsAdmin(caller : Principal) : Bool {
    switch (adminId) {
      case (null) { false };
      case (?id) { caller == id };
    };
  };

  // Update check: registers first non-anonymous caller as admin.
  func ensureAdminRegistered(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot become admin");
    };
    switch (adminId) {
      case (null) {
        adminId := ?caller;
      };
      case (?_) {};
    };
  };

  func requireAdmin(caller : Principal) {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // ── Bootstrap: first authenticated caller becomes admin ──────────────────────

  public shared ({ caller }) func registerFirstAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    ensureAdminRegistered(caller);
    checkIsAdmin(caller);
  };

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Article Management ───────────────────────────────────────────────────────

  public shared ({ caller }) func createArticle(
    title : Text,
    slug : Text,
    body : ArticleBody,
    coverImageUrl : ?Storage.ExternalBlob,
    imageUrls : [Text],
    seoKeywords : [Text],
    author : Text,
    inlineImages : [Storage.ExternalBlob],
  ) : async Nat {
    requireAdmin(caller);
    let articleId = nextArticleId;
    let article : Article = {
      id = articleId;
      title;
      slug;
      body;
      coverImageUrl;
      imageUrls;
      seoKeywords;
      author;
      inlineImages;
      publishedAt = null;
      updatedAt = Time.now();
      status = #draft;
    };
    articles.add(article.id, article);
    nextArticleId += 1;
    articleId;
  };

  public shared ({ caller }) func updateArticle(
    id : Nat,
    title : Text,
    slug : Text,
    body : ArticleBody,
    coverImageUrl : ?Storage.ExternalBlob,
    imageUrls : [Text],
    seoKeywords : [Text],
    author : Text,
    inlineImages : [Storage.ExternalBlob],
  ) : async () {
    requireAdmin(caller);
    let existing = switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
    let updated : Article = {
      id;
      title;
      slug;
      body;
      coverImageUrl;
      imageUrls;
      seoKeywords;
      author;
      publishedAt = existing.publishedAt;
      updatedAt = Time.now();
      status = existing.status;
      inlineImages;
    };
    articles.add(updated.id, updated);
  };

  public shared ({ caller }) func deleteArticle(id : Nat) : async () {
    requireAdmin(caller);
    if (not articles.containsKey(id)) {
      Runtime.trap("Article not found");
    };
    articles.remove(id);
  };

  public shared ({ caller }) func togglePublishArticle(
    id : Nat,
    newStatus : ArticleStatus,
  ) : async () {
    requireAdmin(caller);
    let article = switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
    let updated : Article = {
      id = article.id;
      title = article.title;
      slug = article.slug;
      body = article.body;
      coverImageUrl = article.coverImageUrl;
      imageUrls = article.imageUrls;
      seoKeywords = article.seoKeywords;
      author = article.author;
      publishedAt = if (newStatus == #published) {
        ?Time.now();
      } else {
        null;
      };
      updatedAt = Time.now();
      status = newStatus;
      inlineImages = article.inlineImages;
    };
    articles.add(updated.id, updated);
  };

  // ── Public Query Functions (No Auth) ─────────────────────────────────────────

  public query func getPublishedArticles(page : Nat, pageSize : Nat) : async [Article] {
    let filtered = articles.values().toArray().filter(
      func(article) { article.status == #published }
    );
    let start = page * pageSize;
    if (start >= filtered.size()) { return [] };
    let end = Nat.min(start + pageSize, filtered.size());
    filtered.sliceToArray(start, end);
  };

  public query func getArticleBySlug(slug : Text) : async ?Article {
    let found = articles.values().find(
      func(article) {
        article.status == #published and article.slug == slug
      }
    );
    found;
  };

  public query func getArticleById(id : Nat) : async ?Article {
    switch (articles.get(id)) {
      case (null) { null };
      case (?article) {
        if (article.status == #published) { ?article } else { null };
      };
    };
  };

  public query func searchArticles(keyword : Text) : async [Article] {
    let filtered = articles.values().toArray().filter(
      func(article) {
        article.status == #published and (
          article.title.contains(#text keyword)
          or article.body.rawHtml.contains(#text keyword)
          or article.seoKeywords.values().any(
            func(k) { k.contains(#text keyword) }
          )
        )
      }
    );
    filtered;
  };

  public query func getLatestArticles(limit : Nat) : async [Article] {
    let sorted = articles.values().toArray().filter(
      func(article) { article.status == #published }
    ).sort(Article.compareByPublishedAt);

    let size = sorted.size();
    if (size <= limit) { return sorted };
    sorted.sliceToArray(0, limit);
  };

  // ── Hero Image Management (Admin-only) ───────────────────────────────────────

  public shared ({ caller }) func updateHeroImage(url : Text) : async () {
    requireAdmin(caller);
    heroImageUrl := url;
  };

  public query func getHeroImage() : async Text {
    heroImageUrl;
  };
};

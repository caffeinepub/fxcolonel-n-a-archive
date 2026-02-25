# Specification

## Summary
**Goal:** Fix the publish action for articles and drafts so that publishing correctly persists the status change in the backend and updates the UI accordingly.

**Planned changes:**
- Fix the backend publish logic so that calling the publish action updates the article's status to published and persists it in stable storage, returning a success result.
- Fix the frontend publish mutation in ArticleListView and ArticleEditor to correctly call the backend publish endpoint, await the result, and invalidate/refetch the article list query.
- Ensure the draft badge is removed from the article card after publishing.
- Surface error states to the user if publishing fails.

**User-visible outcome:** Users can publish articles and drafts from both the article list and editor; the published status is immediately reflected in the UI without a page reload, and errors are shown if publishing fails.

# Lemurian Pages Article Contract

Generated articles should be published as static folders under `articles/<slug>/`.

Minimum files per article:

- `index.html`: copy from `articles/_template/index.html`.
- `article.json`: metadata and paths for the article.
- `body.html`: article content converted from Markdown.
- `content.md`: optional original Markdown.
- `outline.md`: optional generated outline.
- `images/`: optional generated images copied from Lemurian.

Update `articles/manifest.json` after publishing so `articles/index.html` can list the article.

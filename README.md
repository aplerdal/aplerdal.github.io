# Zola skeleton

    blog/
    ├── config.toml              site settings + feed config
    ├── content/
    │   ├── _index.md            home page
    │   └── posts/
    │       ├── _index.md        section: sorting, which template posts use
    │       └── *.md             one file per post
    ├── static/style.css         copied to the site root as-is
    └── templates/
        ├── base.html            <head>, navbar, container
        ├── index.html           home
        ├── section.html         /posts/ listing
        └── page.html            a single post

## Running it

    zola serve      # http://127.0.0.1:1111, live reloads on save
    zola build      # writes the whole site to public/

## New post

Create `content/posts/my-post.md`:

    +++
    title = "My post"
    date = 2026-09-01
    description = "Shows up in the feed and in <meta>."
    +++

    Body in markdown.

Nothing else to update — the listings and rss.xml regenerate.

## Before deploying

- Set `base_url` in config.toml to your real domain. Zola bakes absolute URLs
  into the feed at build time, so this must be right.
- Drop IBMVGA14.ttf / IBMVGA16.ttf into static/ if you still want those faces.
- Deploy the contents of public/.

Built and verified against Zola 0.19.2.

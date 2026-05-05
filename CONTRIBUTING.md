# Contributing

Thanks for improving Ruleloom Lab. This project is intentionally small, local-first, and education-focused.

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

## Pull Requests

- Keep changes focused on one behavior or documentation topic.
- Add or update tests before changing production code when behavior changes.
- Use English for code comments, commit messages, and issue templates.
- Keep `README.md`, `README-zh.md`, and `README-jp.md` synchronized in meaning.
- Do not add external services, analytics, or server dependencies without prior discussion.

## Commit Style

Use Conventional Commits when practical, for example:

```text
feat: add rule preset controls
fix: clamp shared width query values
docs: synchronize translated readmes
```

## Clean-Room Policy

Do not copy code, prose, artwork, or generated assets from other automata projects. Describe behavior in your own words and cite research only when the project starts adding deeper educational references.

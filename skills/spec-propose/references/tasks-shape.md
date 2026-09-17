# Tasks Shape

What step 5's rules buy you - the shape every `tasks.md` this skill writes must take.

```markdown
## 1. Data layer

- [ ] 1.1 Add the tag index
      files: site/lib/data.ts
      needs: none
- [ ] 1.2 Wire filtering into the catalog
      files: site/components/catalog.tsx
      needs: 1.1

## 2. UI

- [ ] 2.1 Add the tag chip component
      files: site/components/tag-chips.tsx
      needs: none
```

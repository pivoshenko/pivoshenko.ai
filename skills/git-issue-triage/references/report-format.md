# Report Format

The triage report's shape. Grouped by bucket, count in the heading, one line per issue, no prose between groups.

```
Unlabeled (4)
#42   catalog sort drops entries with no updated_at   ->  type: bug
#51   add rss feed to the site                        ->  type: enhancement
#58   kasetto sync skips unlisted mcps                ->  type: documentation
#63   pnpm audit noise on every ci run                ->  needs a human read

Unprioritized (2)
#42   catalog sort drops entries with no updated_at   ->  priority: high (data loss)
#51   add rss feed to the site                        ->  no signal, propose nothing

Stale (3)
#17   spike: alternate theme tokens                   ->  close, not planned
#23   revisit biome rule set                          ->  ping (11 comments)
#29   investigate turbopack build times               ->  leave

Likely Duplicate (1)
#61   sort order wrong on archived skills             ->  link #42 + status: duplicate + close (--duplicate-of 42)

Closeable (2)
#34   pin engines.node in site/package.json           ->  close, completed (PR #77)
#39   drop the edge runtime from icon route           ->  close, completed (PR #81)

Blocked (1)
#48   migrate catalog reads to the new loader         ->  status: blocked + comment (waits on #34)

Healthy: 9
```

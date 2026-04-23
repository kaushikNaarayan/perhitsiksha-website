# Agent Instructions

## Codebase Knowledge Graph (MANDATORY GATE)

Before writing new code, you MUST run `/graphify` to understand existing patterns,
utilities, and conventions. This is a quality gate — not optional.

```bash
# First time in a codebase (no graphify-out/graph.json):
/graphify .

# Subsequent sessions (incremental update):
/graphify . --update

# Query before implementing:
/graphify query "<concept related to your task>"
```

**Why mandatory:** The graph reveals cross-file patterns, shared utilities, and
architectural decisions invisible from reading individual files. Without it, agents
reinvent existing code, violate conventions, and introduce inconsistencies.

**If graphify is unavailable:** Note it in your bead and proceed, but flag it so
the Mayor can investigate.

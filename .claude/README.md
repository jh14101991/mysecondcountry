# Project .claude layer

This repo's own operating layer. It inherits user-level generic skills and the
three global rules only. It does NOT inherit byImprint's project skills, agents,
settings, or memory.

Hard exclusion: do NOT use the `byimprint-design` skill or any byImprint design
tokens, palette, or components. My Second Country has its own identity, built fresh.

Add business-specific skills under `skills/` only once a task genuinely repeats
(for example a data-refresh workflow, a place-research skill, a source-verify
skill). Do not pre-build a skill library; that is the over-building failure mode
in FOUNDER.md.

# Malagasy (`mg`) — preview

This is an initial, machine-assisted draft for the welcome screen, language
picker and a small set of common map labels. It is not a complete interface
translation. Any message missing from `src/i18n/locales/mg.json` falls back to
English. A Malagasy-speaking editor should review meaning, spelling and tone
before the language is presented as complete or used in a public demonstration.

## Working terms

| English | Malagasy draft | Notes |
| --- | --- | --- |
| source | loharano | Evidence/data origin; keep provider names unchanged. |
| map layer | soson'ny sarintany | A selectable map overlay. |
| satellite | zanabolana | Leave satellite and provider names in source data untouched. |
| aircraft | fiaramanidina | Generic aircraft. |
| vessel | sambo | Generic vessel/ship. |
| interface language | fiteny ampiasaina | Short wording for the language picker. |

Product names, provider acronyms and data returned by feeds remain unchanged.
Keep all `{placeholders}` exactly as written in English. Malagasy `Intl` plural
forms still need review before translating count-dependent messages.

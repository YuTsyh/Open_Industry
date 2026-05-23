# b64453d2-e622-467b-8ee2-39e913cdea0a implementation handoff

This archive is the source of truth for turning the design into production code. Start from `index.html`, then preserve the visual system, responsive behavior, and interactions found in the exported files.

## Implementation target
- Build production UI from the exported design, not a loose reinterpretation.
- Preserve typography scale, spacing rhythm, color tokens, border radii, shadows, motion timing, and component states.
- Replace static placeholders only when the target app has real data or functional equivalents.
- Keep generated product UI free of Open Design chrome, preview labels, or design-process annotations.
- Treat this handoff as a visual contract: if implementation choices conflict, match the exported pixels and behavior first, then refactor internals.

## Source map
- Primary entry: `index.html`
- HTML screens detected: 1
- Stylesheets detected: 2
- Script/component files detected: 58
- Supporting assets detected: 120

## Responsive contract
Validate the implementation across this 2025–2026 viewport matrix:
- Mobile compact: 360×800
- Mobile standard: 390×844
- Mobile large: 430×932
- Foldable / small tablet: 600×960
- Tablet portrait: 820×1180
- Tablet landscape: 1024×768
- Laptop: 1366×768
- Desktop: 1440×900
- Wide desktop: 1920×1080

For responsive web exports, treat these as a modern breakpoint system for one adaptive web experience, not three fixed screenshots. Do not split responsive web into unrelated native app screens unless the project explicitly includes native targets. Use semantic layout thresholds, fluid `clamp()` type/spacing, and container queries where component width matters more than viewport width. Preserve any CSS media queries, container queries, fluid `clamp()` scales, and layout changes already present in the exported files.

## Design fidelity contract
- Extract reusable tokens before writing components: background, surface, foreground, muted text, border, accent, radius, shadow, spacing, type scale, and motion duration/easing.
- Map product screens, in-app modules/components, optional landing page, and optional OS widget surfaces before coding. Keep these surfaces separate in the target architecture.
- Match layout geometry: max-widths, gutters, grid columns, card proportions, sticky/fixed elements, and viewport-specific navigation.
- Preserve real copy, labels, and data shown in the export. Do not replace specific text with generic marketing filler.
- Preserve interactive affordances: hover, focus, pressed, disabled, loading, validation, copy/share, tab/accordion, modal/sheet, and keyboard states where present.
- Preserve accessibility semantics when converting: headings stay hierarchical, controls remain buttons/links/inputs, focus states stay visible.
- Do not keep prototype-only annotations, frame labels, or Open Design chrome in the production UI.

## CJX-ready UX contract
- Use `DESIGN-MANIFEST.json` as the machine-readable map for screens, app modules, OS widgets, landing pages, tokens, interactions, and viewport checks.
- Screen-file-first: when multiple user-facing surfaces exist, implement each HTML screen as its own route/file. Treat `index.html` as a launcher/overview when the manifest marks it that way, not as a combined final UI.
- If `landing.html`, app screens, platform screens, or OS widget files exist, preserve those boundaries in the target app instead of merging them into one page.
- A single self-contained `index.html` is acceptable only when the export truly contains one user-facing screen and its CSS/JS are structured enough to extract tokens, components, states, and behavior.
- If separate `css/` or `js/` files exist, treat them as source of truth for token/component/interactions before porting to React, Vue, SwiftUI, Compose, or another target stack.
- In-app modules/components are product UI blocks inside the app. OS widgets are home-screen/lock-screen/quick-access surfaces outside the app. Do not merge those concepts.

## Color and brand contract
- Use the exported design tokens and product/domain context as the color source of truth.
- Do not introduce warm beige / cream / peach / pink / orange-brown background washes unless they are already explicit brand/reference colors in the export.
- A stylesheet or design/token file was detected; inspect it for canonical color variables before choosing framework theme tokens.

## Implementation sequence for AI coding tools
1. Open `index.html` and `DESIGN-MANIFEST.json`; identify every screen file, launcher/overview file, app module, and interaction before coding.
2. If multiple HTML screens exist, map them to separate routes/surfaces first; do not merge `landing.html`, product app screens, platform screens, or OS widgets into one route.
3. Extract a token table from CSS/root styles and inline styles before building framework components.
4. Build product screens and domain-specific in-app modules from largest layout regions down to controls; avoid starting with isolated atoms that lose spatial intent.
5. Port responsive behavior across the modern viewport matrix and test each semantic breakpoint before cleanup.
6. Port interactions and states, then replace static placeholders only with real app data or functional equivalents.
7. Keep optional landing page and OS widget surfaces as separate surfaces if present.
8. Compare final screenshots against the export at 360×800, 390×844, 430×932, 820×1180, 1024×768, 1366×768, 1440×900, and 1920×1080 before declaring done.

## Entry points
- `index.html`

## Styles
- `styles/app.css`
- `styles/tokens.css`

## Scripts/components
- `scripts/generate-company-registry.mjs`
- `scripts/validate-app.mjs`
- `src/app.js`
- `src/components.js`
- `src/components/badges.js`
- `src/components/companyCards.js`
- `src/components/crossIndustry.js`
- `src/components/liveFeeds.js`
- `src/components/maps.js`
- `src/components/officialEvidence.js`
- `src/components/overviewModules.js`
- `src/components/panels.js`
- `src/components/technologyDetails.js`
- `src/data.js`
- `src/datasets/companies/accton.js`
- `src/datasets/companies/amat.js`
- `src/datasets/companies/amazon.js`
- `src/datasets/companies/ase.js`
- `src/datasets/companies/avc.js`
- `src/datasets/companies/broadcom.js`
- `src/datasets/companies/coherent.js`
- `src/datasets/companies/delta.js`
- `src/datasets/companies/disco.js`
- `src/datasets/companies/ibiden.js`
- `src/datasets/companies/index.js`
- `src/datasets/companies/lumentum.js`
- `src/datasets/companies/micron.js`
- `src/datasets/companies/microsoft.js`
- `src/datasets/companies/nanya.js`
- `src/datasets/companies/nvidia.js`
- `src/datasets/companies/quanta.js`
- `src/datasets/companies/smci.js`
- `src/datasets/companies/tel.js`
- `src/datasets/companies/tsmc.js`
- `src/datasets/companies/unimicron.js`
- `src/datasets/companies/vertiv.js`
- `src/datasets/companies/winbond.js`
- `src/datasets/companies/wiwynn.js`
- `src/datasets/heatmap.js`
- `src/datasets/industries.js`
- `src/datasets/liveFeeds.js`
- `src/datasets/markets.js`
- `src/datasets/officialSources.js`
- `src/datasets/sources.js`
- `src/datasets/technologies.js`
- `src/datasets/templates.js`
- `src/domain/companyMetrics.js`
- `src/domain/crossIndustry.js`
- `src/domain/heatmapMetrics.js`
- `src/utils.js`
- `src/views.js`
- `src/views/company.js`
- `src/views/componentsView.js`
- `src/views/explorer.js`
- `src/views/index.js`
- `src/views/industry.js`
- `src/views/overview.js`
- `src/views/technology.js`

## Assets and supporting files
- `gitstore/COMMIT_EDITMSG`
- `gitstore/config`
- `gitstore/description`
- `gitstore/HEAD`
- `gitstore/hooks/applypatch-msg.sample`
- `gitstore/hooks/commit-msg.sample`
- `gitstore/hooks/fsmonitor-watchman.sample`
- `gitstore/hooks/post-update.sample`
- `gitstore/hooks/pre-applypatch.sample`
- `gitstore/hooks/pre-commit.sample`
- `gitstore/hooks/pre-merge-commit.sample`
- `gitstore/hooks/pre-push.sample`
- `gitstore/hooks/pre-rebase.sample`
- `gitstore/hooks/pre-receive.sample`
- `gitstore/hooks/prepare-commit-msg.sample`
- `gitstore/hooks/push-to-checkout.sample`
- `gitstore/hooks/sendemail-validate.sample`
- `gitstore/hooks/update.sample`
- `gitstore/index`
- `gitstore/info/exclude`
- `gitstore/logs/HEAD`
- `gitstore/logs/refs/heads/main`
- `gitstore/logs/refs/remotes/origin/main`
- `gitstore/objects/01/3e492c10fb3159e797cbffd15d8414c4f3516d`
- `gitstore/objects/09/7b5f1c716dac82f548e3cab868a93b42be7601`
- `gitstore/objects/0d/2d964037400b01be67acdbd1d235c0803d4894`
- `gitstore/objects/10/0bf5d489404fb46744b1496adf19b9090a59ef`
- `gitstore/objects/13/4837cb756f133741498c34f4ad0f92f73aefa4`
- `gitstore/objects/16/f2a73551e94c8055a63ec337ff408ef82e2adc`
- `gitstore/objects/1c/ecb237699300461e823920063bd86f9a64942d`
- `gitstore/objects/1e/a3c5e2fba5a8c2d06199ecec03908f62dd8295`
- `gitstore/objects/1f/bebac0f94c20de6e9d9bb13570fb4f37336f45`
- `gitstore/objects/20/2e7c84056d71302a38adff972af9117a804181`
- `gitstore/objects/21/31bfed66159ffa8c3b5011ec3fda8ef294936f`
- `gitstore/objects/21/e2361fb28006c1a0fde5f444ff1ea3798c4c54`
- `gitstore/objects/29/5e74e79f009caac2791e636618ce383e854647`
- `gitstore/objects/2a/305276cb61f1b325f0ade5c231254a57de648a`
- `gitstore/objects/2f/808eb846d72cd420494551e1787a08cc965e3c`
- `gitstore/objects/2f/c0cfced94122e21f90af5076b37e1afcd51050`
- `gitstore/objects/31/32393fc31bbedeb743d1c81bc6aaa6c14b9524`
- `gitstore/objects/31/3acb86d4d10a7f31dea0ec55a9d9da6a2e0685`
- `gitstore/objects/35/bfea82469d2ebab67254e0bcfefa27a2b63092`
- `gitstore/objects/39/f62086e4ddfedeef39afb735cb930f20237be1`
- `gitstore/objects/3b/54635d3f7a599815c93bd0d6f82b4e9f7f4fe7`
- `gitstore/objects/3d/92164ceeece151bf04909c7cfbdfc80f7475e7`
- `gitstore/objects/3f/ab1bcd1dbef9a477b2fc41f29d50febd1ca208`
- `gitstore/objects/3f/d287ab8940a52efed14a827aeeb65a8d5b6588`
- `gitstore/objects/43/0fb1c96e6b83bf838923a70c5c46237acc2366`
- `gitstore/objects/46/e09486beb68d7fb08772415e5a618f3981b26c`
- `gitstore/objects/49/bd3fc5f44cf854853aa1cf3d21796147279c42`
- `gitstore/objects/4b/9775d86dd588982870c818b4febb762507092f`
- `gitstore/objects/52/4c9a95fa303857809ba46e5be0d954016e76e5`
- `gitstore/objects/53/9f8979e320be478effd7cdb29b609f00e3f7e3`
- `gitstore/objects/53/c9c84aa1b85777bf07fdcb5f5d1c7b235c4d54`
- `gitstore/objects/58/d9de55dd1d7240eb7de40eb3dcf66982f24dac`
- `gitstore/objects/59/6e409ec1f83bc7618b6843d6883383ca57f72e`
- `gitstore/objects/5c/9aad59fa8055fcbbc8fef480067ef99a4e5c24`
- `gitstore/objects/5d/7af3b03b0e2f498de97f36eaa8ab928e348e97`
- `gitstore/objects/61/930dc6b0cc76c25a5ca5677fa14a8a2594cdf9`
- `gitstore/objects/62/879dbc4a324f25717912aeffd3888567d207e9`
- `gitstore/objects/65/d92baf4cdb3d85e53395eef72e78c0f464ca2f`
- `gitstore/objects/6c/240b51576c23e2263948b1a049e03a92b27e03`
- `gitstore/objects/6e/d8783b4d467ee398cd530c8972361d5cb2bb3e`
- `gitstore/objects/6e/f04128719de636982587c6fdbc44e285fd9fa9`
- `gitstore/objects/81/2e010d64c60bc6de18dd71b3b99eeadc8223ae`
- `gitstore/objects/8a/4d38ab9335d34fa489f0b7a4a6ffa3d0900f9f`
- `gitstore/objects/8c/0bd6f902d2a698eb08af92a7c6b577b2b117ca`
- `gitstore/objects/8e/6ff6acfa154a2fdb74873f776d7b5463bd7695`
- `gitstore/objects/90/2f5eca50eaaa345afb12ee2b62f91cb415b03a`
- `gitstore/objects/95/dcf69cb9eead58a1a8098f89f057df2f3494dc`
- `gitstore/objects/96/0c9a1fe38a72df402a30c2e1fcb781d649a20c`
- `gitstore/objects/9a/931a5adeb93ef93d747f53fbca2870bb7040d8`
- `gitstore/objects/9a/c4e20bec59b6a914de8a0a3ca888755d6271cc`
- `gitstore/objects/a0/437fedb116025906365673080cb18e22e06a78`
- `gitstore/objects/a5/87e91e631125633d5050ad9ad042bfa8e6c7aa`
- `gitstore/objects/ad/399466f61c956b9056a85e1d2b97885bc996e1`
- `gitstore/objects/b0/ab1fa706470e8a5b2b074f47bc8719c34b0a17`
- `gitstore/objects/b1/80230e42c19ceeaeb5afe4dbdbb6135ce8220c`
- `gitstore/objects/b6/b566d26c77f40a1cb87caa409afcf18bc3127d`
- `gitstore/objects/ba/2ff2c90f6c6366ac23a8b93b45b47c3cf45bca`
- `gitstore/objects/ba/623df848fbd8b2947d3d379262cbcf57a73636`
- `gitstore/objects/bd/cdfc94527e1648ed155029b69a095f059dbfd2`
- `gitstore/objects/c3/eea54d7bb7094946f9728ad1736459e11ddb64`
- `gitstore/objects/c4/6707dc1d891a4e5a7e4006ba1faa9f34b74903`
- `gitstore/objects/c4/c4758a1a2a850034f18fe38a33b6da45a633c8`
- `gitstore/objects/c4/c7ebe0458e1be92c8f08810d6ee3cbb247b9ff`
- `gitstore/objects/c6/74f65d09c027e57cdb26175545dec637a7b782`
- `gitstore/objects/c6/a1841dbb07c58ae09906b6ad51b93dd59f9f32`
- `gitstore/objects/c7/904a31ca3f6d30fc9a7ca53a229c81c2a13353`
- `gitstore/objects/c9/211ef3eeced476248babe5fd73b904ec0487a8`
- `gitstore/objects/c9/4cb19f0d924b6ff55031f0c48cadc67b1aaad4`
- `gitstore/objects/cd/9b68affffb5f24392d2c0ac8cc6100d6eb1484`
- `gitstore/objects/cd/a7307e389f1e265c982248c84bb6725d25fd5c`
- `gitstore/objects/d1/4c040fb93bfc5152cca8f17ce4b04d85c4b87e`
- `gitstore/objects/d1/f1f0f91721584dbf151f7266fc9b2d98f10286`
- `gitstore/objects/d2/49a684550478d09a895ad171c79e9a0b077892`
- `gitstore/objects/d4/ac935f7bbbd76990066b824da5f17bdd6f74a5`
- `gitstore/objects/d4/d26385ef8dc2f8f818a1f4719000a50558ec97`
- `gitstore/objects/d5/ca1775bedd65877e7fc1824e788136ccf777be`
- `gitstore/objects/db/a8e17bffb9da8e841f3cbe2d8739a2b3f81667`
- `gitstore/objects/de/81aced03a4eb51fb7d37be3ae917ccba698bfa`
- `gitstore/objects/e3/97ac534db35eee35fd714e1f6324eafff367dc`
- `gitstore/objects/e3/fab0374c8312f64a74e587c6cd17d02b377f8a`
- `gitstore/objects/e7/3c0c3688437046a60a75cd4d1f435a6aae3c63`
- `gitstore/objects/e7/779faad385704918b6ce7c0b379a091829d04e`
- `gitstore/objects/e7/914f28185443fa36900641098d84f5c6bbf4ae`
- `gitstore/objects/eb/cffcbebcddc89f9cbc5be428a3a8a29671dcfe`
- `gitstore/objects/ee/a958956d1eb33f474fe2027b94c15dffc5ea6d`
- `gitstore/objects/ef/f9506dcec9d7e6d0dd577b78472b01abb5cd8e`
- `gitstore/objects/f6/d6a01cc80c218187a448f58183d5fa15d976b0`
- `gitstore/objects/f8/68ebef132abb63cadd17ef7e6049e5a8d97d1d`
- `gitstore/objects/f8/e7fb57064a17473f11e2105f6cbda0762f8e88`
- `gitstore/objects/fa/f5d40985517aebcb5c896649a616cd70559a87`
- `gitstore/objects/fd/8ccdc6f3027b4c25fe6927a8a22fc35418a0d7`
- `gitstore/refs/heads/main`
- `gitstore/refs/remotes/origin/main`
- `server/README.md`
- `server/schema.sql`
- `SPEC.md`
- `src/datasets/companies/README.md`

## Coding checklist for AI tools
1. Inspect `index.html` and `DESIGN-MANIFEST.json` first and identify reusable components before coding.
2. Implement each user-facing screen file as its own route/surface; keep launcher, landing, app, platform, and OS widget files separate.
3. Extract design tokens into the target stack: colors, type scale, spacing, radius, shadows, and motion.
4. Implement layout with real 2025–2026 responsive breakpoints, fluid type/spacing, and container-query-aware component behavior; test with no horizontal overflow.
5. Preserve interactive controls, hover/focus/pressed states, form behavior, validation, and copy actions where present.
6. Implement domain-specific in-app modules with real states; do not flatten them into generic cards.
7. Keep landing page, product screens, and OS widget/quick-access surfaces separate when present.
8. Confirm the production result visually matches the exported design before refactoring internals.
9. Reject implementation shortcuts that flatten the design into generic cards, generic gradients, placeholder stats, or framework-default typography.
10. If a detail is ambiguous, keep the exported HTML/CSS/JS behavior rather than inventing a new pattern.

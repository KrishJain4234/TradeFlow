# TradeFlow UI Specification

Scope: visual reference for a voice-first Indian stock-trading PWA. This document describes only the supplied screenshots and the visible reference-page structure. Exact source values, hover behavior, accessibility behavior, and below-the-fold content are unknown unless noted.

## 1. Overall layout

- Desktop viewport: full-width dark shell with a thin market ticker at the very top, followed by a centered navbar. Main content uses a `max-width` of approximately 1600px with 24–40px horizontal gutters; exact max-width is unknown.
- Mobile viewport: approximately 412px wide screenshots. Header becomes a compact two-row area, with the ticker above the logo/search/auth row. A fixed bottom navigation bar is visible.
- Desktop navbar: brand mark at left; rounded search field; primary product links; a “More” dropdown trigger; rounded account/auth control at right.
- Main page pattern: hero or dashboard content first, then cards/panels. Marketing heroes use a two-column layout: large copy and CTA on the left, illustration/product visual on the right.
- Dashboard pattern: horizontal market-stat cards near the top, followed by a large hero or content panel. Cards are grouped in a centered row on desktop and stacked or horizontally scrollable on mobile.
- Background treatment: deep navy/charcoal shell for most desktop heroes; white content sections appear below. Mobile screens use a dark header/card shell above a light content area.
- Card grouping: dark cards use subtle borders or no visible border, rounded corners, and small internal gaps. White promotional panels use thin light-gray borders and large rounded corners.

## 2. Color palette (best estimates)

| Token | Hex | Use |
|---|---|---|
| `page-dark` | `#111A24` | Main dark shell and navbar |
| `surface-dark` | `#1D2A37` | Market cards, dropdown panels, dark cards |
| `surface-dark-2` | `#263442` | Inputs, secondary card areas, selected dark controls |
| `page-light` | `#F8FAFC` | Light page sections |
| `card-light` | `#FFFFFF` | White cards, modal panels, buttons |
| `border-dark` | `#33414F` | Dark card/table separators |
| `border-light` | `#D9E0E8` | Light card and input borders |
| `text-primary` | `#F7F9FC` | Dark-background headings and key values |
| `text-dark` | `#132033` | Light-background headings and button text |
| `text-secondary` | `#A8B2C0` | Supporting text on dark surfaces |
| `text-muted` | `#788595` | Captions, inactive labels, disabled content |
| `accent-blue` | `#1677E8` | Links, active controls, app-prompt emphasis |
| `accent-orange` | `#FFAE4A` | Hero emphasis and selected product accent |
| `gain-green` | `#18C875` | Positive market movement and success indicators |
| `loss-red` | `#F23555` | Negative market movement and loss indicators |
| `gold` | `#F6B51B` | Gold/product accent and star markers |
| `purple` | `#C477F0` | Fund category icon/accent |

Gradients visible in hero artwork are approximately `#12244A` to `#182F80`, with blue-violet glow. Exact artwork colors are unknown.

## 3. Typography

- Font family appears to be a modern geometric sans, close to Inter or a similar system sans. Exact font is unknown; use `Inter, ui-sans-serif, system-ui, sans-serif`.
- Desktop hero title: approximately 52–64px, line-height 1.05–1.12, weight 700–800.
- Mobile hero/page title: approximately 24–30px, line-height 1.15, weight 700–800.
- Desktop section title: approximately 28–36px, weight 700.
- Mobile section title: approximately 20–24px, weight 700.
- Large portfolio/value number: approximately 26–32px, weight 700–800; use tabular numerals.
- Market/index value: approximately 18–22px, weight 700; percentage/change text approximately 14–16px.
- Body text: approximately 16–18px on marketing screens; 14–16px in dashboard cards.
- Labels and captions: approximately 12–14px, weight 500–600, often muted.
- Navigation text: approximately 15–17px, weight 600.
- Use `font-variant-numeric: tabular-nums` for prices, percentages, quantities, and portfolio values so columns align.

## 4. Spacing and shape

- Desktop page gutter: 32–40px; mobile gutter: 16–20px.
- Navbar height: approximately 64–72px desktop; approximately 64px for the main mobile row, excluding ticker.
- Desktop hero height: approximately 680–760px in the supplied views, with a large bottom radius.
- Card padding: 20–24px desktop; 16px mobile.
- Card gaps: 10–16px in compact stat rows; 24–32px between major sections.
- Card radius: 10–14px for compact cards; 24–32px for large hero/promo shells; mobile bottom shell radius approximately 28px.
- Button radius: 8–10px for standard buttons; pill controls use 9999px.
- Border width: 1px, using low-contrast borders.
- Shadow: subtle dark shadow on overlays and dropdowns, approximately `0 10px 30px rgba(0,0,0,.20)`; blue glow is reserved for selected/app-prompt artwork.
- Market-stat row height: approximately 120px desktop; 82–92px mobile.
- Table/list row height: unknown from the supplied states; use 48–56px as a starting point.
- Skeleton loading blocks are light gray, radius approximately 6px for bars and 8px for large blocks.

## 5. Components seen

- Buttons: white primary CTA on dark heroes; blue filled CTA on mobile credit screen; dark filled CTA on light product section; disabled gray CTA in phone login state. Standard height approximately 48–56px, radius 8–10px, semibold text.
- Secondary/ghost controls: dark or transparent surface with light text; borders are subtle. Exact hover colors are unknown.
- Tabs and segmented controls: pill-shaped outer container with pale/white background; selected item is white with a small shadow; category items include circular colored icons.
- Pills/badges: small rounded labels for status, “new”, exclusive filters, and app-rating/download metadata; use compact 11–13px text.
- Inputs: rounded rectangular search and phone fields, 48–56px high; dark search field on desktop, white inputs in auth modal.
- Dropdown: large dark overlay panel anchored below the “More” control, internally divided by category rules and a scroll bar; icon tiles arranged in a 4-column grid.
- Tables/lists: compact rows with thin separators, right-aligned numeric values, and green/red movement indicators. Full data table is not visible; exact columns unknown.
- Charts: small line-chart preview appears in the mobile login/install panel; no axes visible. Use a thin multicolor line on a dark mini-card. Full price-chart type, axis labels, tooltip, and grid styling are unknown.
- Allocation/donut visual: circular gauge/donut motif appears in mobile promotional cards; use green, orange, and red segments on a dark track. Exact data/labels are unknown.
- List items: category icons with short labels in the dropdown; bottom-nav items use monochrome or muted icons and short labels.
- Empty/loading state: mobile home screen shows a light content area with two short skeleton bars and a large skeleton rectangle, followed by a rounded lower placeholder card.
- Icons: simple rounded line/filled icons, mostly white on dark surfaces; category icons use saturated orange, blue, teal, purple, and yellow circles.

## 6. Per-screenshot descriptions

### Screenshot 1 — mobile credit/loan promotional state

Top to bottom: clipped market ticker; dark mobile header with logo area, search icon, and light auth button; centered promotional headline with muted supporting line; centered credit-limit prompt; small green reassurance line; emphasized rate statement; three-row loan-rate list inside an outlined dark card; large blue CTA overlapping the card bottom; fixed bottom navigation with five destinations. The headline and CTA are the strongest elements; rates and supporting copy are muted.

### Screenshot 2 — mobile market dashboard loading state

Top to bottom: ticker; dark header with logo, search, and auth button; three compact index/commodity stat cards; a market-mood card with a small gauge; light content area with skeleton bars and a large skeleton block; fixed app-promotion banner above the bottom nav; five-item bottom navigation. The stat row and app banner are visually stronger than the loading placeholders.

### Screenshot 3 — mobile authentication/install panel

Left to right/top to bottom: dark outer browser surround; white auth panel with logo, help pill, close icon, phone-number title, country-code selector, phone input, disabled OTP button, and terms line; dark lower promotional panel with a portfolio-value card, mini line-chart card, gauge card, analysis headline, supporting copy, and white install button. The value card and lower headline are the main hierarchy anchors.

### Screenshot 4 — desktop home with open product menu

Top to bottom: ticker; desktop navbar with search and product links; market-stat row; dark blue hero with large left-aligned fractional-investing headline, carousel dots, CTA, and faint compliance/supporting copy; right-side “More” menu overlay covering the hero, with category headings, colorful circular icon tiles, and an internal scrollbar. The overlay is the most prominent foreground element.

### Screenshot 5 — desktop US-investing hero

Top to bottom: ticker; navbar; five market cards; large rounded dark-blue hero. The left side contains a two-line white headline, carousel dots, wide white CTA, and muted compliance copy. The right side contains floating stock-brand-like tiles and a glowing blue globe/arc visual. Hero title and CTA dominate; supporting copy is intentionally low contrast.

### Screenshot 6 — desktop screener landing page

Top to bottom: ticker; navbar; centered three-option segmented control; large centered white headline with orange category emphasis; centered supporting sentence; centered white CTA; small user-proof row with circular avatars; large white rounded preview panel containing filter-card imagery. The heading and selected category control are the strongest elements.

### Screenshot 7 — desktop digital-gold hero

Top to bottom: ticker; navbar; dark hero with a small eyebrow, large two-line headline, three star-bulleted benefits, white CTA, faint trust/supporting line, and a large gold coin-like 3D visual on the right with purple/blue lighting. Headline and gold artwork dominate; trust text is muted.

### Screenshot 8 — desktop digital-gold overview/product section

Top to bottom: ticker; navbar; light category segmented control; white section with faint vertical dotted grid; left column has product heading, muted explanatory line, three stacked feature statements, and dark CTA; right column has numbered step markers, app/browser mockup, and a small download/rating pill. The left CTA and right mockup are the visual anchors.

### Screenshot 9 — repeated mobile market dashboard loading state

This is materially the same mobile state as Screenshot 2: ticker, dark header, three market cards, market-mood card, light skeleton content, app-promotion banner, and fixed bottom navigation. The repeated capture confirms the compact mobile shell and persistent bottom navigation; exact loading timing/state is unknown.

## 7. Visible interaction details

- Selected category/tab: selected item sits on a white or pale pill inside a larger rounded segmented control and gains a slight shadow or contrast lift.
- “More” menu: opens as a dark, vertically scrollable panel aligned to the desktop navbar; visible internal scrollbar indicates more menu content below.
- Carousel indicators: small dots appear under hero copy; the active slide is a longer white dash or brighter marker.
- Auth controls: account action is a high-contrast rounded light control; mobile auth uses a close icon and help pill.
- Loading state: skeleton blocks replace content without changing the surrounding navigation shell.
- Hover/focus states are not directly visible in the screenshots; exact hover behavior is unknown.
- Dropdown open/closed animation is unknown; preserve the anchored relationship and scrollable panel behavior.

## 8. Tailwind mapping

```ts
// tailwind.config.ts theme extension
{
  theme: {
    extend: {
      colors: {
        page: { dark: '#111A24', light: '#F8FAFC' },
        surface: { dark: '#1D2A37', muted: '#263442', light: '#FFFFFF' },
        ink: { primary: '#F7F9FC', dark: '#132033', secondary: '#A8B2C0', muted: '#788595' },
        border: { dark: '#33414F', light: '#D9E0E8' },
        accent: { blue: '#1677E8', orange: '#FFAE4A', gold: '#F6B51B', purple: '#C477F0' },
        gain: '#18C875',
        loss: '#F23555'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '14px',
        hero: '32px',
        control: '10px',
        pill: '9999px'
      },
      boxShadow: {
        overlay: '0 10px 30px rgba(0, 0, 0, 0.20)',
        selected: '0 2px 10px rgba(19, 32, 51, 0.12)',
        glow: '0 0 32px rgba(71, 127, 255, 0.45)'
      }
    }
  }
}
```

Suggested spacing scale: use the default Tailwind scale with `4`/`16px` mobile gutters, `6`/`24px` card padding, `8`/`32px` major gaps, and `10`/`40px` desktop gutters. Use `tabular-nums` for all financial values.

## 9. Suggested React component list

- `MarketTicker` — horizontally moving market symbols and gain/loss values.
- `Navbar` — responsive desktop/mobile navigation shell.
- `SearchInput` — rounded context-aware search control.
- `AuthButton` — account/login action.
- `MarketStatCard` — index, commodity, value, and movement summary.
- `MarketMoodCard` — gauge plus market-state label.
- `HeroSection` — reusable two-column marketing hero.
- `HeroCarouselIndicators` — active/inactive slide markers.
- `PrimaryButton` — high-contrast CTA.
- `CategoryTabs` — product/category segmented control.
- `MoreMenu` — scrollable product/tools dropdown.
- `IconTileGrid` — colored category icon grid.
- `BenefitList` — icon/star-led promotional benefits.
- `PortfolioValueCard` — current value and return summary.
- `PriceChart` — compact line-chart preview and future full chart surface.
- `DonutGauge` — allocation or market-mood circular visual.
- `DataTable` — aligned financial rows with tabular numbers.
- `SkeletonBlock` — loading placeholder bars and panels.
- `AppPromptBanner` — mobile app-install/rating prompt.
- `BottomNav` — fixed mobile navigation.
- `AuthModal` — phone-entry and OTP flow shell.
- `ProductMockup` — decorative product/browser preview.

## 10. Responsive notes

- Keep the ticker horizontally clipped/scrollable and prevent it from forcing page width.
- Collapse desktop navbar links into a compact header; retain search, auth, and a menu trigger.
- Convert desktop hero two-column layouts into stacked sections; place artwork below or behind copy and preserve CTA prominence.
- Change stat-card rows to horizontal scrolling or a two/three-column compact grid; do not shrink financial values below legibility.
- Make the “More” menu full-width or near-full-width on mobile, with a two-column icon grid and internal scrolling.
- Keep bottom navigation fixed with safe-area padding; reserve page bottom space so content is not obscured.
- Stack portfolio/value and chart cards vertically; allow tables to scroll horizontally or switch to label/value list rows.
- Use 16–20px page gutters and 16px card padding on mobile; preserve 24–28px large-shell radii.
- Maintain skeleton proportions while reducing their height and using full available width.

## 11. What to change so it is not a clone

1. Use a teal-to-indigo accent system instead of the reference orange/blue emphasis, while retaining green/red financial semantics.
2. Use a distinct geometric wordmark and abstract waveform icon for TradeFlow rather than a similar logo silhouette.
3. Replace the reference’s circular category icon tiles with compact outlined glyphs and voice-command badges.
4. Use 18px card radii and a softer `0 8px 24px` shadow system rather than matching the observed radii/shadows exactly.
5. Make the primary CTA voice-led, such as “Say what to trade”, and use a bottom-sheet voice composer instead of reproducing the same promotional wording or menu taxonomy.

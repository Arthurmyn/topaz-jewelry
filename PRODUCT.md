# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Customers in Astana and Karaganda (Kazakhstan) choosing jewelry for themselves or as a gift (engagement, wedding, anniversary). Middle and upper-middle budgets. They browse on phones and desktops, compare pieces, check size and availability, and often finish with a call or WhatsApp message to the salon. Confirmed by the owner.

## Product Purpose
Online storefront for Topaz Jewelry, a premium retailer with salons in Astana and Karaganda. Sells gold 585 and 750 pieces, mostly limited and one-of-a-kind. Success: a visitor finds a piece, trusts the quality, and orders online, requests an order, or visits a salon.

## Positioning
Premium jewelry with physical salons in Astana and Karaganda; gold 585 and 750; limited pieces.

## Operating Context
UI language is Russian, currency KZT. Order-by-request mode (no payment) until an acquiring contract exists; accounts and online payment are optional modules behind feature flags. Support via WhatsApp handoff. Salons are part of the buying journey (pickup, viewing).

## Capabilities and Constraints
Catalog with filters (category, metal, purity, stone, price, availability), product pages with sizes, cart and checkout (planned), store pages, info pages, newsletter, support bot, admin panel. Stack: Next.js App Router, Tailwind 4 (`apps/web`). All user-facing Russian text lives in `apps/web/src/content/ru.ts`. Site structure is a working draft in `docs/SITE_STRUCTURE.md` (not yet agreed with the client). Open: installment payments, gift cards, services (custom work, repair, appraisal).

## Brand Commitments
Name: Topaz Jewelry. Text wordmark for now. Owner pinned the Mumit storefront (mumit.com) as the structural and stylistic reference: promo strip, minimal centered nav with icons, split hero with a large serif title, category tiles, product carousel, newsletter, dark footer.

## Evidence on Hand
No logo, no product photography, no press or testimonials. Product images are generated placeholders; designs must use neutral placeholders instead of photos and must not invent proof (reviews, press, awards, years in business).

## Product Principles
1. Trust first: quality marks (585/750), real salons, clear availability, honest copy.
2. The piece is the hero; the interface stays quiet.
3. Works fully without accounts and without payments.
4. Every Russian string is editable in one file.

## Accessibility & Inclusion
Russian-language audience; keyboard and screen-reader usable; respect prefers-reduced-motion.

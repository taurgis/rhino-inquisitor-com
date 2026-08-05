---
title: How SFCC Price Books Actually Work
description: >-
  Learn why getPriceModel().price often returns the list price instead of the
  sale price in SFCC, and how to fix it in scripts, jobs, and SCAPI.
date: '2026-08-05T09:10:03.000Z'
lastmod: '2026-08-05T11:30:46.000Z'
url: /how-sfcc-price-books-actually-work/
draft: false
heroImage: how-sfcc-price-books-actually-work-hero.jpg
heroImageAlt: >-
  A cartoon rhino accountant holding a magnifying glass over two overlapping
  price tags, one crossed out, one lower.
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - scapi
  - sfra
  - api
author: Thomas Theunen
takeaways:
  - "Explains why ProductMgr.getProduct() and getPriceModel().price return the list price when the sale price book isn't in the applicable set"
  - "Walks through setApplicablePriceBooks(), getPriceBookPrice(), and the parent price book relationship for reading list and sale prices together"
  - "Covers the SCAPI price book gap, job-context pricing with the right locale/currency/site APIs, and iterating price books at scale with chunk-oriented job steps"
---

"What's the best way of retrieving a product's 'sale' price when there are 2 pricebooks — list-prices, sale-prices? With `product.getPriceModel().price` the price shown is always the one coming from the 'parent' pricebook, the list price."

I've now seen a version of that sentence in four different channels of the [Unofficial SFCC Slack community](https://unofficialsfcc.com/) in the space of a few weeks: #sfra, #b2c-general, #scapi, #storefront-next. Same setup, same confusion, same moment of "wait, why isn't this working." It's one of the most reliably recurring questions in the SFCC community, and it keeps recurring because the answer isn't spelled out anywhere outside the Script API class reference itself, and the reference keeps moving. Older bookmarked links to `documentation.b2c.commercecloud.salesforce.com` now redirect to a community-maintained GitHub Pages mirror instead of Salesforce's own site, and the once-standard `/references/script-api-for-commerce-cloud/current/...` path on developer.salesforce.com is a dead 404. The current reference lives under `/docs/commerce/b2c-commerce/references/b2c-script-api/` — you just have to know to look there. Let's fix that.

## The applicable set, not the price book you assigned

Here's the root cause, and it's almost always the same one: `getPriceModel().price` doesn't evaluate every price book that exists on your instance. It only evaluates whatever's currently in the *applicable* set for the session, and if your sale price book was never added to that set, the platform genuinely does not know it exists.

Someone finally ran this down in one of those threads by checking `PriceBookMgr.getApplicablePriceBooks()` (the Script API class for reading and setting which price books are in scope for the current session), and got back a single price book: the list book, not the sale book — even though it was configured correctly in Business Manager (SFCC's merchant-facing admin tool), assigned to the site, and had entries for the product in question. The sale book just wasn't in scope for that request.

Once you see it, the rest of the confusion collapses into one sentence: **`ProductPriceModel.getPrice()` returns the minimum price across whatever price books are currently applicable — nothing more, nothing less.** If only the list book is in the applicable set, the "lowest price" happens to be the only price, and that's what you get back from a plain `ProductMgr.getProduct(id).getPriceModel().getPrice()` call every time. (`ProductPriceModel` is the class `Product.getPriceModel()` actually returns — there's no separate `PriceModel` class in the Script API.)

```mermaid
flowchart LR
    A["ProductMgr.getProduct(id)"] --> B["product.getPriceModel()"]
    B --> C{"Which price books are applicable?"}
    C -->|"Only list-prices"| D["getPrice() returns list price"]
    C -->|"list-prices + sale-prices"| E["getPrice() returns lower of the two"]
    C -->|"Neither assigned to site"| F["getPrice() returns N/A"]
```

Where does the applicable set come from by default? Whichever price books are assigned to the site and match the session's currency (per Salesforce's own [price lookup rules](https://help.salesforce.com/s/articleView?id=cc.b2c_price_books_for_developers.htm&type=5)), plus their direct parent price books. Storefront controllers built on [SFRA](/getting-to-know-sfra-as-a-developer/) (Storefront Reference Architecture, SFCC's standard storefront framework) don't usually need to think about this. The platform resolves the applicable price books for you automatically at the start of each request. The moment you step outside that request lifecycle — a script you run by hand in Business Manager, a job, a custom SCAPI (B2C Commerce API, the newer headless REST layer) endpoint — you're on your own, and the applicable set defaults to whatever the platform decides for that context. Often, that's just the list book.

## Fixing it: setApplicablePriceBooks(), correctly

The fix, in Script API (SFCC's server-side JavaScript API) context, is `dw.catalog.PriceBookMgr.setApplicablePriceBooks()`, called before you read any price. The signature is `setApplicablePriceBooks(priceBooks: PriceBook...)` — variable arguments, meaning you pass each `PriceBook` object as its own argument, not a `List`, array, or `ArrayList` wrapping them. Here's what a correct call looks like, in a script you might run from Business Manager, a job step, or a custom endpoint:

```js
var PriceBookMgr = require('dw/catalog/PriceBookMgr');
var ProductMgr = require('dw/catalog/ProductMgr');

var listPriceBook = PriceBookMgr.getPriceBook('my-list-prices');
var salePriceBook = PriceBookMgr.getPriceBook('my-sale-prices');

// Correct: each PriceBook as its own argument (varargs), not a List
PriceBookMgr.setApplicablePriceBooks(listPriceBook, salePriceBook);

var product = ProductMgr.getProduct('my-product-id');
var price = product.getPriceModel().getPrice(); // lowest of the two books
```

One developer in #b2c-general hit this exact mistake, just in the other direction. They'd built a `dw.util.ArrayList` of the two price books and called `PriceBookMgr.setApplicablePriceBooks(applicableBooks)` with the whole collection as a single argument — the pattern that works for plenty of other multi-object Script API calls. It didn't throw; it just quietly returned only the list price, because the method only recognises individual `PriceBook` arguments, not a collection wrapping them. The API reference states the varargs signature plainly enough once you know to look for it, but it's an easy pattern to get backwards coming from other parts of the API that do take a `List`.

You might expect the opposite problem here: that calling `setApplicablePriceBooks()` with a broad set spanning multiple currencies — a GBP book and an EUR book, say, because your site sells in both — risks a numerically lower GBP price leaking into an EUR storefront. It doesn't. Salesforce's own documented price lookup steps apply the same currency filter to price books you register explicitly as they do to the default set: "Ignore all inactive price books, price books not valid at the current time, and price books with a currency other than the session currency" sits directly under the bullet for price books "explicitly registered in the session," not just the automatic-resolution path. Put a GBP book in the applicable set during an EUR session, and the engine drops it before `getPrice()` ever compares numbers. The real risk shows up when the broad set you pass in doesn't cross a currency boundary at all — see the store-based case below.

## When you want a specific book, skip the minimum logic entirely

If what you actually need is "the price from *this* book," don't widen the applicable set and hope `getPrice()` lands on the right one. Call `ProductPriceModel.getPriceBookPrice('pricebook-id')` directly, on the same `product` from the example above:

```js
var priceModel = product.getPriceModel();
var listPrice = priceModel.getPriceBookPrice('my-list-prices');
var salePrice = priceModel.getPriceBookPrice('my-sale-prices');
```

Reach for this pattern anywhere you need to show both prices at once — a strikethrough list price next to a sale price on a product tile, for instance — because `getPrice()` by design only ever gives you one number.

One quirk worth knowing before you rely on this: someone in the same thread reported that `getPriceBookPrice('pricebook ID')` didn't return anything useful *until* they commented out the earlier `setApplicablePriceBooks()` call in the same script. I haven't been able to pin down the exact interaction from the (thin) official docs, but the practical lesson holds up: if you're reaching for `getPriceBookPrice()` for a specific book, don't also call `setApplicablePriceBooks()` with a narrower or conflicting set upstream in the same execution. Pick one mechanism per code path and don't mix them.

A store-based fulfilment case makes the same point from a different angle: one setup had three price books (one per store, physical versus virtual) with the applicable books set correctly. But `getPriceModel().getPrice()` kept returning the lowest of the three ($500) instead of the one tied to the current store ($900), because "lowest wins" doesn't know which store the shopper is in.

The fix that was reached is the right one: set *only* the single price book you want as the applicable set at the point you call the product or search factory, rather than leaving all three in scope and hoping the "lowest wins" rule happens to pick the right one. If you need more than one book active at a time, use `getPriceBookPrice()` per book instead of `getPrice()`.

> [!NOTE]
> Nobody in that thread had a clean answer for combining a specific price book with `PromotionMgr` (the Script API class for evaluating active promotions) — there's no native API to say "apply promotion X to price book Y specifically." Promotions apply to whatever the current price model resolves to. If your business logic needs promotions scoped per price book, budget time to test that interaction directly against your price book setup rather than assuming it composes cleanly.

## Reading list and sale price together via the parent book

Business Manager gives you a cleaner path for the common case of "show both prices," and it doesn't require juggling two separate `getPriceBookPrice()` calls with hardcoded IDs. Under **Merchant Tools > Site > Products and Catalogs > Price Books**, a price book's General tab has a **Based On** field — this is the parent price book relationship. Set your sale book's "Based On" to your list book, and `dw.catalog.PriceBook` exposes that relationship in script through `parentPriceBook`. The `priceModel` below is the same one from the `getPriceBookPrice()` example earlier — one product, one price model, two books:

```js
var salePriceBook = PriceBookMgr.getPriceBook('my-sale-prices');
var listPriceBook = salePriceBook.getParentPriceBook();

var salePrice = priceModel.getPriceBookPrice(salePriceBook.getID());
var listPrice = priceModel.getPriceBookPrice(listPriceBook.getID());
```

This buys you one real thing: you stop hardcoding the list book's ID in every script that needs both prices. Walk the relationship instead, and a merchant can rename or reorganise price books later without you needing to touch every price-display script.

## Job context: there's no HTTP request, so the defaults change

Jobs are where this whole model gets less forgiving, though not quite for the reason it first looks like. A storefront request arrives with a session, a locale, and a currency already resolved by the platform before your controller code runs a single line. A job step gets a pseudo-request and pseudo-session instead: `request` and `session` still exist as objects, but Salesforce's own docs note that HTTP-specific methods on `request` return null because there's no HTTP request behind them, and `session.getCustomer()` always returns null in that context. Locale and currency do resolve to a default — the job's site — so the one piece of context that's genuinely fixed rather than defaulted is the site itself. `dw.system.Site` has no setter at all, only getter methods like `getCurrent()`. Which site a job step runs against is a Business Manager (or OCAPI Data API) setting called the job's **Flow Scope** — the entire organization, all storefront sites, or specific sites you choose when you configure the flow — not something you set from script.

One question from mid-2024 asked exactly this for a multi-locale, multi-currency job and never got a public answer in the thread, so there's no canonical fix to point to — just a workaround people keep reinventing independently. The version most teams land on: call `request.setLocale('fr_FR')` and `session.setCurrency(dw.util.Currency.getCurrency('EUR'))` for the locale/currency pair you're processing, then `setApplicablePriceBooks()` with the correct book for that combination *before* running your search or product loop, and repeat that sequencing for every locale/currency pair you need to touch. Skip a step, or run it out of order, and the currency filter covered above works against you in a different way than you'd expect: a price book that doesn't match the session's currency gets silently excluded rather than flagged, so you're more likely to get `Money.NOT_AVAILABLE` than a wrong number for that pass — annoying, but at least visible. The quieter failure mode is two locales sharing a currency: forget to swap the price book between an FR pass and a DE pass that are both priced in EUR, and nothing filters that mismatch out for you. You'll get the previous pass's price, silently, with no error at all.

```mermaid
flowchart TD
    Start["Job step starts"] --> A["Flow Scope resolves the site (BM/OCAPI config, not a script call)"]
    A --> B["request.setLocale() / session.setCurrency() for this pass"]
    B --> C["setApplicablePriceBooks() with the book for that locale/currency"]
    C --> D["Iterate products in a chunk-oriented job step"]
    D --> E{"More locale/currency pairs to process?"}
    E -->|"Yes"| B
    E -->|"No"| F["Job step complete"]
```

For iterating every product at scale, reach for a [chunk-oriented job step](/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/) rather than one long-running script — it's Salesforce's own canonical pattern for this, built directly on `ProductMgr.queryAllSiteProducts()`. Reading, processing, and writing in bounded chunks is what actually keeps a job step from timing out on a large catalog, not which product-lookup method feeds it.

`ProductSearchModel` still earns its place when you need to filter first — only online products, one category, products matching a refinement — because it queries the search index instead of loading every `Product` object just to check a condition. But once your job needs trustworthy pricing per product, that advantage disappears: `ProductSearchHit.getMinPrice()`/`getMaxPrice()` come straight from the search index and, per Salesforce's own docs, can return different numbers than `ProductPriceModel`, so you end up calling `hit.getProduct().getPriceModel()` for a price you can trust — the same per-product load `queryAllSiteProducts()` would have handed you directly. Reach for `ProductSearchModel` to filter the catalog down, not for a performance win you won't actually get once live pricing is the goal.

## The SCAPI gap: there's no setApplicablePriceBooks() equivalent

Of all the recurring questions, this is the one that worries me most, because no answer exists anywhere I could find — not in a Slack thread, not in the official docs. The question came up again in mid-2026, this time in #scapi: is there a SCAPI equivalent to `PriceBookMgr.setApplicablePriceBooks()` and `Promotion.getPromotionalPrice`? Nobody replied.

There isn't one, and the reason runs deeper than a missing parameter. SCAPI's [Shopper Products API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products) resolves price server-side as part of building the response — you don't get a script-context call graph you can insert `setApplicablePriceBooks()` into, because there's no equivalent "before you read the price" moment exposed to you. The price and `priceRanges` fields in a `getProduct` or `getProducts` response are already the outcome of whatever price books are assigned to the site and (per Salesforce's own documentation) [personalised through the Shopper Context API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api.html) — customer group, source code, or store ID context you set before the call, not price book IDs you pass on the call itself.

Promotions carry the same constraint one layer further. Salesforce's [Promotion Types and Requirements](https://developer.salesforce.com/docs/commerce/commerce-api/guide/promotion-details.html) guide states it plainly: promotional pricing is **only** returned for qualifying products with non-conditional purchase requirements, and pricing discounts for basket and shipping promotions are **never** returned by `getProduct` or `getProducts` at all. If your promotion has a condition attached — a minimum spend, a loyalty signup — SCAPI won't hand you a calculated promotional price up front; the shopper has to act first.

If you need custom price book logic in a headless implementation and none of that native resolution gets you there, the documented extension point is a hook, not a new SCAPI parameter. `dw.ocapi.shop.product.modifyGETResponse` runs after OCAPI has already resolved the product and built the response document — it hands you both the resolved Script API `Product` object and that document, so you can modify the document before it goes back to the client. (OCAPI is SFCC's original REST API, now deprecated in favour of SCAPI — see [OCAPI versus SCAPI](/in-the-ring-ocapi-versus-scapi/) for the full comparison — and SCAPI reuses the same hook extension points under the hood, which is why the hook name still carries the `dw.ocapi` prefix.) [That lifecycle is covered in detail here](/how-to-use-ocapi-scapi-hooks/) if you haven't wired one up before. Inside that hook you have the full `dw.catalog` API available, including `setApplicablePriceBooks()` and `getPriceBookPrice()`, so you can attach whatever custom price data the native response doesn't give you as a `c_` field.

Two things to remember before you reach for this hook. SCAPI hooks don't run at all until someone turns on API hook execution under **Administration > Global Preferences > Feature Switches** in Business Manager.

The caching interaction is the one that will actually bite you in production. Salesforce's [server-side web-tier caching](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html) calculates the response cache key *before* your hook runs, so whatever custom price you attach inside `modifyGETResponse` has no say in which cached response a shopper gets served. (Salesforce's own published example for this is written against the sibling category hook, `modifyGETResponse(scriptCategory, categoryWO)` — same `dw.system.Response` object, same hook family, and its TTL/personalisation table ties the 900-second default specifically to the Products API's `prices`/`promotions` expansions.) The platform only treats a `getProduct` response as personalised if you call `dw.system.Response#setVaryBy('price_promotion')` — the only variant identifier it currently supports. Skip that call, and your custom price can get cached against one shopper's request and handed straight back to the next shopper who hits the same product URL. The built-in `prices` and `promotions` expansions default to a 900-second TTL (time-to-live: how long a cached response is served before the platform re-fetches it) with personalisation already on; your hook's own logic isn't covered by that default unless you opt in explicitly. For more on controlling SCAPI response caching directly — `setExpires()`, `setVaryBy()`, and where each mechanism actually applies — see [Server-Side Caching for Faster SFCC REST APIs](/caching-rest-apis-in-sfcc/).

## Iterating all price tables of a product

The other question that surfaced independently in #b2c-general — how do you get *every* price table for a product programmatically, not just the applicable ones — has a straightforward brute-force answer and a faster one for scale.

The brute-force version: loop `PriceBookMgr.getAllPriceBooks()` and call `priceModel.getPriceBookPrice(priceBook.getID())` for each one.

```js
var allBooks = PriceBookMgr.getAllPriceBooks().iterator();
var prices = {};

while (allBooks.hasNext()) {
    var book = allBooks.next();
    var price = priceModel.getPriceBookPrice(book.getID());
    if (price.available) {
        prices[book.getID()] = price;
    }
}
```

This works, and it's fine for a one-off script against a single product in Business Manager. It does not scale to a job that touches every product in a large catalog, because you're paying the cost of that inner loop — one `getPriceBookPrice()` call per price book — for every single product. For bulk operations, drop this inside the same chunk-oriented job step pattern covered above, and constrain the applicable price book set to only the books you actually need for that pass, instead of asking every product about every book it might have an entry in.

## High Scale Price Books: documented, just not where you'd look

One thread mentioned High Scale Price Books as an alternative worth knowing about for jobs that update prices frequently. Salesforce's own documentation backs up most of what came up in that conversation, once you know to look under [Read-Only Price Books](https://help.salesforce.com/s/articleView?id=cc.b2c_optimized_price_books.htm&type=5) in the B2C Commerce Help docs rather than the standard price book guide.

The problem it solves: a standard price book keyed to a product-level custom attribute needs the catalog reindexed every time a job updates prices, and reindexing at that frequency gets expensive. High Scale Price Books — Salesforce's docs call the resulting price book type "read-only price books," enabled by the High Scale Price Books feature switch — bypass that reindex requirement. Per Salesforce, read-only price books "don't require product indexing for prices to take effect in the search index."

The trade-off is real, but narrower than that Slack thread suggested. You do lose Business Manager convenience: Salesforce confirms you can't edit individual prices or price tables on a read-only price book through the standard Business Manager flow, so price changes have to go through your PIM and a re-import instead. The "no promotion support" part doesn't hold up against current docs, though. A [20.2 release note](https://help.salesforce.com/s/articleView?id=commerce.b2c_20_2_w6899593_search_supports_promotions_hsbp_lb.htm&type=5) confirms storefront search now surfaces products under price-book-based promotions even when they're priced only in a High Scale Price Book — so whatever restriction the original thread ran into has since loosened.

If a job on your project needs to push price changes often enough that reindexing is the bottleneck, High Scale Price Books are worth a real look, not just a Slack rumour. Check the release notes for your own instance version before you build around them, since Salesforce keeps expanding what these price books support.

## Picking the right tool

```mermaid
flowchart TD
    Q1{"Do you need one specific book's price?"} -->|"Yes"| A1["Use getPriceBookPrice('id') directly"]
    Q1 -->|"No, just the best price"| Q2{"Are you in a storefront request?"}
    Q2 -->|"Yes"| A2["SFRA/session context already sets the applicable books — just call getPriceModel()"]
    Q2 -->|"No — job or script"| Q3{"Bulk operation across many products?"}
    Q3 -->|"Yes"| A3["Set applicable books once per locale/currency pass, then use a chunk-oriented job step"]
    Q3 -->|"No, one-off script"| A4["setApplicablePriceBooks() with a narrow, single-book set before reading price"]
```

Every path in that tree still ends at the same rule: `getPriceModel().getPrice()` only ever tells you the minimum across whatever's currently applicable, and "currently applicable" is something you own, not something the platform quietly gets right on your behalf outside a storefront request. Set it deliberately, or use `getPriceBookPrice()` and skip the guessing entirely.

If price books are new territory for you, the [Product and Catalog ERD](/salesforce-b2c-commerce-cloud-catalog-erd/) covers how price books sit next to the rest of the catalog model, and price resolution matters again the moment a shopper reaches [checkout](/sfcc-basket-order-erd/) — the basket re-evaluates prices against whatever's applicable at that point too. Worth knowing before your prices look right on the PDP (product detail page) and wrong in the cart.

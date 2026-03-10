---
title: 'Image-ine: Salesforce B2C Commerce Cloud DIS for Developers'
description: >-
  in the wild, wild west of e-commerce, images aren't just pretty pictures.
  They're your silent sales force, your conversion catalysts, and your SEO
  super...
lastmod: '2025-07-16T14:27:13.000Z'
url: /image-ine-sfcc-dis-for-developers/
draft: false
date: '2025-07-14T06:44:24.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
In the wild, wild west of e-commerce, images aren't just pretty pictures. They're your silent "sales force" (☺️), your conversion catalysts, and your SEO superheroes. Shoddy, slow-loading visuals? That's a one-way ticket to "bounce rate hell" and a brand image that screams, "We tried."

But fear not. Salesforce B2C Commerce Cloud's [Dynamic Image Service](https://help.salesforce.com/s/articleView?language=da&id=cc.b2c_image_transformation_service.htm) (DIS) is here to help. Keep in mind that this built-in tool has several tricks up its sleeve, but might not always be the best fit for your project, so keep reading!

DIS & eCDN Notice Effective image delivery in B2C commerce depends on two key components: the Dynamic Image Service (DIS), which handles real-time processing, and the eCDN, responsible for scalable delivery. When an image is first requested, DIS transforms it, and then the eCDN caches it for all future views.

This article focuses on the DIS layer, the main driver of the image manipulation process.

## So, what exactly is DIS magic?

Imagine a world where you upload one glorious, high-resolution image, and then, _poof!_—it magically transforms into every size, shape, and format your storefront could ever dream of, all on the fly.
That, my friends, is the core enchantment of Salesforce B2C Commerce Cloud's Dynamic Imaging Service (DIS). It's designed to eliminate the nightmare of manually resizing, cropping, and uploading numerous image variants for every product view.

Instead of a digital assembly line of pre-processed images, DIS acts like a master chef. You provide it with the finest ingredients (your single, high-res source image), and when a customer's browser requests a specific dish—say, a tiny thumbnail for a search result or a sprawling, detailed shot for a product page—DIS delivers it instantly. No waiting, no fuss - just the right-sized image, served hot and fresh.



And you, the developer, are the culinary artist! DIS hands you a robust toolkit of transformation parameters, giving you pixel-level control. Want to resize? `**scaleWidth**` or `**scaleHeight**` are your pals. Need to snip out a specific detail? `**cropX**`, `**cropY**`, `**cropWidth**`, and `**cropHeight**` are your precision scissors (remember, you need all four for the magic to happen!). Fancy a different file type? `**format**` lets you switch between `gif`, `jp2`, `jpg`, `jpeg`, `jxr`, and `png` from a smorgasbord of source formats, including `tif` and `tiff`.

Ever wanted to add a "SALE!" image badge to an image without using Photoshop?  `**imageX**`, `**imageY**`, and `**imageURI**` are your go-to options for the overlay. _Though honestly, why not just use CSS for this, right?_

And for that perfect balance between crispness and speed, `**quality**` lets you fine-tune compression for JPG(1-100, default 80) and PNGs. Even pesky transparent backgrounds can be tamed with `**bgcolor**`, and metadata stripped with `**strip**`.

Pro Tip DIS has a very specific "recipe" for applying these transformations. It's not a free-for-all! The order is always: Image Format, then Image Crop, then Image Scale, then Image Overlay, and finally Image Quality. Understanding this sequence is key to avoiding "oops, that's not what I wanted" moments.

Want to know precisely how all of these things work? Have a look at the [official documentation](https://help.salesforce.com/s/articleView?id=cc.b2c_creating_image_transformation_urls.htm&type=5).

## Why You Should Be Best Friends with DIS

![A cartoon illustration of a developer shaking hands with a friendly, anthropomorphic cloud icon, as small, optimized images happily flow between them towards an e-commerce storefront. This symbolizes a strong, collaborative, and efficient relationship with the Dynamic Image Service.](https://www.rhino-inquisitor.com/wp-content/uploads/2025/07/developer-and-dis-are-friends-scaled-e1752256621645-1024x456.jpeg)

Best Friends with DIS: Seamless Image Optimization

For developers navigating the Salesforce B2C Commerce Cloud universe, DIS isn't just a nice-to-have; it's a game-changer that simplifies your life and turbocharges your storefront.

**Kiss Manual Image Management Goodbye:** Seriously, who has time to create 10 different versions of the same product shot? With DIS, you upload one glorious, high-resolution image to Commerce Cloud, and DIS handles the rest, generating every size and format on demand. This means your creative and merchandising teams can focus on crafting stunning visuals, not on tedious, repetitive image grunt work. More creativity, less clicking!

**Speed Demon & Responsive Rockstar:** In the e-commerce race, speed wins. DIS helps you cross the finish line first by serving up images that are _just right_ for every scenario. No oversized behemoths slow down your product pages, and no pixelated thumbnails ruin your search results. This precision means faster page loads, which directly translates into happier customers, improved SEO, and ultimately, more conversions. Plus, DIS is your built-in responsive design partner, ensuring your storefront looks sharp and loads lightning-fast on any device, from desktops to smartphones. As I've discussed in my blog post, [From Lag to Riches: A PWA Kit Developer’s Guide to Storefront Speed](https://www.google.com/search?q=https://www.rhino-inquisitor.com/blog/from-lag-to-riches-a-pwa-kit-developers-guide-to-storefront-speed), performance is paramount.

**Flexibility That'll Make You Giddy:** Ever had a designer suddenly decide to change the entire product grid layout? From four items at 150x150 pixels to three at 250x250? Without DIS, that's a full-blown panic attack. With DIS? You tweak a few parameters in your templates, and _bam!_—new layout, perfectly sized images, no re-processing, no re-uploading, no re-assigning. Do you need a new promotional banner with a custom image size for a flash sale? Generate it instantly! (Ok...Ok, I might be a bit too optimistic here, some foresight and extra editor fields in Page Designer are needed for use-cases like this.)

This adaptability is pure gold. And here's the cherry on top: by using the official Script API for URL generation, your image URLs are future-proofed. Salesforce can change its internal plumbing all it wants; your code remains rock-solid, reducing technical debt and maintenance headaches.

```

					URLUtils.imageURL( '//image.png', { scaleWidth: 100, format: 'jpg' } );


```

**Caching Like a Boss (and CDN's Best Friend):** DIS isn't just dynamic; it's smart. It caches (limited) transformations to deliver images at warp speed. If your Commerce Cloud instance is hooked up to a Content Delivery Network (newsflash: it is -> the [eCDN](https://www.rhino-inquisitor.com/lets-go-live-ecdn/)), the CDN helps optimise caching as well (through TTL headers).

When you update an image, there's no need for manual cache invalidation thanks to a [technique](https://help.salesforce.com/s/articleView?id=cc.b2c_clear_ecdn_cache_task.htm&type=5) known as **URL fingerprinting/asset fingerprinting**. Instead of just replacing the old file, the platform creates a new URL for the updated image, often by adding a unique identifier (a "fingerprint"). Because the URL has changed, it forces browsers and the eCDN to download the new version as if it were a completely new file, bypassing the old cached version.

```

					/dw/image/v2/BCQR_PRD/on/demandware.static/-/Sites-master/default/dw515e574c/4.jpg


```

Do you notice that _dw515e574c_? It represents the unique "cache" ID managed by SFCC to ensure cached images are served. When the image updates, a new ID is generated so the customer _always_ sees the latest version!

Not "always" always The system behind this is somewhat of a black box to us, so there could still be delays before an image updates and becomes visible to customers.

## DIS Tips, Tricks, and How to Avoid Digital Disasters

To truly master DIS and avoid any "why isn't this working?!" moments, keep these developer commandments in mind.

### Embrace the Script API (Seriously, Do It!)

We can't stress this enough: use the [`URLUtils`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_web_URLUtils.html) and [MediaFile](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_content_MediaFile.html) Script API classes for generating your DIS URLs.

It's the official, validated, and future-proof way to do it. Here's a little snippet to get you started:



```

					var product = // obtain your product object
var thumbnailImage = product.getImage('thumbnail', 0);
if (thumbnailImage) {
    var imageUrl = thumbnailImage.getImageURL({
        scaleWidth: 100,
        format: 'jpg',
        quality: 85
    });
    // The 'imageUrl' variable now holds the dynamically generated URL
}


```

### Know Your Image Limits (and How to Work Around Them)

Even superheroes have weaknesses. DIS has a few, and knowing them is half the battle:

-   **Source Image Quality:** Always upload the largest, most beautiful, and highest-quality images you've. DIS is a master at shrinking and optimising, but it can't create pixels out of thin air (It's not an AI solution)!


-   **Size Matters (A Lot):** This is a big one. Images over 6MB in file size or larger than 3000x3000 pixels? DIS will politely decline to transform them and serve them up in their original, unoptimized glory. The first time you request an oversized image, you may encounter an error; however, subsequent requests typically proceed without issue. The takeaway? Keep your source images just under these limits (think 5.9MB or 2999x2999 pixels) to ensure DIS always works its magic.

    _**Note**: [One source](https://help.salesforce.com/s/articleView?id=000391251&type=1) states a 10MB limit in the documentation, but to be cautious, always follow the 6MB limit._


-   **Transformation Timeout:** DIS has a 29-second deadline. If a transformation is super complex (especially on animated GIFs, where every frame needs processing), it might time out, giving you a dreaded 408 error. If you hit this, simplify your transformations or pre-process those extra-fancy assets.


-   **Cropping's Four Musketeers:** If you're cropping, remember `cropX`, `cropY`, `cropWidth`, and `cropHeight` are a package deal. All four must be present, or no cropping happens!



### Transform DIS PNG to JPG

When it comes to image formats, transforming **PNG** files to **JPEG** using the SFCC Dynamic Image Service can be a **game-changer**, especially when you don't need those transparent backgrounds. This simple trick alone can significantly **reduce file sizes**, leading to faster page loads and a smoother user experience.

Here's how you might implement this in a **controller:**

```

					'use strict';
var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var URLUtils = require('dw/web/URLUtils');
/**
 * @name Product-ImageExample
 * @function
 * @memberof Product
 * @description A controller endpoint that demonstrates the correct way to generate
 * a transformed image URL for a given product.
 */
server.get('ProductImageExample', function (req, res, next) {
    // 1. Retrieve the product object using the Product Manager.
    // The product ID should be passed as a query string parameter, e.g.,?pid=12345
    var product = ProductMgr.getProduct(req.querystring.pid);
    var imageUrl = ''; // Initialize a default empty URL.
    // 2. Check if the product and its image exist before proceeding.
    if (product) {
        // 3. Get the MediaFile object for the 'large' view type.
        var productImage = product.getImage('large', 0);
        if (productImage) {
            // 4. Generate the transformed URL using getImageURL() on the MediaFile object.
            // Here, we convert a PNG to a JPG and specify a white background.
            imageUrl = productImage.getImageURL({
                'format': 'jpg',
                'bgcolor': 'ffffff' // Use a 6-digit hex code for the color.
            }).toString(); // Convert the URL object to a string for the template.
        }
    }
    // 5. Render a template, passing the generated URL to be used in an  tag.
    res.render('product/productimage', {
        productImageURL: imageUrl
    });
    // It is standard practice to call next() at the end of a middleware function.
    next();
});
// Export the controller module.
module.exports = server.exports();


```

### General Image Zen for Speed and Quality

DIS is powerful, but don't forget the fundamentals of image optimisation:

-   **Responsive Images (`srcset` & `sizes`):** These [attributes](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/b2b-d2c-comm-image-optim.html) are your best friends for letting browsers pick the perfect image resolution for a user's device and viewport. Less data, faster loads!


-   **Prevent Layout Jumps (CLS):** Always specify the `width` and `height` attributes for your images. This reserves space, preventing annoying layout shifts that make your site feel janky and hurt your Core Web Vitals.


-   **Pre-Compress (Gently):** While DIS handles quality, a little pre-compression on your source images (especially removing unnecessary metadata) can reduce file size by up to 30% without compromising visual quality.


-   **Leverage the CDN:** DIS already plays nicely with Salesforce's [Content Delivery Network](https://www.rhino-inquisitor.com/lets-go-live-ecdn/). This means your images are cached and delivered from servers closer to your global audience, making them appear almost instantly.


### Troubleshooting: When Things Go Sideways

-   **"My image isn't transforming!"** First suspect: file size or dimensions. Check those 6MB and 3000x3000 pixel limits.


-   **"408 Timeout Error!"** If you're seeing this, especially with animated GIFs or huge images that undergo numerous transformations, you're approaching the 29-second limit. Simplify or pre-process.

-   **General Sluggishness:** Remember, images are just one piece of the performance puzzle. If your storefront is still slow, look for other potential culprits, such as poorly optimised custom code, complex reports, or inefficient API calls. Regular code audits are your friend!


## When Not to Use It (Or When to Be Extra Careful)

[![A cartoon illustration depicting a massive traffic jam of oversized, unoptimized images attempting to enter a cloud icon, which appears overwhelmed and unable to process the volume. The images are backed up on a road leading to the cloud, symbolizing a system bottleneck or overload.](https://www.rhino-inquisitor.com/wp-content/uploads/2025/07/dis-traffic-jam-1024x559.jpeg)](https://www.rhino-inquisitor.com/wp-content/uploads/2025/07/dis-traffic-jam-scaled.jpeg)

Image Overload: When Your Service Gets Jammed

While DIS is a superhero, even superheroes have their kryptonite. There are a few scenarios where DIS might not be your go-to, or where you need to tread with extra caution:

-   **When Your Images Are Absolute Giants:** Remember those 6MB file sizes and 3000x3000 pixel dimension limits? If your source images consistently blow past these thresholds, DIS won't transform them. Instead, they'll be served in their original, unoptimized glory. This results in slower load times and a subpar user experience, particularly on mobile devices. For truly massive, high-fidelity assets (think ultra-high-res hero banners or interactive 360-degree product views that require large file sizes), you may need to consider specialised external image services or alternative hosting solutions that can handle and optimise such large files, or simply serve the original if the performance impact is minimal.

-   **For Super Complex, "Expensive" Transformations:** DIS has a 29-second timeout for transformations. If you're trying to perform multiple, intricate operations on a very large image, or especially on animated GIFs (where every single frame needs processing), you may encounter this wall and receive a 408 timeout error. If your use case demands such complex, real-time transformations, you might need to pre-process these assets offline or explore dedicated, more powerful image processing platforms designed for extreme computational demands.

-   **When Images Aren't Hosted on Commerce Cloud Digital:** DIS only works its magic on images that are stored within your Commerce Cloud Digital environment. If your images are hosted externally (e.g., on a third-party DAM or a different CDN not integrated with Commerce Cloud's asset management), DIS won't be able to touch them. In such cases, you'd rely on the capabilities of your external hosting solution for image optimisation.

-   **For Very Simple, Static Images with No Transformation Needs:** If you have a tiny, static icon or a simple logo that never changes size, format, or quality, and you don't anticipate any future dynamic needs, the overhead of routing it through DIS might be overkill. While DIS is designed for flexibility, for truly unchanging, small, and already optimised assets, direct static hosting might be marginally simpler, though the benefits of DIS's caching and CDN integration often outweigh this. However, given the "future-proofing" aspect, it's generally still a good idea to use DIS for consistency.

-   **You Need More Modern Features:** If you've been in the SFCC space for some time, you've likely noticed that little has changed regarding image resizing and format support over the years, although formats like WebP are managed by the eCDN. For those seeking the newest formats like [AVIF](https://en.wikipedia.org/wiki/AVIF), you'll need to look elsewhere at this time.
    _
    **Note:** The WebP transformation is handled by the [eCDN](https://www.rhino-inquisitor.com/lets-go-live-ecdn/), specifically through its configuration feature known as "the image Polish options," rather than by the DIS._


[![A cartoon illustration showing a fork in the road. One path leads to a cloud labeled "Dynamic Image Service (DIS)," and the other, larger path, leads to icons representing a "Third Party CDN/DAM" and "Digital Asset Management System." A developer character is pointing towards the CDN/DAM path, indicating a choice for image management solutions.](https://www.rhino-inquisitor.com/wp-content/uploads/2025/07/sfcc-when-not-to-use-dis-1536x838.jpeg)](https://www.rhino-inquisitor.com/wp-content/uploads/2025/07/sfcc-when-not-to-use-dis-scaled.jpeg)

Deciding between Salesforce's native DIS and external CDN/DAM solutions often comes down to specific project needs and existing infrastructure.

## Is it still useful for PWA Kit projects? (Spoiler: YES, and here's why!)

**Absolutely, unequivocally, 100% YES!** DIS isn't just relevant for PWA Kit projects; it's arguably _more_ crucial. Modern headless storefronts, like those built with PWA Kit, thrive on speed, flexibility, and that buttery-smooth, app-like user experience.

Dynamic image transformation is practically a prerequisite for achieving that.

### Page Designer's Best Friend & Product Image Powerhouse

DIS integrates beautifully with Page Designer within PWA Kit. Page Designer, for the uninitiated, is Business Manager's visual editor, which allows marketers to build dynamic, responsive pages without writing a single line of code (well, at least once all the components are developed 😇).

Where do your product images live? In Commerce Cloud, of course! Which means DIS is the star player for serving them up. Page Designer components can then tap into DIS to display product images, content assets, or any other visual element, ensuring they're perfectly optimised for whatever device your customer is using.

### The DynamicImage Component: Your PWA Kit Sidekick

PWA Kit even has a dedicated [DynamicImage](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/32763402f434b6b931ddce986372c9f0a386ee89/packages/template-retail-react-app/app/components/dynamic-image/index.jsx#L23) component that makes integrating with DIS a breeze. This component is designed to handle image transformations by mapping an array of widths to the correct `sizes` and `srcset` attributes, simplifying responsive image strategies directly within your React components.

## Official Documentation Links

-   **Salesforce B2C Commerce Dynamic Imaging Service Overview**: [https://help.salesforce.com/s/articleView?id=cc.b2c\_image\_transformation\_service.htm&language=en\_US&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_image_transformation_service.htm&language=en_US&type=5)
-   **PWA Kit Page Designer Integration**: [https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html)
-   **MediaFile Script API**: [https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class\_dw\_content\_MediaFile.html](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_content_MediaFile.html)
-   **URLUtils Script API**: [https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class\_dw\_web\_URLUtils.html](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_web_URLUtils.html)

---
title: What is OCI (Omnichannel Inventory)
description: >-
  OCI (Omnichannel Inventory) is an offering part of Salesforce Commerce Cloud.
  But what is it, and why should you use it?
date: '2022-08-08T14:35:58.000Z'
lastmod: '2022-11-19T10:09:21.000Z'
url: /what-is-oci-omnichannel-inventory/
draft: false
heroImage: /wp-content/uploads/2022/05/omnichannel-inventory.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - oci
  - sfcc
author: Thomas Theunen
---
OCI ([Omnichannel Inventory](https://trailhead.salesforce.com/content/learn/modules/omnichannel-inventory)) has been a part of the Salesforce B2C Commerce Cloud offering for a while. Originally it was part of the OMS ([Order Management](https://www.salesforce.com/products/commerce-cloud/ecommerce/order-management/), but it was decided to split it off as a separate product to provide a flexible offering.

But why should you use it? And if you decide to use this product, what are the things to keep in mind?

## Wait?!! It's included in the B2C license

[![Quip note highlighting that OCI is included for B2C Commerce customers.](/media/2022/oci-included-in-license-b4aca05118.png)](/media/2022/oci-included-in-license-b4aca05118.png)

Let us first get this topic out of the way; I am sure this information will increase the interest in this product!

**_If you are a B2C Commerce Cloud customer, OCI is included!_**

I only learned about this because I took the OMS Administrator and Developer certification exam (and passed 😊).

## What is OCI

Omnichannel Inventory is an offering that provides near real-time inventory information at the location level for an [omnichannel](https://en.wikipedia.org/wiki/Omnichannel) experience. But what does that mean?

The OCI exists out of multiple components:

- **Omnichannel Inventory service:** An API-first approach service that allows you to get and manage inventory information across all of your fulfillment channels.

- **Omnichannel Inventory App:** A Salesforce console app to manage your locations and inventory availability in the [visual interface you know and love](https://www.salesforce.com/campaign/lightning/).

   [![Omnichannel Inventory app interface for managing locations and availability.](/media/2022/omnichannel-inventory-0b29da8f29.png)](/media/2022/omnichannel-inventory-0b29da8f29.png)

The Omnichannel Inventory provides a set of Headless APIs so any system can communicate with it to get the latest inventory information, be it your website, app, or any other system connected to the web (which can include your physical stores).

Using OCI brings the following benefits:

- **Granular location visibility:** Manage location-level inventory availability.

- **Powerful grouping:**  Segment inventory by combining multiple locations. For example, merge your EU-located warehouses to one location group for a Salesforce B2C Commerce Cloud channel.

- **Flexibility:** Easily add or remove a location.

- **Centralized visibility:**  View availability information across all of your channels.

- **Accuracy at scale:** Gain near real-time insights into availability to prevent costly underselling and overselling during flash sales or holidays! And this is important as many systems struggle to get a near real-time view, causing mispicks in the warehouse.

- **Omnichannel:** Easily support omnichannel experiences, such as ship from store and buy online, pick up in-store (BOPIS)

[![An overview of grouping inventory locations together into delivery groups. It shows for example a Physicial store and warehouse being merged to an inventory group to use for online delivery as a single "list".](/media/2022/inventory-grouping-6f9edbe7b9.png)](/media/2022/inventory-grouping-6f9edbe7b9.png)

Example of location grouping

## Natively integrated

This might be a sentence you have heard before and are skeptical about. But in this case, you can lower your guard a little bit.

The Omnichannel Inventory comes natively integrated with Salesforce B2C Commerce Cloud! Once activated, a few things change how things work in the Business Manager and how developers access APIs.

In a few sentences: "Once this has been enabled by support/CSM (Customer Success Manager), your Inventory Lists are fed with data from the OCI, rather than having to manage or import them via a different channel into SFCC."

You still have to upload that data to the OCI! It is just a different system that you integrate with to update inventory information.

But you do not have to think about getting that data to Salesforce B2C Commerce Cloud; these updates are also near real-time!

### Documentation

- [Data Synchronisation (B2C <> OCI)](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/inventory/b2c_inventory_management_omnichannel_inventory.html)
- [API Documentation (Salesforce Help)](https://help.salesforce.com/articleView?id=inv_omnichannel_inventory_service.htm)
- [Trailhead: Omnichannel Inventory](https://trailhead.salesforce.com/content/learn/modules/omnichannel-inventory?trailmix_creator_id=rr820768&trailmix_slug=tcs-omnichannel-inventory)
- [Training: Omnichannel Inventory](https://partnerlearningcamp.salesforce.com/s/browse-catalog?plc__recordId=fvb19UvtLP1ohuV8EthlGEFZQ0vGXPFygtDSet8YjuK0Vmu6uWVIqSToV0n%2Bdisz)

## Should I use OCI

This depends on your situation and if you need this amount of flexibility. Have a good look at your current needs and the roadmap before making this decision.

If you only have one location from which you ship, have no plans for features such as BOPIS, and do not plan to add more warehouses, you might not need OCI just yet.

### API First

Since OCI is an API First approach service, some features are only available through REST services. Keep this in mind when planning, as getting to know the ins and outs of OCI will take longer than how inventory lists work.

These features are available in the OCI Application on force.com:

- Look up available inventory for an SKU.
- View, add, edit, and delete locations.
- View, add, edit, and delete location groups.
- Assign locations to location groups.
- Remove locations from location groups.
- Commit location and location group updates.

 As you can see, there is only an interface to look up inventory. But not to update or delete it!

### Not as "easy" to set-up as Inventory Lists

Since we are working with REST JSON APIs rather than XML files that can be put on an SFTP or WebDAV, expect to be spending more time to set this up in both Salesforce B2C Commerce Cloud and in the OCI itself.

As with many things, with more flexibility comes more **complexity**. An excellent example is how to import inventory, [have a look](https://developer.salesforce.com/docs/commerce/commerce-api/references/impex?meta=submitInventoryImport)! Felt like something was missing in the documentation there? Not to worry, it was on the [Summary page](https://developer.salesforce.com/docs/commerce/commerce-api/references/impex?meta=Summary).

Have a good read on that summary page, it should give you a clear understanding of the complexity you need to take into account.

### It adds other complexities

We are heading into "composable" territory here, which adds complexity to your architecture. And what do I mean what that:

- There is no management interface available, as mentioned in one of the previous items.
- Since it is a separate system, you need to keep track of that in your architecture (e.g., consider possible data or performance issues).
- It is a separate system for merchandizers to view and manage the inventory (to the extent possible) besides the regular Business Manager.

### Development needed

You can ignore this topic if you just want the standard Inventory List functionality. But development in Salesforce B2C Commerce Cloud is still required when:

- You want to do real-time inventory checks on the PDP/Checkout
- Implement BOPIS
- Want a management interface for the inventory

   Integration You also need to do the integration with OCI through the REST APIs that are available.

### It can't do everything

While Omnichannel Inventory offers many vital benefits, keep in mind that it does not replace the inventory system of record, supply chain management, warehouse management, and other systems you depend on to run your retail operations.

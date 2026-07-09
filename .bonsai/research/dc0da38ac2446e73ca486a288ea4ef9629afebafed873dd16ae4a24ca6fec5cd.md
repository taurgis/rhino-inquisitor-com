---
schema_version: 1
artifact_type: source
source_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html
source_urls:
  - https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html
  - https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.md
normalized_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html
cache_key: dc0da38ac2446e73ca486a288ea4ef9629afebafed873dd16ae4a24ca6fec5cd
topic: 
tags:
  - commerce
  - api
  - client
  - slas
  - access
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-07-09T17:39:29.511Z
validated_at: 2026-07-09T17:39:29.511Z
stale_after: 2026-08-08T17:39:29.511Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "9303373adf965473e13aadea36b26445"
last_modified: Thu, 09 Jul 2026 01:19:22 GMT
content_hash: f94420a9dcbf4525b25be4ee58b066ae4cb1e92b0d71b26095c7cfd55e0fcee6
token_estimate:
  compressed: 555
  detailed: 815
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.md
search_provider: 
parent_cache_key: 
section_anchor: 
section_heading_path: 
---

## Summary

Set Up API Access

## Compressed

# Set Up API Access

Enable your PWA Kit storefront to securely access data from Shopper APIs, including products, baskets, orders, and more.

:::note The setup process has recently been streamlined thanks to the new SLAS Admin UI. :::

## Before You Begin

Complete the instructions in [Authorization for Shopper APIs] in the B2C Commerce API documentation to create a SLAS client.

If you’re planning to do a [phased rollout] of a PWA Kit experience, make sure to follow the instructions in the [Extra Steps for Phased Rollouts of PWA Kit] section of the guide.

After creating a SLAS client, return to this guide and read on.

## Set the Client Secret

If you are using a SLAS private client, you must set the client secret via an [environment variable].

:::note Projects generated from PWA Kit 3.5 and above will be configured to use a SLAS private client by default.

To learn more about using SLAS private clients, see [Using A Slas Private Client]. :::

If you are using a SLAS public client, skip this section and continue with updating your OCAPI settings as described in the next section.

## Update Open Commerce API Settings

For certain features, your PWA Kit storefront must make requests to the Open Commerce API (OCAPI) on your B2C Commerce instance.

Here’s how to update your OCAPI settings for PWA Kit:

1. Log in to Business Manager on your B2C Commerce instance.
2. Click App Launcher  and then select **Administration** > **Site Development** > **Open Commerce API Settings**.
3. Copy this JSON:

```json
{
  "_v": "21.3",
  "clients": [
    {
      "client_id": "PLACEHOLDER_CLIENT_ID",
      "resources": [
        {
          "resource_id": "/sessions",
          "methods": ["post"],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        }
      ]
    }
  ]
}
```

4. Go back to Business Manager and paste the JSON into the field.
5. Replace the placeholder value for `PLACEHOLDER_CLIENT_ID` with the client ID for the public SLAS client that you created using the SLAS Admin UI.
6. Scroll down to the bottom of the page.
7. Click **Save**.

Repeat these instructions for each B2C Commerce instance that is used with PWA Kit.

## See Also

- [Build and Customize]

## Detailed

# Set Up API Access

Enable your PWA Kit storefront to securely access data from Shopper APIs, including products, baskets, orders, and more. The technology that authorizes this API access is called the **Shopper Login and API Access Service (SLAS)**, which is part of the Salesforce B2C Commerce API. In addition to authorizing API requests to the B2C Commerce API, SLAS also authorizes API requests to the Open Commerce API (OCAPI).

:::note
The setup process has recently been streamlined thanks to the new SLAS Admin UI.
:::

## Before You Begin

Complete the instructions in [Authorization for Shopper APIs](/docs/commerce/b2c-commerce/guide/authorization-for-shopper-apis.html) in the B2C Commerce API documentation to create a SLAS client. We encourage you to use a SLAS private client but depending on your use case, you could opt to use a SLAS public client instead.

If you’re planning to do a [phased rollout](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html) of a PWA Kit experience, make sure to follow the instructions in the [Extra Steps for Phased Rollouts of PWA Kit](/docs/commerce/b2c-commerce/guide/authorization-for-shopper-apis.html#extra-steps-for-phased-rollouts-of-pwa-kit) section of the guide.

After creating a SLAS client, return to this guide and read on.

## Set the Client Secret

If you are using a SLAS private client, you must set the client secret via an [environment variable](/docs/commerce/b2c-commerce/guide/use-a-slas-private-client.html#set-environment-variables).

:::note
Projects generated from PWA Kit 3.5 and above will be configured to use a SLAS private client by default.

To learn more about using SLAS private clients, see [Using A Slas Private Client](/docs/commerce/b2c-commerce/guide/use-a-slas-private-client.html).
:::

If you are using a SLAS public client, skip this section and continue with updating your OCAPI settings as described in the next section.

## Update Open Commerce API Settings

For certain features, your PWA Kit storefront must make requests to the Open Commerce API (OCAPI) on your B2C Commerce instance.

Here’s how to update your OCAPI settings for PWA Kit:

1. Log in to Business Manager on your B2C Commerce instance.
2. Click App Launcher ![App Launcher](https://a.sfdcstatic.com/developer-website/sfdocs/commerce-cloud/media/shared/appLauncher.png) and then select **Administration** > **Site Development** > **Open Commerce API Settings**.
3. Copy this JSON:

```json
{
  "_v": "21.3",
  "clients": [
    {
      "client_id": "PLACEHOLDER_CLIENT_ID",
      "resources": [
        {
          "resource_id": "/sessions",
          "methods": ["post"],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        }
      ]
    }
  ]
}
```

4. Go back to Business Manager and paste the JSON into the field.
5. Replace the placeholder value for `PLACEHOLDER_CLIENT_ID` with the client ID for the public SLAS client that you created using the SLAS Admin UI.
6. Scroll down to the bottom of the page.
7. Click **Save**.

Repeat these instructions for each B2C Commerce instance that is used with PWA Kit.

## See Also

- [Build and Customize](/docs/commerce/b2c-commerce/guide/build-customize.html)

## Provenance

Fetched from https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html on 2026-07-09T17:39:29.511Z
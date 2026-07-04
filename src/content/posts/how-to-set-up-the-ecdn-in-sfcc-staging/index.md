---
title: How to set up the eCDN for Staging in Salesforce B2C Commerce Cloud
description: >-
  New APIs have been made available to manage certificates on the staging eCDN
  ourselves. But how does it work? What do I need to keep in mind?
date: '2022-11-07T10:29:05.000Z'
lastmod: '2026-07-04T14:48:28.000Z'
url: /how-to-set-up-the-ecdn-in-sfcc-staging/
draft: false
heroImage: ssl-certificate-tw-8422f4751c.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - headless
  - scapi
  - sfcc
  - technical
aliases:
  - /how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/
author: Thomas Theunen
takeaways:
  - "Documents the legacy API-first path for configuring staging eCDN zones, certificates, and DNS in SFCC"
  - "Explains the sequence from API client setup through zone creation, certificate upload, and hostname verification"
  - "Flags that the approach is now deprecated because staging vanity domains can be managed in Business Manager"
---
> [!WARNING]
> **Deprecated article:** Since the writing of this article, the eCDN Business Manager module has been updated to allow configuration of vanity domains on staging. Therefore, there is no need to use API calls as described in this article unless you really, really want to.

Read all about it [in the staging eCDN Business Manager release note](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_configure_ecdn_for_staging_in_bm.htm&type=5).

Using the [Business Manager module](/lets-go-live-ecdn/), setting up custom vanity domains and uploading certificates on the production instance is easy. But how about staging?

Until recently, we needed to contact support to set up custom vanity domains with a valid certificate on the staging instances. Luckily that has changed, and now we can fully control the domains and certificates for staging "just like production".

Yes, it has been put between quotes. Let us find out why!

## API First

In an API-first manner, REST APIs are available to manage the eCDN (Cloudflare) for all our environments. But unlike production, there is yet to be a Business Manager module available to do this on staging.

## Step 1: Create an API Client

To connect to the SCAPI, we need to create an API client with the correct scopes:

- sfcc.cdn-zones
- sfcc.cdn-zones.rw

Salesforce [has written a guide](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=Summary#before-you-begin) on the developer support site to create an API Client for this use case.

**tenantID:** The tenantID mentioned in the guide is the Realm ID (zzxx) combined with the Instance ID (001). This information is shown in the next step of this guide on the staging instance.

e.g. **zzxx\_001**. Remember to assign the Salesforce Commerce API role to the API Client.

{{< img-caption src="commerce-cloud-api-client-roles-1a338d1f61.jpg" alt="Account Manager roles screen with the Salesforce Commerce API role enabled for staging." caption="API client roles for staging eCDN" link="commerce-cloud-api-client-roles-1a338d1f61.jpg" >}}

## Step 2: Get the staging credentials

Since the "CDN Zones" API is part of the SCAPI, we need to get our environment-specific credentials from the business manager. In this case, that is our Staging instance.

We get these settings here:

"Administration > Site Development > Salesforce Commerce API Settings"

{{< img-caption src="salesforce-commerce-api-settings-be8d59fe5b.jpg" alt="Salesforce Commerce API Settings screen with the short code and organization ID for staging." caption="Staging Commerce API settings" link="salesforce-commerce-api-settings-be8d59fe5b.jpg" >}}

## Step 3: Get an access token

To communicate with the [Zones API](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=Summary), we need a bearer token. This is fetched using the following API call to the Account Manager

**tenantID:** The tenantID combines the Realm ID and the Instance ID with an underscore (e.g. **zzxx\_001**).

```bash
curl -i -k \
--data 'grant_type=client_credentials&scope=SALESFORCE_COMMERCE_API:<tenantID> sfcc.cdn-zones sfcc.cdn-zones.rw' \
--user '<client-id>:<client-secret>' \
-X POST 'https://account.demandware.com/dwsso/oauth2/access_token'
```

If all goes well, a response similar to the one below appears.

```json
{
  "access_token": "<bearer-token-truncated-for-readability>",
    "scope": "SALESFORCE_COMMERCE_API:zzxx_001 sfcc.cdn-zones sfcc.cdn-zones.rw",
    "token_type": "Bearer",
    "expires_in": 1799
}
```

## Step 4: Get all zones

First, check that we can use our newly fetched "access\_token" to call the Zones API. This information can be obtained by making a GET call to the "[Get zones info](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=getZonesInfo)" endpoint.

shortCode and organizationId The shortCode and organizationId in the URL below are obtained in step 2.

```text
https://{shortCode}.api.commercecloud.salesforce.com/cdn/zones/v1/organizations/{organizationId}/zones/info
```

If all the steps have been adhered to above, a response like the one below will magically appear!

```json
[{
  "zoneId": "example1-zone-Id",
  "name": "example1.com",
  "status": "pending"
}]
```

## Step 5: Create a zone (register domain)

Now that it is confirmed that API calls can be made, the first step in creating a custom domain for the Staging environment can be done: "Creating a zone in Cloudflare".

To achieve this, the following API call must be made to the "[Create storefront zone](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=createStorefrontZone)" endpoint:

Top-level domain In this step, the top-level domain is used even if you plan to use a subdomain for Staging.
e.g. To use "stg.cc-merchant.com", "cc-merchant.com" is submitted in the request of this step.

```bash
curl "https://{shortCode}.api.commercecloud.salesforce.com/cdn/zones/v1/organizations/{organizationId}/storefront-zones" \
-X POST \
-d "{\n  \"domainName\": \"cc-merchant.com\"\n}"
```

If the zone did not exist already and is created successfully, the following response is given:

```json
{
  "data": {
    "zoneId": "023e105f4ecef8ad9ca31a8372d0c353",
    "zoneName": "stg-zzzz-cc-merchant-com.cc-ecdn.net",
    "createdOn": "2022-01-01T05:20:00.12345Z",
    "status": "active"
  }
}
```

Status The status could also be "pending". Give Cloudflare a bit of time to process your request. It is always possible to do the GET call in step 3 to keep an eye on it.

## Step 6: Upload the certificate

Certificate and Private Key Before starting this step, please ensure you have acquired the certificate and private key. These are TXT files that the person who purchased the certificate has.

Finally, we get to the "goal": Uploading the certificate. To do that, an API call is made to the "[Add certificate for zone](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=addCertificateForZone)" endpoint.

```text
https://{shortCode}.api.commercecloud.salesforce.com/cdn/zones/v1/organizations/{organizationId}/zones/{zoneId}/certificates
```

This is a POST call with the following body:

```json
{
  "hostname": "cc-merchant.com",
  "certificate": "<escaped-certificate-pem>",
  "privateKey": "<escaped-private-key-pem>"
}
```

When the request succeeds, and the certificate is checked to be valid, the information needed for the next step is in the response.

```json
{
  "certificateId": "3822ff90-ea29-44df-9e55-21300bb9419b",
  "status": "EXPIRED",
  "hosts": [
    "example.com",
    "www.example.com"
  ],
  "expiresOn": "2021-01-01T05:20:00Z",
  "uploadedOn": "2016-01-01T05:20:00Z",
  "issuer": "DigiCert",
  "signature": "SHA256WithRSA",
  "customHostnameVerificationTXTName": "_example.com",
  "customHostnameVerificationTXTValue": "4c9c3f4f-2e91-4c5d-a902-f12f9c285b9e",
  "customHostnameId": "354a48f6-3d98-4c15-9312-211984ee8518",
  "customHostname": "cc-merchant.com",
  "customHostnameStatus": "PENDING"
}
```

Status Notice that the customHostnameStatus is "PENDING".

### Encoding the certificate and key

Since JSON is used, the body of our request needs to be safe to use in that manner.

Certificates and Private Keys tend to have several new line characters incompatible with JSON.

These need to be "escaped". Luckily, many online [tools](https://www.freeformatter.com/json-escape.html) can help you with this chore.

> **Security:** Don't trust just any tool online with this data. The private key is sensitive information.

## Step 7: Validate ownership of the domain

For this step, we need the person who manages the DNS records of the domain in question. To prove we own this domain to Cloudflare, a txt record must be added to its configuration.

The data of this TXT record was in the response of the previous step:

```text
{
  ...
  "customHostnameVerificationTXTName": "_example.com",
  "customHostnameVerificationTXTValue": "4c9c3f4f-2e91-4c5d-a902-f12f9c285b9e",
  ...
}
```

Once this record is added, the "[Get certificates](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=getCertificates)" endpoint is available to track the status. As soon as it changes to "ACTIVE", you can go to the next step!

## Step 8: Update the DNS records

The final step is to set the CNAME record in the DNS for the domain.

This is the combination of "commcloud.`<zone\_name>`".

The "zone\_name" was retrieved in step 4 when the zone was created. It is always possible to do the "[Get zones info](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=getZonesInfo)" API call to get this information.

An example:

```text
commcloud.stg-zzzz-cc-merchant-com.cc-ecdn.net
```

## Step 9: Business Manager (Optional)

If you make use of vanity domains in the business manager, you will have to contact Support in order to manage this "zone" through the API.

> Post-migration tasks validate your eCDN traffic flow and setup. To complete the post-migration process, coordinate with Commerce Cloud Engineering.Commerce Cloud Engineering creates and activates a staging Business Manager zone to handle your Business Manager traffic that goes through only your Business Manager host name, for example, staging-`<realm>`-`<customer>`.demandware.net. Business Manager doesn’t have an eCDN management page for staging instances.
> Commerce Cloud Engineering services include the demandware.net lockdown protections that protect your production and development instances.
> _**Post-migration tasks:**_
> 1\. **Revert to the \*.demandware.net certificate at the origin:** This step applies to custom certificates installed to the POD for the staging instance. Commerce Cloud Engineering validates that traffic is flowing through eCDN for the configured host names. After validation, the certificate at the origin level is reverted back to the standard \*.demandware.net certificate. The Salesforce Commerce API (SCAPI) can then connect to your staging instance.
> 2\. **Create and activate a staging Business Manager zone:** Commerce Cloud Engineering creates and activates the Business Manager zone for your implementation.
> If you use the self-service steps to create an eCDN zone and certificate, contact SFCC Support. They contact Commerce Cloud Engineering to create and activate a staging Business Manager zone.
> If you implement an existing custom certificate for your staging instance, Commerce Cloud Engineering creates and activates the staging Business Manager zone without a GUS request. You can request to opt out of this component.
> Infocenter (04/05/2023)

## All done

After all of these steps are complete, the domain can be used to reach the staging environment with a valid certificate!

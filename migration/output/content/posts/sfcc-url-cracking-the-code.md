---
title: 'The Salesforce B2C Commerce Cloud URL: Cracking the Code'
description: >-
  It should be no secret that a URL is a vital part of any website In this
  article, we will dissect and explain the different parts of a Salesforce B2C
  Co...
lastmod: '2023-05-29T11:16:52.000Z'
url: /sfcc-url-cracking-the-code/
draft: false
date: '2023-05-29T07:12:19.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - headless
  - sfcc
  - technical
author: Thomas Theunen
---
It should be no secret that a URL is a vital part of any website In this article, we will dissect and explain the different parts of a Salesforce B2C Commerce Cloud URL and provide code examples on how to access this information [in an SFCC controller and React using the useLocation() hook](https://www.rhino-inquisitor.com/what-does-the-composable-storefront-mean-for-sfcc-developers/).

## The URL Structure

![Anatomy of a B2C Commerce Cloud URL](https://www.rhino-inquisitor.com/wp-content/uploads/2023/06/anatomy-of-a-url-768x180.png)

A typical Salesforce B2C Commerce Cloud URL consists of the following components:

1\. Protocol (https only)
2\. Domain & Subdomain (your site's domain)
3\. Path (Including the Pipeline Name in non-SEO URLs)
5\. Query Parameters (optional, used to pass additional data to a server-side controller or React component)

Example URLs:

```

					https://www.example.com/on/demandware.store/Sites-MySite-Site/en_US/MyPipeline-MyAction?param1=value1¶m2=value2


```

```

					https://www.example.com/my-site/en_US/route?param1=value1¶m2=value2


```

## Protocol

The protocol is the foundation of how data is transmitted across the internet. In a Salesforce B2C Commerce Cloud URL, the protocol is [HTTP](https://en.wikipedia.org/wiki/HTTP) (Hypertext Transfer Protocol) or [HTTPS](https://en.wikipedia.org/wiki/HTTPS) (Hypertext Transfer Protocol Secure). HTTP is the standard protocol for transmitting data between a web server and a browser, while HTTPS is a more secure version that uses encryption to protect the data being sent.

[Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/) only allows HTTPS and has blocked the use of HTTP for quite a few years now. When working locally with the PWA Kit, HTTP is used, however.

```

					// SFRA - SiteGenesis
request.getHttpProtocol();
// PWA KIT Client Side
window.location.protocol
// PWA Kit Server Side (getProps)
req.protocol



```

## Domain & subdomain

```

					// SFRA - SiteGenesis
request.getHttpHost();
// PWA KIT Client Side
window.location.hostname
// PWA Kit Server Side (getProps)
req.hostname


```

The [domain](https://en.wikipedia.org/wiki/Domain_name) is the unique address of your website on the internet. It is the identifier that users will type into their browser to access your site, and search engines also use it to index.

In a Salesforce B2C Commerce Cloud URL, the domain represents your site's custom domain or a subdomain provided by Salesforce.

Choosing a domain that is easy to remember and represents your brand is crucial, as it plays a vital role in your site's visibility and credibility.

## Path

```

					// SFRA - SiteGenesis
request.getHttpPath();
// PWA KIT
import {useLocation} from 'react-router-dom'
const { pathname } = useLocation()



```

The "[path](https://en.wikipedia.org/wiki/URL)" of a URL refers to the hierarchical structure of a website that designates the specific location of a resource, such as a web page, an image, or a file, on the web server. The path helps users and search engines navigate and understand the organisation of a website's content. It is an essential part of the URL, following the domain name and starting with a forward slash (/).

A URL path is typically organised into multiple segments, separated by forward slashes. Each segment represents a level in the site's hierarchical structure. The leftmost segment is the highest level, and the following segments represent subdirectories or resources within the higher-level directories.

For example, in the URL "https://www.example.com/blog/2021/post-title", the path is "/blog/2021/post-title". This path indicates that the specific web page is located within the "2021" subdirectory of the "blog" directory on the server.

A well-structured and descriptive URL path can improve a website's search engine optimization (SEO) and user experience (UX) by making it easier for users and search engines to understand the relationship between different pages and resources on the site.

## Query Parameters

```

					// SFRA - SiteGenesis
request.getHttpParameterMap();
request.getHttpParameters();
request.getHttpQueryString();
// PWA KIT
import {useLocation} from 'react-router-dom'
const { search } = useLocation()



```

[Query parameters](https://en.wikipedia.org/wiki/Query_string) are optional components of a Salesforce B2C Commerce Cloud URL that are used to pass additional data to a server-side controller. They are key-value pairs that are appended to the end of the URL, starting with a question mark (?) and separated by an ampersand (&). Query parameters can transmit data such as filters, search terms, or pagination information. You can create dynamic and interactive user experiences by utilising query parameters and optimising your site's performance.

## Not rocket science

Fortunately, obtaining this information is not rocket science, and it can be easily accessed. But having a cheat sheet can be quite helpful, don't you think?

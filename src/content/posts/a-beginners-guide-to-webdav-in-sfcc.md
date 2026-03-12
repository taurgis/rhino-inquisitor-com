---
title: Beginner's Guide to WebDAV in SFCC
description: >-
  File Management is critical and necessary in any project. How else can we work
  with mass data transfers or logging mechanisms?
date: '2024-01-01T17:06:50.000Z'
lastmod: '2023-12-31T19:52:11.000Z'
url: /a-beginners-guide-to-webdav-in-sfcc/
draft: false
heroImage: /media/2023/webdav-storing-files-scaled-8c216a580f.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
  - webdav
author: Thomas Theunen
---
File Management is critical and necessary in any project. How else can we work with mass data transfers or logging mechanisms? This blog post will explore WebDAV and its use in [Salesforce B2C Commerce Clou](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/)d. We'll also discuss connecting to WebDAV using Basic Authentication and API Key.

## What is WebDAV?

[Web Distributed Authoring and Versioning](https://nl.wikipedia.org/wiki/WebDAV), commonly known as WebDAV, is a robust protocol that extends HTTP to allow for creating, modifying, and managing files on remote servers. It's a helpful tool that makes it easy to manage files over the internet, and it is widely used in content management systems, cloud storage platforms, and collaboration tools. The protocol was first introduced in 1996 by the Internet Engineering Task Force (IETF) as an extension to the HTTP/1.1 standard. Since then, it has become an integral part of the web infrastructure.

WebDAV is beneficial when working with many files or when making frequent changes. Developers can easily upload and manage these files using WebDAV without using the platform's user interface. In addition, WebDAV provides versioning capabilities (Not enabled on SFCC - as far as we know), enabling developers to track file changes over time. This can be useful for auditing purposes or rolling back changes if necessary.

Many clients, including Cyberduck, Transmit, and FileZilla, support WebDAV. These clients provide a user-friendly interface for accessing and managing files remotely.

## How is WebDAV used in Salesforce B2C Commerce Cloud?

WebDAV is a versatile technology that allows developers to manage files and data in Salesforce B2C Commerce Cloud. One of the main advantages of WebDAV is that it provides a standard HTTP-based protocol for remote file management, which makes it easy for developers to access and manipulate files.

WebDAV has quite a few use cases in Salesforce B2C Commerce Cloud:

-   Thanks to WebDAV, developers can easily [manage](https://help.salesforce.com/s/articleView?id=cc.b2c_access_files_webdav.htm&language=en_us&release=2.0.1&type=5) product images on their online stores, including uploading, updating, and deleting images.
-   This file system can be used for importing and exporting data, which lets developers quickly [transfer data files](https://help.salesforce.com/s/articleView?id=cc.b2c_transferring_files_to_an_instance.htm&type=5) to and from the platform for analysis or backup purposes.
-   WebDAV provides a way to manage log files on the platform, including [debugging](https://help.salesforce.com/s/articleView?id=cc.b2c_secure_logging.htm&type=5), error logging, and security logging. It is a critical tool to monitor the platform's health and [security](https://help.salesforce.com/s/articleView?id=cc.b2c_security_event_auditing.htm&type=5) and quickly identify and address any issues.
-   Developers can use it to [create](https://help.salesforce.com/s/articleView?id=cc.b2c_automating_file_transfer_through_scripts.htm&type=5) full or incremental backups of their online store data and files, ensuring they can recover from data loss or other catastrophic events.
-   WebDAV can temporarily store files when performing file operations on the platform, such as [transferring](https://help.salesforce.com/s/articleView?id=cc.b2c_transferring_files_to_an_instance.htm&type=5) files between servers.

## Authentication

There are two main ways to connect to WebDAV: Basic Authentication and API Key. Basic Authentication is a straightforward way to connect to WebDAV, while API Key authentication provides a more secure way to connect to WebDAV.

### Authentication for Business Manager Users

When the WebDAV client is a Business Manager user utilising a client application such as Cyberduck or FileZilla, Salesforce B2C Commerce Cloud resorts to Basic Auth authentication, which uses a username and password combination to grant access. It’s up to the merchant to [set this up through the configuration of authorisation rules](https://help.salesforce.com/s/articleView?id=cc.b2c_creating_roles.htm&type=5) specific to folders in the Business Manager.

To manage these folder-specific permissions, navigate to the [Roles module in Business Manager](https://help.salesforce.com/s/articleView?id=cc.b2c_roles_and_permissions.htm&type=5) and adjust the settings in the `WebDAV Permissions` tab. Here, you can assign different access levels—read, write, or both—to various directories within WebDAV, ensuring Business Manager users only have access to the files necessary for their role.

[![A screenshot of the business manager showing the WebDAV Permissions for the "eCom Manager".](/media/2024/webdav-role-permissions-7d3baef818.png)](/media/2024/webdav-role-permissions-7d3baef818.png)

A screenshot of the eCom Manager Role Permissions

### Authentication for API Clients

API clients engage in machine-to-machine communication and authenticate through an authorisation token [generated in the Account Manager](https://help.salesforce.com/s/articleView?id=cc.b2c_generate_api_client_id.htm&type=5). To get this authorisation token, an API client must present its unique `client-id` and `client-secret`. After successful authorisation, WebDAV permissions for the API client can be configured in Business Manager in the `WebDAV Client Permissions` module.

_Administration >  Organization >  WebDAV Client Permissions_

This configuration involves creating a JSON document that accurately represents each API client's permissions over specific directories.

For instance, an API client may have `read_write` permissions to the "`/impex/src/foo"` directory and `read` permission to the "`/impex/src/logs` and `/catalogs"` directories. The client\_id and permissions (each having path and operation) must be clearly defined in this JSON document.

```

					{
   "clients":[
      {
         "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
         "permissions":[
            {
               "path":"/impex/src/foo",
               "operations":[
                  "read_write"
               ]
            },
            {
               "path":"/impex/src/logs",
               "operations":[
                  "read"
               ]
            },
            {
               "path":"/catalogs",
               "operations":[
                  "read"
               ]
            }
         ]
      },
      {
         "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaab",
         "permissions":[
            {
               "path":"/impex/",
               "operations":[
                  "read_write"
               ]
            }
         ]
      }


```

[![A screenshot of the WebDAV Client Application Permissions screen showing one configuration giving an API key access to the /impex folder and /cartridges folder.](/media/2024/webdav-client-application-permissions-8757d150cc.png)](/media/2024/webdav-client-application-permissions-8757d150cc.png)

A screenshot of how this might look in the Business Manager

#### Things to keep in mind

> [!NOTE]
> **Note:** that the permission paths for different clients cannot intersect each other, meaning that if you configure one client with permissions for `/impex/src`, you can't have another set for `/impex/src/foo`. This restriction is in place to prevent potential conflicts and overlaps in permissions.

Salesforce B2C Commerce Cloud's security measures don't permit write operations in specific directories. For example, the `/securitylogs` directory can only be granted `read` permissions.

You can maintain a secure and organised file system within Salesforce B2C Commerce Cloud by effectively authenticating WebDAV clients and meticulously configuring permissions.

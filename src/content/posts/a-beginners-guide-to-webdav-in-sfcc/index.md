---
title: Beginner's Guide to WebDAV in SFCC
description: >-
  File Management is critical and necessary in any project. How else can we work
  with mass data transfers or logging mechanisms?
date: '2024-01-01T17:06:50.000Z'
lastmod: '2026-07-07T20:00:00.000Z'
url: /a-beginners-guide-to-webdav-in-sfcc/
draft: false
heroImage: webdav-storing-files-scaled-8c216a580f.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
  - webdav
author: Thomas Theunen
takeaways:
   - "Maps the WebDAV folders on an instance, from /impex and /cartridges to the read-only /securitylogs"
   - "Covers authentication for Business Manager users, access keys, and API clients"
   - "Warns where SFCC diverges from the WebDAV standard: no versioning, no locking, and strict retention clocks"
---
A colleague asks for the product feed your job exported in April. You open Cyberduck, browse to `/impex`, and find nothing. Nobody on the team deleted it — the platform did, right on schedule, and it never asked. Welcome to file management on [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/), where every file travels over WebDAV and lives by WebDAV's house rules.

This post covers those rules: the folders you can reach, how authentication works for people and for machines, and the places where the platform quietly parts ways with the official WebDAV standard.

## What is WebDAV?

[Web Distributed Authoring and Versioning](https://en.wikipedia.org/wiki/WebDAV), commonly known as WebDAV, extends HTTP with verbs for managing files on a remote server. Plain HTTP mostly reads documents; WebDAV adds commands to upload (`PUT`), create folders (`MKCOL`), move, copy, and list directories (`PROPFIND`). The IETF started the work in 1996, and the current core of the protocol is defined in [RFC 4918](https://datatracker.ietf.org/doc/html/rfc4918).

The standard promises more than file transfer, though. RFC 4918 defines locking, so two authors cannot overwrite each other's work. A companion standard, [RFC 3253](https://datatracker.ietf.org/doc/html/rfc3253) ("DeltaV"), defines the versioning that put the "V" in the name. Hold that thought, because SFCC implements neither — more on that [below](#where-sfcc-parts-ways-with-the-standard).

Many clients support WebDAV, including Cyberduck, Transmit, and FileZilla, and both Windows and macOS can mount a WebDAV location as a network drive. Any of them will do for SFCC work; pick the one your team already knows.

## How is WebDAV used in Salesforce B2C Commerce Cloud?

Every B2C Commerce instance runs an embedded WebDAV server. There is no SSH, no SFTP, and no direct file system access on this platform — if a file lives on an instance, WebDAV is how it got there and how it will leave. That makes the protocol less of a convenience and more of a load-bearing wall:

- **Code deployment:** every cartridge upload is a WebDAV `PUT` under the hood, whether it comes from the CLI, your IDE plugin, or a CI pipeline writing into a code version.
- **Data import and export:** jobs pick up and drop files in `/impex`, which makes WebDAV the [transfer channel](https://help.salesforce.com/s/articleView?id=cc.b2c_transferring_files_to_an_instance.htm&type=5) for product feeds, price books, and [delta exports](/delta-exports-in-salesforce-b2c-commerce-cloud/).
- **Log access:** the platform writes its [debug](https://help.salesforce.com/s/articleView?id=cc.b2c_secure_logging.htm&type=5), error, and [security](https://help.salesforce.com/s/articleView?id=cc.b2c_security_event_auditing.htm&type=5) logs to WebDAV folders, so reading them is a WebDAV download.
- **Catalogue media and content:** developers can [manage](https://help.salesforce.com/s/articleView?id=cc.b2c_access_files_webdav.htm&type=5) product images and content library assets without going through the Business Manager UI.
- **Backups:** before a risky import, you can [download](https://help.salesforce.com/s/articleView?id=cc.b2c_automating_file_transfer_through_scripts.htm&type=5) the current files and keep a copy on your side of the connection.

## The Folder Map

Every WebDAV location on an instance sits under the same URL prefix:

```text
https://{instance-hostname}/on/demandware.servlet/webdav/Sites/
```

Behind that prefix, [the platform exposes](https://help.salesforce.com/s/articleView?id=cc.b2c_using_web_dav.htm&type=5) a fixed set of top-level folders. You cannot create your own top-level directory; everything you do lives inside one of these:

- **`/impex`:** the staging area for imports and exports. Jobs read their input from `/impex/src` and drop their exports there too — this is where your feeds land.
- **`/cartridges`:** one subfolder per code version, each containing the uploaded cartridges. This is what your deployment tooling writes to.
- **`/logs`:** application and system logs, one file per log level, per application server, per day.
- **`/securitylogs`:** the audit trail of logins, permission changes, and other security events. Read-only for everyone — the platform refuses write permissions here, so nobody can tamper with the trail.
- **`/catalogs`, `/libraries`, `/static`, `/dynamic`:** static files belonging to catalogues and content libraries, mostly product images and library assets.
- **`/temp` and `/realmdata`:** narrower working folders you will rarely touch by hand.

You do not need a third-party client to look around. In Business Manager, `Administration > Site Development > Development Setup` has a Folder Browser tab that shows every folder your permissions allow, with download links and a "Copy WebDAV URL" button for each directory.

One practical warning: these locations [enforce HTTPS](https://help.salesforce.com/s/articleView?id=cc.b2c_using_web_dav.htm&type=5). Connect over plain `http` and the instance answers with "Access Denied" — a confusing error for what is really a missing SSL checkbox in your client's connection settings.

## Authentication

So how do you get in? That depends on who is asking. WebDAV on SFCC serves two kinds of callers — people using a desktop client, and machines talking to the instance in an integration — and the platform authenticates them differently, with permissions living in two different Business Manager modules.

### Authentication for Business Manager Users

When the WebDAV client is a Business Manager user in a desktop application such as Cyberduck or FileZilla, Salesforce B2C Commerce Cloud uses Basic Auth: a username and password. It's up to the merchant to [set this up through the configuration of authorisation rules](https://help.salesforce.com/s/articleView?id=cc.b2c_creating_roles.htm&type=5) specific to folders in the Business Manager.

To manage these folder-specific permissions, navigate to the [Roles module in Business Manager](https://help.salesforce.com/s/articleView?id=cc.b2c_roles_and_permissions.htm&type=5) and adjust the settings in the `WebDAV Permissions` tab. Here, you can assign different access levels—read, write, or both—to various directories within WebDAV, ensuring Business Manager users only have access to the files necessary for their role.

{{< img-caption src="webdav-role-permissions-7d3baef818.png" alt="A screenshot of the business manager showing the WebDAV Permissions for the \"eCom Manager\"." caption="Role-level WebDAV permissions" link="webdav-role-permissions-7d3baef818.png" >}}

### Access Keys: A Scoped Stand-In for Your Password

A reasonable worry at this point: Account Manager accounts require multi-factor authentication, and Cyberduck has no way to show you an MFA prompt. Does WebDAV still work? It does. The MFA requirement covers interactive logins — Business Manager, Account Manager, Log Center — while WebDAV Basic Auth counts as an API login: no second factor is requested, and your Account Manager username and password work as-is.

That convenience cuts both ways. It also means your password alone protects every file your roles can reach, with no second factor backing it up. This is why Salesforce offers an [access key](https://help.salesforce.com/s/articleView?id=cc.b2c_access_keys_for_business_manager.htm&type=5) as an optional substitute for your password in external applications: a generated secret scoped to a single purpose, such as WebDAV file access. Click your username in the top-right corner of Business Manager, choose `Manage Access Keys`, generate a key with the WebDAV scope, and hand that key to your WebDAV client instead of your real password. If the key leaks, you revoke one scoped credential rather than rotating the password that opens Business Manager everywhere.

If you do adopt them, two properties of access keys are worth knowing before they surprise you:

- **They expire after a year**, so a WebDAV connection that worked for months and suddenly returns 401 is probably sitting on an expired key.
- **Six wrong attempts lock the scope.** After six failed logins, neither the key nor your password works for that authentication scope any more, and you need to generate a fresh key.

The key is shown once, at generation time. Store it in your password manager immediately — there is no way to view it again later.

### Authentication for API Clients

API clients engage in machine-to-machine communication and authenticate through an authorisation token [generated in the Account Manager](https://help.salesforce.com/s/articleView?id=cc.b2c_generate_api_client_id.htm&type=5). To get this authorisation token, an API client must present its unique `client-id` and `client-secret`. After successful authorisation, WebDAV permissions for the API client can be configured in Business Manager in the `WebDAV Client Permissions` module.

`Administration > Organization > WebDAV Client Permissions`

The configuration is a single JSON document listing, per `client_id`, which directories that client may touch and whether it gets `read` or `read_write`. In the example below, the first client can write to `/impex/src/foo` but only read `/impex/src/logs` and `/catalogs`, while the second client owns the whole of `/impex/`:

```json
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
   ]
}
```

{{< img-caption src="webdav-client-application-permissions-8757d150cc.png" alt="A screenshot of the WebDAV Client Application Permissions screen showing one configuration giving an API key access to the /impex folder and /cartridges folder." caption="WebDAV client permission mapping" link="webdav-client-application-permissions-8757d150cc.png" >}}

#### Things to Keep in Mind

> [!NOTE]
> The permission paths for different clients cannot intersect each other, meaning that if you configure one client with permissions for `/impex/src`, you can't have another set for `/impex/src/foo`. This restriction is in place to prevent potential conflicts and overlaps in permissions.

Permissions are granted per directory, never per file, and [the path must start](https://help.salesforce.com/s/articleView?id=cc.b2c_web_dav_client_permissions.htm&type=5) with one of `/impex`, `/catalogs`, `/dynamic`, `/libraries`, `/logs`, `/static`, or `/securitylogs`. And as mentioned in the folder map, `/securitylogs` accepts only `read` — the configuration screen rejects `read_write` for that path.

## Where SFCC Parts Ways With the Standard

The official WebDAV specification describes a richer protocol than the one SFCC ships. Three differences matter in practice.

**There is no versioning.** Despite the "V" in the name, B2C Commerce does not implement the DeltaV extension — its documented command set stops at `PROPPATCH`, with no `VERSION-CONTROL`, `CHECKOUT`, or `REPORT` in sight. To be fair to Salesforce, almost no WebDAV server implements DeltaV. But the consequence deserves a plain statement: when you overwrite or delete a file over WebDAV, it is gone. No history, no rollback, no recycle bin. Cartridges get their safety net elsewhere, through code versions you can switch between. For everything else — impex feeds, media, configuration exports — the only version history is the one you keep on your own systems.

**There is no locking.** `LOCK` and `UNLOCK` are missing from the supported commands, which means SFCC is a class 1 WebDAV server: last write wins. If your nightly job writes an export while a colleague uploads a file with the same name, nobody gets an error and one of the files silently disappears. Coordinate through naming conventions and folder ownership, because the protocol will not coordinate for you.

**`COPY` behaves differently than the RFC says.** Since the 22.3 release, the platform refuses to copy a folder's content into itself, to prevent a recursive copy from filling the file system. Reasonable — but the deviation from [RFC 4918](https://datatracker.ietf.org/doc/html/rfc4918) has a sharp edge: if a folder with the same name as the destination already exists in the source, nothing is copied *and no error is reported*. A scripted copy can silently do nothing. If a `COPY` matters, verify the result instead of trusting the status code.

The full command set, for reference: `GET`, `OPTIONS`, and `PROPFIND` count as read operations; `PUT`, `POST`, `DELETE`, `MKCOL`, `COPY`, `MOVE`, and `PROPPATCH` count as write operations, joined by two platform-specific verbs, `ZIP` and `UNZIP`. Note that `COPY` needs read permission on the source and `read_write` on the target, while `MOVE` needs `read_write` on both.

## Limits, Timeouts, and Housekeeping

WebDAV on SFCC comes with numbers attached, and knowing them saves an afternoon of debugging. They sit alongside the platform's other ceilings, which I've catalogued in [the survival guide to SFCC platform limits](/a-survival-guide-to-sfcc-platform-limits/).

- **Uploads are capped at 500 MB** per WebDAV push ([raised in the 22.9 release](/salesforce-b2c-commerce-cloud-22-9-release/)). Salesforce [recommends zipping files](https://help.salesforce.com/s/articleView?id=cc.b2c_file_size_and_transfer_restrictions.htm&type=5) before upload — and thanks to the platform-specific `UNZIP` verb, you can upload one archive and unpack it on the server instead of pushing thousands of small files.
- **Downloads into a file are capped at 200 MB.** Larger exports need to be split or compressed first.
- **Requests time out after five minutes.** A slow connection pushing a large file can hit the timeout well before the size cap.

Then there is the housekeeping the platform does whether you like it or not:

- **`/impex` files are deleted after 30 days.** This is where April's export went: the folder is a transfer area, not storage. Job logs under `/impex/log` last 30 days on staging and production, but only 7 days on sandbox and development instances.
- **Log files are deleted after 30 days**, and after three days they are moved into a `log_archive` folder and gzipped — so a script that reads yesterday's logs needs to handle both locations. [Security logs](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-log-files-overview.html) are the exception at 90 days.
- **A folder holds at most 100,000 files.** Beyond that, the platform deletes the oldest files first, even if they are within their retention period.

One more platform quirk: the WebDAV server [resets file timestamps](https://help.salesforce.com/s/articleView?id=cc.b2c_web_dav_timestamp_reset.htm&type=5) on every rename, copy, modify, or create — including a remote unzip. If your integration decides what to process based on modification dates, a housekeeping move on the instance can make old files look brand new.

## WebDAV From Script Code

Your own server-side code can speak WebDAV too. The [`dw.net.WebDAVClient`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_net_WebDAVClient.html) class lets a job connect to a merchant's WebDAV server to fetch or deliver files, supporting `GET`, `PUT`, `MKCOL`, `MOVE`, `COPY`, `PROPFIND`, `OPTIONS`, and `DELETE`. It has its own size ceilings: a `get()` into a string defaults to 2 MB (10 MB maximum), and a `get()` into a file defaults to 5 MB (200 MB maximum).

The limitation that catches people out: **the script client cannot connect to a B2C Commerce WebDAV server**. Not another instance's, and not its own. A job that copies files from staging to production over WebDAV is simply not possible; instance-to-instance transfers have to bounce through an external server or go through replication.

So treat the instance file system as what it is: a loading dock, not a warehouse. The platform deletes on a schedule, keeps no versions, and locks nothing. If a file matters, the copy of record should live on your side of the connection — so that the next time someone asks for April's export, the answer is a link to your own archive, not an apology.

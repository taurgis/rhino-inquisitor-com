---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.html#logincustomerstring-string-boolean
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.html#logincustomerstring-string-boolean
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.html
cache_key: a664bec4e5b387696dfe8aa3bcb4ba1e7a99c555dc0d361d08f6f8fc2fecf0dc
topic: 
tags:
  - commerce
  - b2c-commerce
  - b2c-script-api
  - docs
  - references
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-07-14T17:17:48.996Z
validated_at: 2026-07-14T17:17:48.996Z
stale_after: 2026-08-13T17:17:48.996Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "46ecce1711ed9e6f1df0d582a9c6fbf0"
last_modified: Tue, 14 Jul 2026 01:08:26 GMT
content_hash: e738c0fd431da2bb08287190b4b78873324c3ff97daebedc937bdb4e52325edd
token_estimate:
  compressed: 448
  detailed: 526
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.md
search_provider: 
parent_cache_key: 4593d94c64be11da8fd06b9ddaed3cec7cc1a891d2aad1c03416718cd895039e
section_anchor: logincustomerstring-string-boolean
section_heading_path: Class CustomerMgr > Method Details > loginCustomer(String, String, Boolean)
---

## Summary

Class CustomerMgr > Method Details > loginCustomer(String, String, Boolean)

## Compressed

### loginCustomer(String, String, Boolean)

- ~~static loginCustomer(login: [String], password: [String], rememberMe: [Boolean]): [Customer]~~
  - : This method authenticates the current session using the supplied login and password. If a different customer is currently authenticated in the session, then this
    customer is "logged out" and her/his privacy and form data are deleted. If the authentication with the given credentials fails, then null is returned and no changes
    to the session are made. The authentication will be sucessful even when the password of the customer is already expired (according to the customer list settings).

    If the input value "RememberMe" is set to true, this method stores a cookie on the customer's machine which will be used to identify the customer when the next
    session is initiated.  The cookie is set to expire in 180 days (i.e. 6 months). Note that a customer who is remembered is not automatically authenticated and will
    have to explicitly log in to access any personal information.

    **Parameters:**

    - login - Login name, must not be null.
    - password - Password, must not be null.
    - rememberMe - Boolean value indicating if the customer wants to be remembered on the current computer.  If a value of true is supplied a cookie identifying  the customer is stored upon successful login.  If a value of false, or a null value, is supplied, then no cookie is stored and any existing cookie is removed.

    **Returns:**

    - Customer successfully authenticated customer. Null if the authentication with the given credentials fails.

    **Deprecated:**

:::warning use authenticateCustomer(login, password) and loginCustomer(authStatus, rememberMe) instead since they correctly check for expired passwords :::

***

## Detailed

### loginCustomer(String, String, Boolean)

- ~~static loginCustomer(login: [String](/docs/commerce/b2c-commerce/references/b2c-script-api/TopLevel.String.html), password: [String](/docs/commerce/b2c-commerce/references/b2c-script-api/TopLevel.String.html), rememberMe: [Boolean](/docs/commerce/b2c-commerce/references/b2c-script-api/TopLevel.Boolean.html)): [Customer](/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.Customer.html)~~
  - : This method authenticates the current session using the supplied login and password. If a different customer is currently authenticated in the session, then this
    customer is "logged out" and her/his privacy and form data are deleted. If the authentication with the given credentials fails, then null is returned and no changes
    to the session are made. The authentication will be sucessful even when the password of the customer is already expired (according to the customer list settings).

    If the input value "RememberMe" is set to true, this method stores a cookie on the customer's machine which will be used to identify the customer when the next
    session is initiated.  The cookie is set to expire in 180 days (i.e. 6 months). Note that a customer who is remembered is not automatically authenticated and will
    have to explicitly log in to access any personal information.

    **Parameters:**

    - login - Login name, must not be null.
    - password - Password, must not be null.
    - rememberMe - Boolean value indicating if the customer wants to be remembered on the current computer.  If a value of true is supplied a cookie identifying  the customer is stored upon successful login.  If a value of false, or a null value, is supplied, then no cookie is stored and any existing cookie is removed.

    **Returns:**

    - Customer successfully authenticated customer. Null if the authentication with the given credentials fails.

    **Deprecated:**

:::warning
use authenticateCustomer(login, password) and loginCustomer(authStatus, rememberMe) instead since they correctly check for expired passwords
:::

***

## Provenance

Section "Class CustomerMgr > Method Details > loginCustomer(String, String, Boolean)" of https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.customer.CustomerMgr.html (parent 4593d94c64be11da8fd06b9ddaed3cec7cc1a891d2aad1c03416718cd895039e)
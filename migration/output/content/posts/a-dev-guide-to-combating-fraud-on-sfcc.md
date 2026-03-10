---
title: >-
  Unmasking the Ghosts in the Machine: A Developer's Guide to Combating Fraud on
  Salesforce B2C Commerce Cloud
description: >-
  Enhance your security beyond the basics on Salesforce B2C Commerce Cloud with
  this comprehensive guide tailored for developers. It covers strategies to...
lastmod: '2026-01-13T09:54:38.000Z'
url: /a-dev-guide-to-combating-fraud-on-sfcc/
draft: false
heroImage: /media/2025/fraud-orders-sfcc-scaled-beae2495ff.jpeg
date: '2026-01-19T08:02:08.000Z'
categories:
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
Your checkout flow isn't just a conversion funnel; it's a battleground. Every order placed is a potential skirmish with bad actors looking to exploit your system for financial gain. For developers on the Salesforce B2C Commerce Cloud (SFCC) platform, preventing fraud is not merely a business concern—it's a technical mandate. It falls squarely within our domain to architect defences that are both robust and intelligent. Under the Salesforce Shared Responsibility Model, Salesforce secures the core platform and infrastructure; however, the security of custom code, configurations, and data handling is the customer's (or partner's) responsibility. This is where we, the developers, step up.

Effective fraud prevention is not a tool you install; it's a multi-layered fortress you build. Each layer serves a specific purpose, from deterring obvious bots at the gate to conducting in-depth forensic analysis on suspicious transactions within the walls. This guide serves as your architectural blueprint for the fortress.

We'll begin by understanding the enemy, dissecting the modern fraud landscape to identify patterns we can target with code. Next, we'll master the native toolkit, wielding SFCC's built-in features to construct our foundational defences. Then, we'll get our hands dirty, diving into server-side JavaScript to write custom validation rules and a bespoke risk-scoring engine.

Finally, we'll survey the professional mercenaries on the AppExchange, calling in specialised reinforcements when the fight demands it. This is the definitive guide for SFCC developers on fraud prevention, packed with actionable code, clear-headed analysis, and an unbiased look at the partner ecosystem.

_Let's build our fortress._

![A cartoon illustration depicting a stone fortress labeled 'Checkout Flow'. Developers equipped with tools are building defensive machines labeled 'Fraud Prevention Layers' and 'Risk Scoring' to protect the castle from cartoon burglars, with a Salesforce shield hanging above the gate.](/media/2026/the-sfcc-fortress-for-fraud-5d4d80990b.jpg)

## Know Your Enemy - A Developer's Taxonomy of eCommerce Fraud

To write effective defensive code, we must first understand the attack vectors. The modern fraud landscape is a far cry from the simple days of a stolen credit card number. It is now a sophisticated, often automated, criminal enterprise that costs merchants not only lost revenue and products but also incurs hefty chargeback fees and, most critically, erodes customer trust.

### Deconstructing the Threats

Fraudulent activities are diverse, each with unique technical fingerprints. As developers, our job is to translate these abstract threats into concrete, detectable data patterns.

#### Card-Not-Present (CNP) Fraud

This is the foundational threat of all e-commerce. By its very nature, an online transaction is a [Card-Not-Present](https://stripe.com/resources/more/what-is-card-not-present-fraud-what-businesses-need-to-know) (CNP) transaction, meaning the physical card cannot be inspected. This lack of physical verification is the central vulnerability that fraudsters exploit. They acquire the necessary card details—card number, expiration date, CVV, and billing address—through a variety of illicit means, including phishing campaigns, malware that scrapes data from infected devices, and purchasing troves of stolen information from data breaches on the dark web.

#### Account Takeover (ATO) Fraud

A more advanced form of identity theft, [Account Takeover](https://www.ic3.gov/CrimeInfo/AccountTakeover) (ATO), occurs when a fraudster gains unauthorised access to a legitimate customer's account. They achieve this through methods such as credential stuffing, where automated bots test lists of usernames and passwords stolen from other data breaches, exploiting the common user habit of reusing passwords. Once inside, the fraudster can make purchases using stored payment methods, change shipping addresses to intercept goods, drain loyalty points, or steal sensitive personal data for further attacks.

#### "Friendly" Fraud (Chargeback Abuse)

This is one of the most challenging types of fraud to combat because it originates from a seemingly legitimate customer. Friendly fraud occurs when a customer makes a valid purchase but then contacts their credit card issuer to dispute the charge, falsely claiming the item never arrived, was defective, or that the transaction was unauthorised. The merchant loses the product, the revenue, and is hit with a [chargeback](https://www.radial.com/types-of-ecommerce-fraud) fee from the bank. Because the initial transaction markers—IP address, billing information, device fingerprint—all appear perfectly normal, it bypasses many traditional fraud filters.

#### Bot-Driven Attacks

Automated bots are the force multipliers of the fraud world, enabling criminals to execute attacks at a scale and speed impossible for humans.



-   **Card Testing (Card Cracking):** Bots are used to make thousands of small, often $1, transactions to test the validity of massive lists of stolen credit card numbers. A successful small transaction confirms the card is active and can be used for larger fraudulent purchases later.


-   **Inventory Hoarding/Depletion Fraud:** During high-demand events like product launches or flash sales, bots can swamp a site to buy up all available limited-stock inventory. These items are then resold on secondary markets at inflated prices, denying legitimate customers the opportunity to purchase and damaging brand perception.



#### Sophisticated Schemes

![A cartoon illustration depicting complex fraud schemes. One section illustrates 'Triangulation Fraud' showing a circular flow between a fraudster, a legitimate merchant, and an unsuspecting customer. Another section depicts 'Synthetic Identity Fraud' as a figure assembling a fake persona using puzzle pieces labeled with different personal data points like 'SSN' and 'Name'.](/media/2026/advanced-fraud-schemes-81670fc67f.jpg)

Beyond simple theft: A visual breakdown of how fraudsters manipulate supply chains through Triangulation and manufacture new personas via Synthetic Identity fraud.

As merchants' defences improve, fraudsters devise more complex schemes.

-   **Triangulation Fraud:** This is a cunning three-party scheme. A fraudster sets up a fake online store or an auction listing for a popular product at a low price. An unsuspecting customer buys the item and provides their payment and shipping details. The fraudster then uses that shipping information to access a legitimate merchant's website (like yours) and purchases the same item with a different, stolen credit card, which is then shipped directly to the original customer. The fraudster pockets the customer's initial payment, the legitimate merchant is hit with a chargeback from the card's owner, and the customer receives the product, often unaware that their actions have fueled a fraudulent transaction.

-   **Synthetic Identity Fraud:** This is one of the fastest-growing and most dangerous forms of financial crime. Instead of stealing a single, complete identity, fraudsters combine pieces of real, stolen information (like a valid Social Security number) with fabricated details (a fake name and address) to create a brand-new, fictitious identity. This "synthetic" identity has no prior credit history, making it difficult for traditional systems to flag as fraudulent. The fraudster can then use this identity to open new lines of credit, make purchases, and commit fraud that is incredibly difficult to trace back to a real person.


The evolution from simple CNP fraud to more complex schemes, such as synthetic identity and triangulation, marks a critical shift. Fraudsters are no longer just exploiting stolen data; they are creating fraudulent entities and manipulating entire supply chains. This progression means a static fraud detection strategy is doomed to fail. Defences must evolve from simple data point validation (e.g., "does the CVV match?") to holistic, pattern-based analysis ("does this entire transaction _profile_ look legitimate?"). This reality underscores the need for a custom risk-scoring engine and machine learning-based third-party tools that will be discussed in later chapters.

## Translating Threats to Code: Actionable Red Flags

For a developer, understanding these schemes is only half the battle. The crucial step is identifying the digital fingerprints they leave behind in the order data available within SFCC. These red flags are the triggers for our custom logic.

### Data Mismatches

A classic indicator is a mismatch between the IP address geolocation and the billing or shipping address, especially across countries (e.g., an order placed from a Singaporean IP address with a US billing address).

### Velocity & Behavior Anomalies

Watch for patterns that defy normal human behavior. This includes multiple orders placed from the same IP address using different credit cards but shipping to the same address, a high volume of transactions in a very short time, or a series of failed payment attempts followed by a successful one.

### Order Characteristics

Be wary of unusually large orders, particularly from new or guest customers, as fraudsters try to maximize their payout before being caught. Another key indicator is a request for rushed or overnight shipping, as this minimizes the window for the merchant to detect the fraud and halt the shipment.

### Identity Indicators

The quality of the data can be telling. The use of temporary or disposable email domains is a significant red flag. Inconsistencies in names, or names that are clearly gibberish, also warrant suspicion.

Before writing a single line of custom fraud logic or evaluating a third-party cartridge, it's critical to maximise the platform's inherent capabilities. Salesforce provides a set of powerful, foundational tools that form the first layers of your defensive fortress.

The platform's philosophy is not to provide a single, monolithic fraud solution, but rather to offer secure, extensible building blocks that empower developers and partners to create tailored defences. This approach recognises that every merchant's risk profile is unique and that a one-size-fits-all solution is often ineffective.

## The Native Toolkit - Wielding SFCC's Built-in Defenses

### The First Line of Defense: The eCDN

Every request to your storefront first passes through Salesforce's embedded Content Delivery Network (eCDN). This is your outermost wall. The primary tool here for developers is eCDN Custom Rules, which have replaced the older, more rigid firewall rules. These rules give you granular control over incoming traffic based on a wide array of request parameters.

Using the [eCDN API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-custom-rules.html), you can construct powerful expressions to filter traffic before it ever hits your application servers. For example, you can create a rule to block requests originating from known malicious IP ranges, countries where you don't ship, or specific user agents associated with malicious bots. The flexibility of these rules, which can key off of URI paths, user agents, IP addresses, and more, makes the eCDN a formidable first line of defence against automated threats.

![A cartoon illustration showing SFCC's native defense toolkit. On the left, a developer uses eCDN Custom Rules and API to block malicious traffic and bots from entering a castle. In the middle, Payment Processing Fundamentals are depicted with AVS and CVV checks passing or failing a credit card. On the right, a Commerce Cloud Einstein robot states it's for merchandising and sales, not fraud prevention, debunking a myth.](/media/2026/native-sfcc-features-15503da1e4.jpg)

Leveraging SFCC's built-in defenses: The eCDN as the first line against malicious traffic, fundamental payment processing checks (AVS/CVV), and clarifying the role of Commerce Cloud Einstein.

### Payment Processing Fundamentals

SFCC is designed to be payment-agnostic, allowing seamless integration with major processors, such as Adyen, Braintree, Stripe, and Cybersource, through configuration in the Business Manager.

When configuring these processors, enable and enforce payment processor features, such as **Address Verification System (AVS)** and **Card Verification Value (CVV)** checks.

AVS compares the numeric parts of the billing address provided by the customer to the address on file with the card issuer, while the CVV check validates the 3- or 4-digit code on the card.

While not foolproof against sophisticated fraudsters, these checks are a fundamental, non-negotiable first pass that can filter out a significant volume of low-effort fraud.

### Debunking a small Myth: The Role of Commerce Cloud Einstein

The robust Einstein features in B2C Commerce are mainly merchandising tools aimed at improving the customer experience and increasing sales. However, they do not include any functions to prevent fraud.

### Debunking a larger Myth: Salesforce B2C protects against all types of bots

Many customers and partners believe that Salesforce implements protections against bots, [but this is not the case](https://developer.salesforce.com/docs/commerce/commerce-solutions/guide/bot-management.html). Salesforce places this responsibility on the customer, as they do not want to be the gate that filters between "legitimate customers" and bots, as the risk of false positives is too high, especially since this varies by region and industry.

Since the eCDN behind the scenes is Cloudflare, some protections are enabled by default, but more complex bots will require you to look elsewhere.

> B2C Commerce doesn’t identify bots as good or bad, nor do we suggest whether certain traffic is allowed to make purchases on our commerce platform. Our customers have the flexibility to adopt the bot management strategy that aligns with their business needs.
>
> Salesforce Help

## Foundational Security Practices (The Developer's Responsibility)

According to the shared responsibility model, developers are responsible for the security of their custom code and configurations. Adhering to these best practices is non-negotiable.



-   **Authentication & Authorisation:** Enforce strict, server-side access control checks for all sensitive business functions. In SFRA, use the [userLoggedIn](https://help.salesforce.com/s/articleView?id=cc.b2c_developer_authentication_and_authorization.htm&type=5) middleware to protect controller endpoints that should only be accessible to authenticated users. Never trust that a request is legitimate just because it was sent; always validate on the server.


-   **Guest Shopper Security:** Guest checkouts are a major vector for fraud because they lack the historical context of a registered account. Implementing robust authorisation for guest order lookup is critical. Never grant access to an order solely based on the order number. At a minimum, require a combination of the order number, the email address used for the order, and the billing postal code to prevent unauthorised users from accessing order details.


-   **Data Validation:** Proper validation of all user-provided input is the bedrock of application security. This is your primary defence against a host of vulnerabilities, including Cross-Site Scripting (XSS) and server-side script injection.

-   **Bot Management:** Salesforce's official stance is that it provides the tools for bot management (like eCDN rules and rate limiting), but **_the strategy and ongoing tuning are the customer's responsibility_**.  Salesforce does not classify bots as "good" or "bad," as a bot that is desirable for one merchant (e.g., a search engine crawler) may be malicious for another (e.g., an inventory scraper).


## Getting Your Hands Dirty: The Custom Scoring Engine

For the bold and the brave, relying solely on third-party scores isn't the only option. It is entirely possible to roll up your sleeves and engineer your own custom risk-scoring engine directly on the platform. Using a combination of script hooks (`beforePOST` for headless or `fraudDetection.js` for SFRA), custom objects (watch the [quota](/why-circumventing-sfcc-quota-limits-is-a-bad-idea/)) to store historical data, and calls to external services, you can create a sophisticated system tailored precisely to the fraud patterns you observe. This gives you ultimate control over the logic and allows for a highly nuanced approach that a generic solution might miss.

However, let's be crystal clear: this is not a trivial task. Building a reliable fraud detection system is a complex challenge in software engineering. You are essentially building a stateful, data-driven application within your e-commerce platform. Some of the building blocks for such a system would include:

-   **Address Scoring:** Programmatically comparing billing and shipping addresses. Are they in the same country? Same city? Do they look like mail forwarders?

-   **IP Verification & Geolocation:** Integrating with an IP intelligence service to check if the customer's IP is a known proxy or data centre, and comparing its location to the billing address country.

-   **Velocity Checks:** Tracking how many orders are placed by an IP, a customer email, or a device fingerprint within a certain timeframe. This requires diligent use of Custom Objects to maintain state.

-   **Email Domain Risk:** Analysing the customer's email address. Is it from a disposable email provider?

-   **High-Risk Order Profiling:** Flagging orders that combine multiple risk factors, such as a new customer placing an unusually large, high-demand product order to be shipped to a different country.


The most critical aspect of running your own custom solution is that its maintenance becomes your paramount responsibility. A poorly tuned algorithm is a double-edged sword; it might block fraudsters, but it can also create a torrent of "false positives," blocking legitimate, high-value customers who then leave your site frustrated.

**_You must commit to continually monitoring, logging, and analysing both blocked and successful transactions to refine your rules_**. Fraud prevention is not easy, and when you build it yourself, the responsibility falls entirely on you and your codebase.

## Calling in the Cavalry - A Guide to Third-Party Fraud Solutions

![A cartoon illustration depicting "The Cavalry" of third-party fraud solutions. Armored knights ride cybernetic horses toward a castle labeled "Salesforce Commerce Cloud." Signposts highlight specific vendors like "Riskified & Signifyd" (Peace of Mind), "Kount" (Control), and "DataDome" (Bot Defense), while knights carry banners representing "Global Data" and "Machine Learning."](/media/2026/calling-the-cavalry-fea1bcb812.jpg)

When custom rules aren't enough, it's time to call in the cavalry. Third-party solutions bring global data networks, advanced AI, and financial guarantees to reinforce your Salesforce Commerce Cloud defense.

While a custom-built rules engine is a powerful first line of defense, there comes a point where the scale and sophistication of fraud attacks demand more advanced weaponry. This is where third-party fraud prevention solutions from the Salesforce AppExchange become invaluable. These services offer three key advantages over an in-house solution: access to a massive, global network of shared transaction data; sophisticated machine learning (ML) models that are impossible to build and train independently; and, in many cases, the ability to offload financial liability through a chargeback guarantee.

### Vendor Deep Dives

The third-party ecosystem is not monolithic; different vendors specialise in solving different parts of the fraud problem. The choice is not about which is "best," but which is best for your specific pain point.

These platforms dedicate all their resources to combating fraud and offer powerful tools that integrate directly with Salesforce Commerce Cloud. They typically handle the decision-making process for you and protect your revenue with sophisticated AI and massive data networks.

Here’s a look at some leading providers and who they are best for:

-   **[Riskified](https://appexchange.salesforce.com/appxListingDetail?listingId=d719d10c-198a-4d46-9df8-c4a8920c023e)** & [Signifyd](https://www.signifyd.com/salesforce-commerce-cloud/)**:** Merchants who want a "set it and forget it" solution with financial peace of mind. Their key offering is a chargeback guarantee, making them ideal for businesses that want to maximize sales approvals while completely offloading the financial risk of fraudulent chargebacks.

-   **[Kount](https://kount.com/partners/salesforce-commerce-cloud-fraud-prevention/):** Businesses with in-house fraud teams that want control and deep insights. Kount provides a wealth of data and customizable rules, empowering merchants to actively manage their own fraud prevention strategy and fine-tune their risk tolerance.

-   **[DataDome](https://appexchange.salesforce.com/appxListingDetail?listingId=6dfa8305-611a-4752-8bd5-b51e0144a80a):** Retailers are heavily targeted by malicious bots and automated attacks. This is a foundational security layer, ideal for businesses that need to prevent credential stuffing, card testing, and scraper bots from reaching the checkout stage and causing damage.


## Architecting Your Fortress - A Layered and Evolving Strategy

In the digital marketplace, trust is the ultimate currency, and as Salesforce B2C Commerce developers, we are its primary architects. Combating fraud is not a feature to be installed but a system to be architected—a dynamic, multi-layered fortress designed to protect both the business and its customers. The path to a resilient storefront is a clear, strategic progression.

First, we build the **Foundation**. This involves mastering the native toolkit SFCC provides. We harden the perimeter with eCDN custom rules to filter malicious traffic, and we ensure our payment processing is secure by leveraging 3D Secure with Salesforce Payments or rigorously enforcing AVS and CVV checks with third-party gateways. We adhere to security best practices in our own code, implementing strict authentication and authorisation checks for every sensitive operation.

Second, we deploy our own **Custom Rules**. Using the available information, we write server-side JavaScript to enforce business-specific logic, allowing us to build a simple risk engine that detects obvious fraud patterns tailored to our unique business context.

Finally, when the threat landscape demands it, we call in the **Specialised Reinforcements**. We turn to the expert solutions on the AppExchange, making a strategic choice based on our specific needs. Whether it's offloading chargeback liability to Riskified or Signifyd, mitigating bot attacks with DataDome, or empowering an in-house team with Kount, we leverage the partner ecosystem to bring world-class machine learning and global intelligence to our defence.

Fraud prevention is an ongoing campaign, not a single battle. The threat is constantly evolving, and so too must our defences. By understanding the enemy, mastering the platform's tools, writing intelligent custom code, and strategically leveraging the partner ecosystem, SFCC developers can build the secure, trustworthy, and resilient storefronts that define successful e-commerce.

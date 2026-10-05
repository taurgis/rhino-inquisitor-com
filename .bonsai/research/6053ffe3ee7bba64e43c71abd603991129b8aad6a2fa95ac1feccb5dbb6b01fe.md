---
schema_version: 1
artifact_type: source
source_url: https://trailhead.salesforce.com/content/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration
source_urls:
  - https://trailhead.salesforce.com/content/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration
normalized_url: https://trailhead.salesforce.com/content/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration
cache_key: 6053ffe3ee7bba64e43c71abd603991129b8aad6a2fa95ac1feccb5dbb6b01fe
topic: 
tags:
  - code
  - integration
  - continuous
  - process
  - staging
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-05T08:08:54.783Z
validated_at: 2026-10-05T08:08:54.783Z
stale_after: 2026-11-04T08:08:54.783Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: W/"01248f8f1ec1b4f818746bb57c1e8d1c"
last_modified: 
content_hash: 87f1e20da32df622f144e2b9269e3ec47d7e0944dcf5359cc2de18e61e42d805
token_estimate:
  compressed: 1728
  detailed: 3019
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: 
section_anchor: 
section_heading_path: 
---

## Summary

Understanding Continuous Integration and Its Benefits

## Compressed

## Learning Objectives

After completing this unit, you’ll be able to:

*   Explain the importance of a well-defined continuous integration process.  
    
*   Describe how continuous integration works with continuous delivery and continuous deployment.  
    
*   Describe how Agentforce Commerce for B2C CI/CD development process steps relate to instance types.  
    
*   Explain what to consider per instance type when designing an integration process.  
    

## Continuous Integration

In addition to testing, another important part of the build phase is integration, the process of pulling separate code into one application. Developers use automated tools to make sure the new code is OK before integration.

A source code version control system makes CI possible.

Development teams use CI to build and test their code, and then deliver or deploy their application to production.

See the [Develop for Salesforce B2C Commerce] trail for details.

## Continuous Delivery or Deployment?

The acronym CD can refer to either delivery or deployment—the difference is how the release happens.

*   **Continuous delivery:** Teams produce software in short cycles, ensuring that the software can be reliably released at any time manually to a test or production environment.  
    
*   **Continuous deployment:** Automated testing validates if changes to a codebase are correct and stable for immediate automatic deployment to a production environment.  
    

The way a development team develops is important for integration.

*   **Agile** is about continuous delivery. Continually plan, learn, and improve as you strive for team collaboration, evolutionary development, and early delivery. It focuses on flexible responses to change, time to value, and the economy of speed.  
    
*   **Waterfall** breaks down project activities into linear sequential phases, where each phase depends on the deliverables of the previous one and corresponds to a specialization of tasks. You can't ship code without finishing the full project lifecycle of the waterfall: Discovery, Design, Build, Test, Deploy. Such a cycle takes months.  
    

## CI/CD on Agentforce Commerce for B2C Instances

Agentforce Commerce for B2C provides four environments, called instances: sandbox, development, staging, and production.

The Agentforce Commerce for B2C CI/CD development process typically uses three steps that reflect the state of the software development process and the instance types involved.

In the diagram, the text above each box is a prerequisite for the actions listed on them. For code to reach a sandbox, the code must have been pushed from the feature branch; on a development instance, the code must have been reviewed and merged, and on a staging instance, UAT and accepted must have occurred.

**Sandbox**

Developers work in their personal sandboxes and push a feature branch that triggers and executes the sandbox CI process.

Sandbox instances are designed for development and not intended to be a 1:1 copy of a development or staging instance. For CI processes on a sandbox, a larger set of products or other data means longer build times and a longer period before a code change can be approved through test automation.

The sandbox instance comes in two flavors.

*   **Point-of-delivery (POD) sandboxes:** Part of the production hardware that’s statically provisioned  
    
*   [**On-Demand sandboxes**]**:** Hosted in a public cloud environment and provisioned as required  
    

Agentforce Commerce for B2C [on-demand sandboxes] are great for the CI/CD process. You can create and populate them during the CI/DC process for both integration and testing.

When you open a pull request, it's possible to automate the process of creating and deploying to a sandbox, running tests, and then deleting the sandbox.

*   Opening the pull request  
    
*   Using multi-factor authentication (MFA) to create the sandbox  
    

You can configure OCAPI settings in your [provisioning request].

Whatever process you use, be consistent.

**Development**

Integration on a development instance is similar to integration on a sandbox. The development instance serves as the last quality gate before pushing code to staging. Developers should run a complete test suite, including [functional testing], to ensure the code works as expected for integration and from an end-user perspective.

Automated test suites provide even more complete regression testing.

**Staging**

Creating a meaningful CI process for staging is the most difficult part of the setup. Staging requires its own process for code and data upload. Because staging is the only way code can reach production, multi-factor authentication is in place for this instance for added security.

To release code, it must be deployed to staging where it’s replicated to production. The CI process running against the staging instance must provide one-time data uploads that don’t overwrite existing objects on the instance, such as a content library.

Don’t run tests on staging. You don’t want integration test data or code on staging to end up on production by accident. If the merchant has a good way of preventing test data (for example, test products) from being moved to production, then test on staging. If you deploy test code to staging, you might replicate it to production, causing a security risk.

Multi-factor authentication using a client certificate as the second factor is required when uploading code on staging. This adds an extra layer of security to the platform. Add multi-factor authentication to the code deployment process via [SFCC-CI].

The [certificate] that Salesforce Customer Support provides on realm creation is used to sign individual user certificate requests.

Before running any code, create a .p12 certificate file, as described in the [documentation].

SFCC-CI allows you to use the generated, user-specific .p12 file for the code upload to the Staging instance.

**Example Using a SFCC\_CI Command Line to Push Code to Staging**

To use the SDCC-CI CLI to deploy code to Staging.

**Production**

For the continuous delivery process, replication to production should be manual. For the continuous deployment process, replication must be automated.

## Next Steps

In this unit, you learned about the importance of a well-defined continuous integration process, and how the Agentforce Commerce for B2C CI/CD development process relates to instance type.

## Resources

*   [_Trailhead_: Develop for Salesforce B2C Commerce] (trail)
*   [_Trailhead_: Architecture of Salesforce B2C Commerce]
*   [_External Link_: DZone: What Is Functional Testing?]
*   [_Salesforce Help_: Salesforce B2C Commerce On-Demand Sandboxes]
*   [_Salesforce Help_: Assign Profiles to Define Sandbox Resources]
*   [_External Link_: GitHub: SalesforceCommerceCloud/sfcc-ci] (credentials required)
*   [_External Link_: npm.js sfcc-ci]

## Detailed

## Learning Objectives

After completing this unit, you’ll be able to:

*   Explain the importance of a well-defined continuous integration process.  
    
*   Describe how continuous integration works with continuous delivery and continuous deployment.  
    
*   Describe how Agentforce Commerce for B2C CI/CD development process steps relate to instance types.  
    
*   Explain what to consider per instance type when designing an integration process.  
    

## Continuous Integration

In addition to testing, another important part of the build phase is integration, the process of pulling separate code into one application. Continuous integration (CI) is the practice of automating the integration of code changes from multiple contributors into a single software project. It’s a primary developer [best practice](https://www.atlassian.com/devops/what-is-devops/devops-best-practices), enabling them to merge code changes frequently into a central repository where builds and tests are then run. Developers use automated tools to make sure the new code is OK before integration.

A source code version control system makes CI possible. The version control system is supplemented with other checks, such as automated code quality tests, syntax style review tools, and more.

Development teams use CI to build and test their code, and then deliver or deploy their application to production. In this diagram, continuous integration is followed by continuous delivery or continuous deployment.

![With continuous integration, development teams can implement continuous delivery or continuous deployment.](https://res.cloudinary.com/hy4kyit2a/f_auto/fl_lossy/q_70/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration/images/826bac98ddc9847770c4c34926182d61_kix.8p08zfbncqm0.png)

See the [Develop for Salesforce B2C Commerce](https://trailhead.salesforce.com/en/content/learn/trails/develop-for-commerce-cloud) trail for details.

## Continuous Delivery or Deployment?

The acronym CD can refer to either delivery or deployment—the difference is how the release happens. 

*   **Continuous delivery:** Teams produce software in short cycles, ensuring that the software can be reliably released at any time manually to a test or production environment.  
    
*   **Continuous deployment:** Automated testing validates if changes to a codebase are correct and stable for immediate automatic deployment to a production environment.  
    

The way a development team develops is important for integration. Here are the typical development methodologies.

*   **Agile** is about continuous delivery. Continually plan, learn, and improve as you strive for team collaboration, evolutionary development, and early delivery. It focuses on flexible responses to change, time to value, and the economy of speed.  
    
*   **Waterfall** breaks down project activities into linear sequential phases, where each phase depends on the deliverables of the previous one and corresponds to a specialization of tasks. You can't ship code without finishing the full project lifecycle of the waterfall: Discovery, Design, Build, Test, Deploy. Such a cycle takes months.  
    

## CI/CD on Agentforce Commerce for B2C Instances

Agentforce Commerce for B2C provides four environments, called instances: sandbox, development, staging, and production. Review how instances work in the [Architecture of Salesforce B2C Commerce](https://trailhead.salesforce.com/en/content/learn/modules/architecture-of-commerce-cloud-digital?trail_id=develop-for-commerce-cloud) module, and consider instance type when designing your integration processes.

The Agentforce Commerce for B2C CI/CD development process typically uses three steps that reflect the state of the software development process and the instance types involved.

![The Agentforce Commerce for B2C has three steps for CI/CD integration across the sandbox, development, and staging instances. The text above each box of the diagram is a prerequisite for the actions listed on them. For example for code to reach staging, UAT & Accepted must occur.](https://res.cloudinary.com/hy4kyit2a/f_auto/fl_lossy/q_70/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration/images/29a03252907b1e12c9b994e04f5a5464_kix.4gr30cw13zz2.png)In the diagram, the text above each box is a prerequisite for the actions listed on them. For code to reach a sandbox, the code must have been pushed from the feature branch; on a development instance, the code must have been reviewed and merged, and on a staging instance, UAT and accepted must have occurred.

**Sandbox**

Developers work in their personal sandboxes and push a feature branch that triggers and executes the sandbox CI process. While working on features, a developer confirms that the code is working and passes all development quality gates. This approach ensures that only functional code is reviewed. In large enterprise projects where time is critical, this process saves time by limiting pull request discussions.

Sandbox instances are designed for development and not intended to be a 1:1 copy of a development or staging instance. Having 500 to 1000 products, including prices and inventory, is more than enough for development tasks. If you need other products or categories, add them using site import. For CI processes on a sandbox, a larger set of products or other data means longer build times and a longer period before a code change can be approved through test automation. Use dedicated products for individual test cases, so you have, for example, one preorder product that your test automation uses to verify the preorder functionality.

The sandbox instance comes in two flavors.

*   **Point-of-delivery (POD) sandboxes:** Part of the production hardware that’s statically provisioned  
    
*   [**On-Demand sandboxes**](https://trailhead.salesforce.com/en/content/learn/modules/b2c-on-demand-sandbox)**:** Hosted in a public cloud environment and provisioned as required  
    

Agentforce Commerce for B2C [on-demand sandboxes](https://trailhead.salesforce.com/en/content/learn/modules/b2c-on-demand-sandbox) are great for the CI/CD process. You can create and populate them during the CI/DC process for both integration and testing. You can create them with different [sandbox profiles](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_sandbox_resource_profiles.html). The xlarge profile has enough resources to handle a production-size catalog on a production instance.

When you open a pull request, it's possible to automate the process of creating and deploying to a sandbox, running tests, and then deleting the sandbox. However, various part of this process must be done manually, such as:

*   Opening the pull request  
    
*   Using multi-factor authentication (MFA) to create the sandbox  
    

You can configure OCAPI settings in your [provisioning request](https://admin.us01.dx.commercecloud.salesforce.com/#/Sandboxes/post_sandboxes).

Whatever process you use, be consistent. Always use it testing a feature branch before it’s merged into the integration/develop branch, or a release branch before it’s merged into the main/master branch. You can easily do this with the [sfcc-ci tool](https://npmjs.com/package/sfcc-ci).

**Development**

Integration on a development instance is similar to integration on a sandbox. The development instance serves as the last quality gate before pushing code to staging. Developers should run a complete test suite, including [functional testing](https://dzone.com/articles/what-is-functional-testing), to ensure the code works as expected for integration and from an end-user perspective. In most projects, the QA engineers test on the development instance.

Automated test suites provide even more complete regression testing. As the data is synchronized with live data coming from staging, make sure your test suite can handle changes in the data set. For example, if you are testing search and want to find out if the word blue returns a result, make sure you review products in the search results for blue. Don’t just check to see if the search result count is 12 items.

**Staging**

Creating a meaningful CI process for staging is the most difficult part of the setup. Staging requires its own process for code and data upload. Because staging is the only way code can reach production, multi-factor authentication is in place for this instance for added security.

To release code, it must be deployed to staging where it’s replicated to production. The CI process running against the staging instance must provide one-time data uploads that don’t overwrite existing objects on the instance, such as a content library. 

Don’t run tests on staging. You don’t want integration test data or code on staging to end up on production by accident. If the merchant has a good way of preventing test data (for example, test products) from being moved to production, then test on staging. If you deploy test code to staging, you might replicate it to production, causing a security risk.

Multi-factor authentication using a client certificate as the second factor is required when uploading code on staging. This adds an extra layer of security to the platform. Add multi-factor authentication to the code deployment process via [SFCC-CI](https://www.npmjs.com/package/sfcc-ci).

The [certificate](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_creating_and_using_certificates_for_code_deployment.html) that Salesforce Customer Support provides on realm creation is used to sign individual user certificate requests. Don’t use this certificate for code uploads. Instead, create individual certificates for this purpose. Here’s how you do it.

Before running any code, create a .p12 certificate file, as described in the [documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_creating_and_using_certificates_for_code_deployment.html).

SFCC-CI allows you to use the generated, user-specific .p12 file for the code upload to the Staging instance.

**Example Using a SFCC\_CI Command Line to Push Code to Staging**

To use the SDCC-CI CLI to deploy code to Staging. Check the [example](https://www.npmjs.com/package/sfcc-ci#pushing-code) for pushing code.

**Production**

For the continuous delivery process, replication to production should be manual. For the continuous deployment process, replication must be automated.

## Next Steps

In this unit, you learned about the importance of a well-defined continuous integration process, and how the Agentforce Commerce for B2C CI/CD development process relates to instance type. Next, learn how to automate and test during integration.

## Resources

*   [_Trailhead_: Develop for Salesforce B2C Commerce](https://trailhead.salesforce.com/en/content/learn/trails/develop-for-commerce-cloud) (trail)
*   [_Trailhead_: Architecture of Salesforce B2C Commerce](https://trailhead.salesforce.com/en/content/learn/modules/architecture-of-commerce-cloud-digital?trail_id=develop-for-commerce-cloud)
*   [_External Link_: DZone: What Is Functional Testing?](https://dzone.com/articles/what-is-functional-testing)
*   [_Salesforce Help_: Salesforce B2C Commerce On-Demand Sandboxes](https://trailhead.salesforce.com/en/content/learn/modules/b2c-on-demand-sandbox)
*   [_Salesforce Help_: Assign Profiles to Define Sandbox Resources](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_sandbox_resource_profiles.html)
*   [_External Link_: GitHub: SalesforceCommerceCloud/sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci) (credentials required)
*   [_External Link_: npm.js sfcc-ci](https://www.npmjs.com/package/sfcc-ci)

## Provenance

Fetched from https://trailhead.salesforce.com/content/learn/modules/b2c-build-processes-and-tests-for-technical-architects/b2c-explore-continuous-integration on 2026-10-05T08:08:54.783Z
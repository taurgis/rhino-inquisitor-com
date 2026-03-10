---
title: "{{ replace .Name "-" " " | title }}"
description: "Add a concise summary for search and sharing."
date: {{ .Date }}
lastmod: {{ .Date }}
categories:
  - general
tags: []
heroImage: ""
url: "/{{ .File.ContentBaseName | urlize }}/"
draft: true
# author: "Thomas Theunen"
# canonical: "https://www.rhino-inquisitor.com/{{ .File.ContentBaseName | urlize }}/"
# aliases:
#   - "/legacy-path/"
# seo:
#   noindex: false
#   ogImage: "/images/posts/{{ .File.ContentBaseName | urlize }}/og.webp"
#   twitterCard: summary_large_image
# params:
#   primaryTopic: "salesforce-commerce-cloud"
#   secondaryTopics:
#     - "seo"
#     - "go-live"
#   contentType: article
#   difficulty: intermediate
#   series:
#     id: "go-live"
#     title: "Go-Live"
#     position: 2
#     total: 6
#     landingPage: "/category/salesforce-commerce-cloud/go-live/"
#   summary:
#     - "Lock indexing controls before launch."
#     - "Validate redirects before any DNS cutover."
#   relatedContent:
#     nextInTopic:
#       - path: "/lets-go-live-ecdn/"
#     foundational:
#       - path: "/what-is-seo/"
#   featuredHome: false
---
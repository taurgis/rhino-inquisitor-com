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
---
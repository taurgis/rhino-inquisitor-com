---
title: "{{ replace .Name "-" " " | title }}"
description: "Add a concise summary for search and sharing."
lastmod: {{ .Date }}
heroImage: ""
url: "/{{ .File.ContentBaseName | urlize }}/"
draft: true
# author: "Thomas Theunen"
# canonical: "https://www.rhino-inquisitor.com/{{ .File.ContentBaseName | urlize }}/"
# aliases:
#   - "/legacy-path/"
# seo:
#   noindex: false
#   ogImage: "/images/pages/{{ .File.ContentBaseName | urlize }}/og.webp"
#   twitterCard: summary_large_image
# params:
#   primaryTopic: "about"
#   contentType: article
#   summary:
#     - "Keep page summaries short and editorial."
#   featuredHome: false
---
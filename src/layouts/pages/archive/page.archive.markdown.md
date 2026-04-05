{{- $categories := .Params.categories | default (slice) -}}
{{- $tags := .Params.tags | default (slice) -}}
{{- $markdownOutput := .OutputFormats.Get "markdown" -}}
{{- $body := partial "llms/clean-body.html" . | strings.TrimSpace -}}
{{- $pages := (where site.RegularPages "Type" "posts").ByDate.Reverse -}}
{{- $groups := $pages.GroupByDate "2006" -}}
---
title: {{ (.LinkTitle | default .Title) | jsonify }}
canonical_url: {{ .Permalink | jsonify }}
markdown_url: {{ with $markdownOutput }}{{ .Permalink | jsonify }}{{ else }}{{ .Permalink | jsonify }}{{ end }}
content_type: {{ (cond (eq .Type "posts") "article" "page") | jsonify }}
site_name: {{ .Site.Title | jsonify }}
{{- with .Date }}
date: {{ .Format "2006-01-02T15:04:05Z07:00" | jsonify }}
{{- end }}
{{- with .Lastmod }}
lastmod: {{ .Format "2006-01-02T15:04:05Z07:00" | jsonify }}
{{- end }}
{{- with .Params.description }}
description: {{ . | jsonify }}
{{- end }}
{{- with .Params.author }}
author: {{ . | jsonify }}
{{- end }}
categories:{{ if gt (len $categories) 0 }}
{{- range $categories }}
  - {{ . | jsonify }}
{{- end }}
{{- else }} []
{{- end }}
tags:{{ if gt (len $tags) 0 }}
{{- range $tags }}
  - {{ . | jsonify }}
{{- end }}
{{- else }} []
{{- end }}
---

{{- with .Params.takeaways }}
## Key Takeaways

{{- range . }}
- {{ . }}
{{- end }}

{{- end }}
{{- if $body }}
{{ $body | safeHTML }}
{{- else }}
Browse the Rhino Inquisitor archive for {{ len $pages }} published Salesforce Commerce Cloud articles. Use the HTML archive route for interactive search, year navigation, and grouped post listings.

## Archive Coverage

{{- range $groups }}
- {{ .Key }}: {{ len .Pages }} published article{{ if ne (len .Pages) 1 }}s{{ end }}
{{- end }}
{{- end }}
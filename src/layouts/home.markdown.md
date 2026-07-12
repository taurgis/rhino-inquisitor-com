{{- $homeProfile := hugo.Data.homepage -}}
{{- $profile := index $homeProfile "profile" | default dict -}}
{{- $blogPage := site.GetPage "/posts" -}}
{{- $aboutPage := site.GetPage "/about" -}}
{{- $posts := where .Site.RegularPages "Type" "posts" -}}
{{- $posts = $posts.ByDate.Reverse -}}
{{- $featured := false -}}
{{- with first 1 (where $posts "Params.featured" true) -}}
  {{- $featured = index . 0 -}}
{{- end -}}
{{- if and (not $featured) (gt (len $posts) 0) -}}
  {{- $featured = index $posts 0 -}}
{{- end -}}
{{- $recent := slice -}}
{{- range $posts -}}
  {{- if or (not $featured) (ne .Permalink $featured.Permalink) -}}
    {{- $recent = $recent | append . -}}
  {{- end -}}
{{- end -}}
{{- $recent = first 3 $recent -}}
{{- $intro := index $profile "intro" | default slice -}}
{{- $heroCopy := "I'm Thomas, Head of Commerce at Forward and proud father of two, Thalia and Thano. Here I share what I have learned to help others succeed in the Ohana." -}}
{{- with $intro }}{{ with index . 0 }}{{ $heroCopy = . }}{{ end }}{{ end -}}
{{- $markdownOutput := .OutputFormats.Get "markdown" -}}
---
title: {{ .Site.Title | jsonify }}
canonical_url: {{ .Permalink | jsonify }}
markdown_url: {{ with $markdownOutput }}{{ .Permalink | jsonify }}{{ else }}{{ .Permalink | jsonify }}{{ end }}
content_type: {{ "website" | jsonify }}
site_name: {{ .Site.Title | jsonify }}
{{- with .Lastmod }}
lastmod: {{ .Format "2006-01-02T15:04:05Z07:00" | jsonify }}
{{- end }}
description: {{ .Site.Params.description | jsonify }}
---

{{ $heroCopy }}

{{- with $featured }}

## Featured

[{{ .LinkTitle | default .Title }}]({{ .Permalink }})

{{ partial "article/resolve-excerpt.html" (dict "page" .) }}
{{- end }}

{{- if gt (len $recent) 0 }}

## Recent Articles

{{- range $recent }}
- [{{ .LinkTitle | default .Title }}]({{ .Permalink }}): {{ partial "article/resolve-excerpt.html" (dict "page" .) }}
{{- end }}
{{- end }}

## Explore More

- [All articles]({{ with $blogPage }}{{ .Permalink }}{{ else }}{{ "posts/" | absURL }}{{ end }})
- [About Thomas]({{ with $aboutPage }}{{ .Permalink }}{{ else }}{{ "about/" | absURL }}{{ end }})

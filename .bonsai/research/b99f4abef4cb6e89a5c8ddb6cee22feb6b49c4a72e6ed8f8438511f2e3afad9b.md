---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html#client-side-javascript-and-css-for-a-custom-attribute-editor
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html#client-side-javascript-and-css-for-a-custom-attribute-editor
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html
cache_key: b99f4abef4cb6e89a5c8ddb6cee22feb6b49c4a72e6ed8f8438511f2e3afad9b
topic: 
tags:
  - page
  - component
  - editor
  - type
  - attribute
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T13:33:44.107Z
validated_at: 2026-08-31T13:33:44.107Z
stale_after: 2026-09-30T13:33:44.107Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.md
  - 1 ::include directive(s) removed (shared snippets are not published on the .md route)
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "b91201fcc2deb89f8007999cbbb75a73"
last_modified: Fri, 28 Aug 2026 03:42:55 GMT
content_hash: ba286ff760f1cf2f94b2e0e53f4d6c3cb9dfa54e67135196b538a2e89aeaaa59
token_estimate:
  compressed: 823
  detailed: 926
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.md
search_provider: 
parent_cache_key: a0fa851d57df643ccaba3ed2c00ee85aaeb491e4adee24d129a955905c3b88cf
section_anchor: client-side-javascript-and-css-for-a-custom-attribute-editor
section_heading_path: Page Designer > Develop a Custom Attribute Editor > Client-Side JavaScript and CSS for a Custom Attribute Editor
---

## Summary

Page Designer > Develop a Custom Attribute Editor > Client-Side JavaScript and CSS for a Custom Attribute Editor

## Compressed

### Client-Side JavaScript and CSS for a Custom Attribute Editor

Put client-side JavaScript and CSS files in the cartridge's `static/default` directory.

For example, let's say the meta definition file and script file for the custom attribute editor are in the following location:

`my_bm_cartridge/cartridge/experience/editors/com/sfcc/magical.json`

`my_bm_cartridge/cartridge/experience/editors/com/sfcc/magical.js`

Put the JavaScript and CSS files here:

`my_bm_cartridge/cartridge/static/default/experience/editors/com/sfcc`

:::important The cartridge that contains the custom attribute editor meta definition file, script file, and client-side code must be added to the cartridge path for the Business Manager site. :::

This client-side JavaScript example uses a `<select>` element for user interaction.

- `group1`—Unicorn types entered into the `configuration` element of the `editor_definition` for the attribute in the component's meta definition file.
- `group2`—Unicorn types passed to the custom attribute editor from the `init` function of the editor's script file.

In this example, the editor subscribes to `sfcc:ready`.

```sfdocs-code {"lang":"javascript", "title":"magical_editor.js" }
(() => {
  subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
    console.log('sfcc:ready', dataLocale, displayLocale, value, config);

    const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;
    const { options = {}, localization = {} } = config;
    let isValid = true;

    // Append basic DOM
    const template = obtainTemplate(localization);
    const clone = document.importNode(template.content, true);
    document.body.appendChild(clone);

    // Set props
    const selectEl = document.querySelector('select');
    selectEl.required = isRequired;
    selectEl.disabled = isDisabled;

    // Set <options> from JSON config
    const optgroupEls = selectEl.querySelectorAll('optgroup');
    setOptions(options.config || [], optgroupEls[0], selectedValue);

    // Set <options> from init()
    setOptions(options.init || [], optgroupEls[1], selectedValue);

    // Apply change listener
    selectEl.addEventListener('change', event => {
      const val = event.target.value;
      emit({
        type: 'sfcc:value',
        payload: val ? { value: val } : null
      });
    });
  });

  function obtainTemplate({ placeholder, description, group1, group2 }) {
    const template = document.createElement('template');
    template.innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center;">
  <div class="slds-select_container" title="${description}">
    <select class="slds-select">
      <option value="">-- ${placeholder} --</option>
      <optgroup label="${group1}"></optgroup>
      <optgroup label="${group2}"></optgroup>
    </select>
  </div>
</div>`;
    return template;
  }

  function setOptions(options, optgroupEl, selectedValue) {
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.text = option;
      optionEl.value = option;
      optionEl.selected = option === selectedValue;

      optgroupEl.appendChild(optionEl);
    });
  }
})();
```

## Detailed

### Client-Side JavaScript and CSS for a Custom Attribute Editor

Put client-side JavaScript and CSS files in the cartridge's `static/default` directory. The location should correspond to the meta definition and script file location.

For example, let's say the meta definition file and script file for the custom attribute editor are in the following location:

`my_bm_cartridge/cartridge/experience/editors/com/sfcc/magical.json`

`my_bm_cartridge/cartridge/experience/editors/com/sfcc/magical.js`

Put the JavaScript and CSS files here:

`my_bm_cartridge/cartridge/static/default/experience/editors/com/sfcc`

:::important
The cartridge that contains the custom attribute editor meta definition file, script file, and client-side code must be added to the cartridge path for the Business Manager site.
:::

This client-side JavaScript example uses a `<select>` element for user interaction. It displays unicorn types in two `<optgroup>` elements from two different sources:

- `group1`—Unicorn types entered into the `configuration` element of the `editor_definition` for the attribute in the component's meta definition file.
- `group2`—Unicorn types passed to the custom attribute editor from the `init` function of the editor's script file.

In this example, the editor subscribes to `sfcc:ready`. When the host emits this event, the editor initializes its DOM using configuration from the server-side `init` function. It assigns unicorns to their `<optgroup>`. When users change the `<select>` value, the editor sends `sfcc:value` to the host.

```sfdocs-code {"lang":"javascript", "title":"magical_editor.js" }
(() => {
  subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
    console.log('sfcc:ready', dataLocale, displayLocale, value, config);

    const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;
    const { options = {}, localization = {} } = config;
    let isValid = true;

    // Append basic DOM
    const template = obtainTemplate(localization);
    const clone = document.importNode(template.content, true);
    document.body.appendChild(clone);

    // Set props
    const selectEl = document.querySelector('select');
    selectEl.required = isRequired;
    selectEl.disabled = isDisabled;

    // Set <options> from JSON config
    const optgroupEls = selectEl.querySelectorAll('optgroup');
    setOptions(options.config || [], optgroupEls[0], selectedValue);

    // Set <options> from init()
    setOptions(options.init || [], optgroupEls[1], selectedValue);

    // Apply change listener
    selectEl.addEventListener('change', event => {
      const val = event.target.value;
      emit({
        type: 'sfcc:value',
        payload: val ? { value: val } : null
      });
    });
  });

  function obtainTemplate({ placeholder, description, group1, group2 }) {
    const template = document.createElement('template');
    template.innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center;">
  <div class="slds-select_container" title="${description}">
    <select class="slds-select">
      <option value="">-- ${placeholder} --</option>
      <optgroup label="${group1}"></optgroup>
      <optgroup label="${group2}"></optgroup>
    </select>
  </div>
</div>`;
    return template;
  }

  function setOptions(options, optgroupEl, selectedValue) {
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.text = option;
      optionEl.value = option;
      optionEl.selected = option === selectedValue;

      optgroupEl.appendChild(optionEl);
    });
  }
})();
```

## Provenance

Section "Page Designer > Develop a Custom Attribute Editor > Client-Side JavaScript and CSS for a Custom Attribute Editor" of https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html (parent a0fa851d57df643ccaba3ed2c00ee85aaeb491e4adee24d129a955905c3b88cf)
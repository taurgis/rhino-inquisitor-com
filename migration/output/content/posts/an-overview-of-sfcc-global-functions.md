---
title: >-
  A Comprehensive Overview of Server-Side Global Functions in Salesforce B2C
  Commerce Cloud
description: >-
  In development, it's essential to have access to useful functions that can
  make your work more efficient. $1 offers several global functions which are
  h...
lastmod: '2023-10-21T18:06:29.000Z'
url: /an-overview-of-sfcc-global-functions/
draft: false
heroImage: /media/2023/flowcharts-diagrams-on-a-wall-scaled-2fd3a78550.jpeg
date: '2023-10-23T12:06:05.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
In development, it's essential to have access to useful functions that can make your work more efficient. [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/) offers several global functions which are helpful when working on the server side. These functions have a range of capabilities, from encoding and decoding characters in a URI to executing JavaScript code from a string. This article will explore these functions in detail and discuss how developers can use them to streamline their development process.

## encodeURI and encodeURIComponent

```

					encodeURI('https://mozilla.org/?x=шеллы');
// https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B
encodeURIComponent('шеллы');
//?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B



```

These functions are used to escape characters in a URI or URI component. The encodeURI function escapes characters in a URI, while the encodeURIComponent function escapes characters in a URI component. Both functions take a string that contains a URI or URI component and return a copy of the input string with certain characters replaced by hexadecimal escape sequences.

## decodeURI and decodeURIComponent

```

					decodeURI('https://www.google.com/search?q=decodeuri%20example%20%C3%A5%D0%B5%D0%BB');
// https://www.google.com/search?q=decodeuri example åел
decodeURIComponent('query=?/learning tō dėcōdė');
//query=?/learning tō dėcōdė



```

These functions are used to unescape characters in a URI component. The [decodeURI](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_decodeURI_String_DetailAnchor) function unescapes characters in a URI, while the [decodeURIComponent](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_decodeURIComponent_String_DetailAnchor) function unescapes characters in a URI component. Both these global functions take a string that contains an encoded URI or URI component and return a copy of the input string with any hexadecimal escape sequences replaced with the characters they represent.

## empty

```

					empty('')
// true
empty([]);
// true
empty('a string');
// false



```

The [empty](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_empty_Object_DetailAnchor) function is used to test whether a given object is empty. The interpretation of empty is the following: null is always empty:

-   undefined is always empty
-   a string with zero length is empty
-   an array with no elements is empty
-   a collection with no elements is empty.
-   an object returns true if the object is interpreted as empty.

## escape and unescape

![A drawing of a jail cell with a man in orange.](/media/2023/global-function-escape-drawing-a5cb04538d.jpeg)

```

					escape("äöü");
// "%E4%F6%FC"
unescape("%E4%F6%FC");
// "äöü"



```

The [escape](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_escape_String_DetailAnchor) function encodes a string by replacing characters with hexadecimal escape sequences. The [unescape](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_unescape_String_DetailAnchor) function decodes an escaped string by replacing hexadecimal character sequences with Unicode characters. Both global functions take a string as a parameter and return a copy of the input string with characters encoded or decoded.

## eval

SECURITY RISK Executing JavaScript from a string is an enormous security risk. It is far too easy for a bad actor to run arbitrary code when you use eval().

```

					eval('2 + 2');
// 4


```

The [eval](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_eval_String_DetailAnchor) function is used to execute JavaScript code from a string. However, **it is deprecated because it can be a potential security risk for server-side code injection**. The function takes a string that contains the JavaScript expression to be evaluated or the statements to be executed and returns the value of the executed call or null.

## isFinite and isNaN

![](/media/2023/the-infinity-of-space-5e44ec8ec6.jpg)

```

					isFinite(1000 / 0);
// false
isFinite(100 / 1);
// true
isNaN('100F');
// true
isNaN('0.0314E+2');
// false


```

The [isFinite](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_isFinite_Number_DetailAnchor) function is used to determine whether a specified number is finite. It takes a number as a parameter and returns true if the specified number is finite, false otherwise. The [isNaN](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_isNaN_Object_DetailAnchor) function tests the specified value to determine if it is not a number. It takes an object as a parameter and returns true if the object is not a number.

## parseFloat and parseInt

```

					parseFloat('28.695307297889173');
// 28.695307297889173
parseInt('28.695307297889173');
// 28


```

The [parseFloat](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_parseFloat_String_DetailAnchor) function is used to parse a string into a floating-point number. It takes a string as a parameter and returns the float as a number. The [parseInt](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html?resultof=%22%67%6c%6f%62%61%6c%22%20%22%63%6c%61%73%73%22%20#TopLevel_global_parseInt_1_String_DetailAnchor) function uses the specified radix to parse a string into an integer number. If no radix is specified, the function automatically determines the radix based on the input string. These functions return the integer as a number.

## Other global functions

Not all global functions that are available are described in this article, but the most important (and used) ones are.

Interested in what these functions are? Then have a look at [the documentation](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_TopLevel_global.html)!

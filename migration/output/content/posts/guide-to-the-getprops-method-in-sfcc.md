---
title: Using getProps in PWA Kit
description: >-
  Learn how the getProps method works in PWA Kit, what data it exposes, and when
  it helps with faster, cleaner storefront code.
date: '2023-05-15T09:58:07.000Z'
lastmod: '2023-05-15T12:09:08.000Z'
url: /guide-to-the-getprops-method-in-sfcc/
draft: false
heroImage: /wp-content/uploads/2023/11/traffic-warden-directing-traffic.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - pwa kit
  - sfcc
  - technical
author: Thomas Theunen
---
As a developer, you're always looking for ways to improve the performance and functionality of your projects. The PWA Kit includes several features and functions that make creating high-performance, mobile- and [SEO](https://www.rhino-inquisitor.com/lets-go-live-seo/)\-friendly web applications accessible.

In this article, we'll explore one of the critical features of the PWA Kit: the getProps method.

## Before we get started

This article assumes you have experience with React and the libraries the PWA Kit uses behind the scenes. Is this not the case? Not to worry, there is plenty of public information available to get you started:

-   [Official PWA Kit Documentation: Skills for success](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/skills-for-success.html)
-   [Your first React Component](https://react.dev/learn/your-first-component)
-   [React Router v5](https://www.sitepoint.com/react-router-complete-guide/)
-   [Isomorphic React](https://yudhajitadhikary.medium.com/isomorphic-implementation-of-react-fa6e129c246f)
-   [Understanding Higher Order Components](https://blog.logrocket.com/understanding-react-higher-order-components/)

### React Router

For navigation, the PWA Kit uses [React Router v5](https://v5.reactrouter.com/), a popular routing library for React.

React Router offers a variety of options for constructing path strings, including the ability to specify more than one path for the same component and use regular expressions to match paths that follow a pattern.

Version Note that the PWA Kit is designed to work with version 5 of React Router. While there may be newer versions available, please be aware that this library documentation may not reflect those updates.

### Express

The PWA Kit uses [Express](https://expressjs.com/), a popular web application framework for Node.js, to handle server-side rendering and API requests. Express is known for its simplicity, flexibility, and robust features, making it an excellent choice for building scalable, high-performance web applications.

In the PWA Kit, Express handles the server-side rendering of React components, improving our SPA's (Single Page Application) performance and SEO-friendliness.

Version The PWA Kit utilizes the latest stable release of Express, which is version 4. Version 5 is currently in BETA.

## What is the getProps method?

TL;DR You can access this function by adding a "page" to the [routes](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/template-retail-react-app/app/routes.jsx) file in the PWA Kit.

The getProps method is used to supply data fetched from API requests to the routeComponent via the props object. When a component from the routes array is rendered, the component's getProps method is supplied with a single JavaScript object that contains information about the rendering context, such as the URL of the request and any named route parameters.

### routeComponent

"[routeComponent](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/pwa-kit-react-sdk/src/ssr/universal/components/route-component/index.js) is a higher-order PWA Kit React SDK component that enhances each component specified in the routes array. When a component is enhanced by "[routeComponent](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/pwa-kit-react-sdk/src/ssr/universal/components/route-component/index.js)", it gains access to several static methods, including two important ones that storefront developers can customise: [getProps](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/pwa-kit-react-sdk/src/ssr/universal/components/route-component/index.js#L163) and [shouldGetProps](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/pwa-kit-react-sdk/src/ssr/universal/components/route-component/index.js#L109).

Here is a snippet from the PWA Kit where the "wrapping" happens on the client side.

```

					const props = {
    error: window.__ERROR__,
    locals: locals,
    routes: getRoutes(locals),
    WrappedApp: routeComponent(App, false, locals)
}
// ...
export const OuterApp = ({routes, error, WrappedApp, locals}) => {
    const AppConfig = getAppConfig()
    const isInitialPageRef = useRef(true)
    return (









    )
}



```

### getProps Example

```

					const ProductDetails = ({name}) => (
  {name}
)
ProductDetails.getProps = async () => {
  const response = await fetch(`https://httpbin.org/status/404`)
  const data = await response.json()
  return data // {name: "product_name}
}



```

In this example, we define a ProductDetails component that takes one prop: name. We also define a getProps function for the component that fetches data from an API and returns it as props.

Routed Pages Since the getProps function is an extension on a "route", you can only use this function if this is a component being handled by react-router! Trying to use this in other components will not work.

## getProps Object Parameter

The getProps method receives a JavaScript object with properties based on the rendering context. These include:

-   **params**:  contains [object properties](https://expressjs.com/en/4x/api.html#req.params) corresponding to named route parameters
-   **req:** an enhanced version of Node's [request object](https://expressjs.com/en/4x/api.html#req) for HTTP requests
-   **res:** representing the [HTTP response](https://expressjs.com/en/4x/api.html#res).
-   **location:** the URL of the request and is available on both client and server sides, but is not part of the Express API.

```

					ProductDetails.getProps = async ({params, req, res, location}) => {
  ...
}



```

### Add your own properties

To add custom properties to the object passed to the getProps function, define a function called extraGetPropsArgs as a property of the AppConfig component. This function can extend the set of arguments that get passed to all components enhanced by routeComponent via the getProps function.

For example, the Retail React App uses the [extraGetPropsArgs](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/f5b07a8949f56657e5e4db96464fc5dc53abced1/packages/template-retail-react-app/app/components/_app-config/index.jsx#L80) function to give all components enhanced by routeComponent access to an object for interacting with the Salesforce Commerce API.

This is achieved by defining the extraGetPropsArgs function to return an object with the API property set to locals.api.

Here is an example of how it is defined in [AppConfig](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/template-retail-react-app/app/components/_app-config/index.jsx#L82):

```

					AppConfig.restore = (locals = {}) => {
  locals.api = new CommerceAPI(apiConfig)
}
AppConfig.freeze = () => undefined
AppConfig.extraGetPropsArgs = (locals = {}) => {
  return {
    api: locals.api
  }
}


```

And now we can use that new property in our ProductDetail component:

```

					ProductDetail.getProps = async ({res, params, location, api}) => {
    const {productId} = params
    let category, product
    const urlParams = new URLSearchParams(location.search)
    product = await api.shopperProducts.getProduct({
        parameters: {
            id: urlParams.get('pid') || productId,
            allImages: true
        }
    })
    ...
}


```

## Handling errors

To handle [errors](https://www.rhino-inquisitor.com/secure-coding-in-salesforce-b2c-commerce-cloud/) in a getProps function, you have two options.

The first option is to throw an HTTPError object, which can be imported from "pwa-kit-react-sdk/ssr/universal/errors". When you throw an HTTPError, a dedicated Error component is rendered.

The second option is to use props to inform the rendered component of the error so that it can be used in custom error-handling logic.

Here's an example of how to handle errors in a getProps function:

```

					ProductDetails.getProps = async ({res}) => {
  const response = await fetch(`https://httpbin.org/status/404`)
  if (!response.ok) {
    if (response.status !== 404) {
      throw new HTTPError(response.status, response.statusText)
    }
    res && res.status(404)
    return {errorProductNotFound: true}
  }
  const data = await response.json()
  return data
}



```

## Things to keep in mind

When writing getProps functions, it's important to be selective in what data to return to keep the size of the rendered HTML down. Besides HTML size, any external API call you do will also impact the response time of that page!

You should also write conditional code in your components to handle undefined props, and render a placeholder component while props are undefined.

```

					const ProductDetails = ({name}) => (
  {name ?? 'My fallback'}
)
ProductDetails.getProps = async ({params}) => {
  const response = await fetch(`https://api.example.com/products/${params.productId}`)
  const data = await response.json()
  return data || {}
}


```

### Caching

Just like in SiteGenesis or SFRA it is possible to cache the server-side response! By setting the '[Cache-Control](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/maximizing-your-cache-hit-ratio.html)' header, the CDN knows that it should cache the response.

```

					const ProductDetails = ({name}) => (
  {name ?? 'My fallback'}
)
ProductDetails.getProps = async ({params, res}) => {
    const response = await fetch(`https://api.example.com/products/${params.productId}`)
    const data = await response.json()
    // If res exists, we are on the server-side
    if (res) {
        res.set('Cache-Control', `max-age=${MAX_CACHE_AGE}`)
    }
  return data || {}
}


```

### Personalisation

Another thing to remember is that the server side uses a "guest" token, meaning no personalisation can happen there. It makes sense, but watch out with caching (see the previous section)!

The PWA Kit has no concept of "[varyby=price\_promotion](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/isml/b2c_iscache.html)" caching. That is the responsibility of the SCAPI!

### Client Side Execution

Once the first page loads, the responsibility of displaying the content shifts from the server to your device through a process known as hydration. This is when your React app starts working in your browser.

As you interact with the page, it responds to your actions and shows the necessary elements. This efficient and user-focused approach creates the smooth experience React is known for.

The PWA Kit architecture ensures a seamless transition from server-side to client-side rendering. For instance, all components are prepared with the required information, even if it comes from API requests. This data is embedded into the page source during server-side rendering, making it available during hydration.

After this transition, you lose access to some "server-side" properties in the getProps function, such as res (Express).

![https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/rendering.html](/media/2023/pwa-kit-isomorphic-constructs-4f4cc1e134.jpg)

[Isomorphic Code](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/rendering.html) explained on developer.salesforce.com

## Conclusion

For one method, there is a lot to write about and to keep in mind! The PWA Kit has many features available, ready for use - you just need to know they exist!

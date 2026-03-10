---
title: How to filter JSDoc in Storybook Autodocs
description: >-
  Over the past few months, I have grown to love $1 as it gives me all the tools
  necessary to expose my components for testing and documentation. One of i...
lastmod: '2023-07-28T13:57:31.000Z'
url: /how-to-filter-jsdoc-in-storybook-autodocs/
draft: false
heroImage: /media/2023/frustrated-developer-illustration-a7d8092bbb.jpg
date: '2023-07-28T07:53:53.000Z'
categories:
  - React
tags:
  - storybook
  - technical
author: Thomas Theunen
---
Over the past few months, I have grown to love [Storybook](https://storybook.js.org/) as it gives me all the tools necessary to expose my components for testing and documentation.

One of its features, called "[Autodocs](https://storybook.js.org/docs/7.0/react/writing-docs/autodocs)", has been a real help to speed up getting these components exposed inside of Storybook.

Recently, I ran into an issue related to using JSDoc with Storybook. JSDoc was being printed out as Markdown but was erroneously formatted. Further, it was trying to execute the @example code, which led to console errors. I want to share how I resolved the issue through this blog post.

![Storybook JSDocs before screenshot. We see way to much information.](/media/2023/storybook-jsdocs-before-90d7cc5222.png)

Before

![Storybook JSDocs after screenshot. We no longer see anything except the description.](/media/2023/storybook-jsdocs-after-8063d0ff66.png)

After

## The problem

Autodocs aims to take all of the "hard" work out of your hands and let you focus on more important things. And that is all fine until it does something that just doesn't comply with your way of developing.

The problem primarily lay in how `<Description/>` was utilised in preview.js. As we were utilising PropTypes, we didn't need to get anything beyond the description.

## Modifying Autodocs to play nice with JSDoc

### Override the template

Luckily storybook allows us to customise the page templates by setting the "page" rendering function in preview.js(x).

```

					// .storybook/preview.jsx
import { Title, Subtitle, Description, Primary, Controls, Stories } from '@storybook/blocks';
export default {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      page: () => (
        <>

          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
  },
};


```

And the component of interest in this override is the ``<Description />`!`

### Create a custom description component

To create our component, I decided to dig into the Storybook source code to see what is necessary:

1.  The description
2.  Our own component

#### Getting the description

After digging into the code I found this function:

```

					const getDescriptionFromResolvedOf = (resolvedOf) => {
    switch (resolvedOf.type) {
        case 'story': {
            return resolvedOf.story.parameters.docs?.description?.story || null;
        }
        case 'meta': {
            const { parameters, component } = resolvedOf.preparedMeta;
            const metaDescription = parameters.docs?.description?.component;
            if (metaDescription) {
                return metaDescription;
            }
            return (
                parameters.docs?.extractComponentDescription?.(component, {
                    component,
                    parameters,
                }) || null
            );
        }
        case 'component': {
            const {
                component,
                projectAnnotations: { parameters },
            } = resolvedOf;
            return (
                parameters.docs?.extractComponentDescription?.(component, {
                    component,
                    parameters,
                }) || null
            );
        }
        default: {
            throw new Error(
                `Unrecognized module type resolved from 'useOf', got: ${(resolvedOf).type}`
            );
        }
    }
};


```

This function will extract the description based on what page we are looking at!

#### CustomDescription component

Now we need our own component to utilise this function:

```

					const ModifiedDescription = (props) => {
    const { of } = props;
    if ('of' in props && of === undefined) {
        throw new Error('Unexpected `of={undefined}`, did you mistype a CSF file reference?');
    }
    const resolvedOf = useOf(of || 'meta');
    // if @param exists, only show description up to @param
    let description = getDescriptionFromResolvedOf(resolvedOf);
    if (description) {
        description = description.split('@param')[0];
    }
    return (

            {description}

    )
}


```

Here, we use Storybook's built-in Markdown to display the content by removing everything after '@param'. This results in displaying only the description we wanted.

#### Replace the default component

Next, we replace the `<Description/>` in the Docs.page of Storybook with our custom `<ModifiedDescription/>` component.

```

					 const preview = {
    parameters: {
        docs: {
            page: () => (
                    <>

                        <Subtitle />
                        <ModifiedDescription />
                        <Primary />
                        <Controls />
                        <Stories />
                    </>
                )
        },
    };


```

## Putting it all together

```

					import {
    Title,
    Subtitle,
    Primary,
    Controls,
    Stories,
    useOf,
    Markdown
} from '@storybook/blocks';
const getDescriptionFromResolvedOf = (resolvedOf) => {
    switch (resolvedOf.type) {
        case 'story': {
            return resolvedOf.story.parameters.docs?.description?.story || null;
        }
        case 'meta': {
            const { parameters, component } = resolvedOf.preparedMeta;
            const metaDescription = parameters.docs?.description?.component;
            if (metaDescription) {
                return metaDescription;
            }
            return (
                parameters.docs?.extractComponentDescription?.(component, {
                    component,
                    parameters,
                }) || null
            );
        }
        case 'component': {
            const {
                component,
                projectAnnotations: { parameters },
            } = resolvedOf;
            return (
                parameters.docs?.extractComponentDescription?.(component, {
                    component,
                    parameters,
                }) || null
            );
        }
        default: {
            throw new Error(
                `Unrecognized module type resolved from 'useOf', got: ${(resolvedOf).type}`
            );
        }
    }
};
const ModifiedDescription = (props) => {
    const { of } = props;
    if ('of' in props && of === undefined) {
        throw new Error('Unexpected `of={undefined}`, did you mistype a CSF file reference?');
    }
    const resolvedOf = useOf(of || 'meta');
    // if @param exists, only show description up to @param
    let description = getDescriptionFromResolvedOf(resolvedOf);
    if (description) {
        description = description.split('@param')[0];
    }
    return (

            {description}

    )
}
/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
      docs: {
          page: () => (
                <>

                    <Subtitle />
                    <ModifiedDescription />
                    <Primary />
                    <Controls />
                    <Stories />
                </>
            )
      }
  },
};
export default preview;



```

---
title: What can I use ChatGPT for when working with Salesforce?
description: >-
  The year is coming to an end, but what a year it has been. As the news was
  announcing lockdowns to be over and $1, the world was in turmoil again when
  R...
lastmod: '2022-12-25T15:23:41.000Z'
url: /what-can-i-use-chatgpt-for-when-working-with-salesforce/
draft: false
date: '2022-12-26T06:44:32.000Z'
categories:
  - Corporate
tags:
  - ai
  - security
  - technical
author: Thomas Theunen
---
The year is coming to an end, but what a year it has been. As the news was announcing lockdowns to be over and [events were starting](https://www.rhino-inquisitor.com/events-and-the-golden-hoodie/), the world was in turmoil again when Russia began to invade Ukraine - putting the world on its head again. Putting that aside (but not for too long), other big things have happened this year: Big strides in publically available AI tools. Although they have been around longer than this year, they have gotten quite a bit of attention as the ease of use has grown tremendously. People generate [images based on text descriptions](https://openai.com/dall-e-2/) and [write articles by asking questions](https://chat.openai.com/). ...What? Other Services Besides OpenAI, many services are popping up in different areas. Too many to even mention.

## Some concerns

In this article, I will mainly focus on ChatGPT. But other services might be mentioned for particular concerns.

### Copyright

For AI to work, it needs to be fed large amounts of information. And luckily for them, the internet is a vast resource of publicly available data. But what about copyright? Someone wrote that "data", and maybe not everyone has given their consent to that data being ingested and used in such a way. I am no lawyer or legislative specialist, and I will follow this news. But there are already lawsuits and concerns being outed everywhere.

-   [Lawsuit Takes Aim at the Way A.I. Is Built](https://www.nytimes.com/2022/11/23/technology/copilot-microsoft-ai-lawsuit.html)
-   [Is ChatGPT a ‘virus that has been released into the wild’?](https://techcrunch.com/2022/12/09/is-chatgpt-a-virus-that-has-been-released-into-the-wild/)
-   [Artists fed up with AI-image generators use Mickey Mouse to goad copyright lawsuits](https://www.dailydot.com/debug/ai-art-protest-disney-characters-mickey-mouse/)

### Incorrect Information

We (hopefully) all know that the internet contains a lot of incorrect information. And that information has most likely also been fed to these AI. If you start asking questions to ChatGPT, heed the warnings it gives you! [![A screenshot of the warnings on the ChatGPT homepage: Incorrect info, can produce harmful instructions, and limited knowledge of the world after 2021.](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/chatgpt-warnings.jpeg) ](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/chatgpt-warnings.jpeg)Fact Check and Quality Check With each generated piece of text, do some validation and verify it to be correct and not harmful.

-   [Stack Overflow temporarily bans answers from OpenAI's ChatGPT chatbot](https://www.zdnet.com/article/stack-overflow-temporarily-bans-answers-from-openais-chatgpt-chatbot/)

### Free (for now)

Going to keep this one short: "If something is free, you are the product." Think about that one when entering information into these services. [![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/chatgpt-faq-2022.jpeg)](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/chatgpt-faq-2022.jpeg)

## What can we use it for?

With those concerns out of the way, we can get to some of the good stuff. What can we use these services for? Making our lives a little bit easier, **_one step_** at a time.

### Answer questions you have

One of the primary purposes these AI services are used for, is to answer questions. ChatGPT was trained on conversational content to explain things and respond in a "human tone". Do you have questions about a Salesforce product, chances are pretty high it will give you a correct answer. But again, keep in mind the warnings above!

### Write Content

One of the great things about ChatGPT is that it writes very detailed explanations in a very short amount of time. This can speed up writing documentation and guides needed for certain features. 2021! The Salesforce ecosystem and features change rapidly, meaning that the guides written by ChatGPT do not consider changes and new features added to the products in 2022.

### Write Code

I am getting into dangerous territory now, aren't I? Yes, [many articles have already been written about ChatGPT's ability to write code](https://www.apexhours.com/chatgpt-to-salesforce-developers/). But as these articles point out, this new "option" is dangerous for Junior developers (and also senior devs). There have been many occasions of ChatGPT providing good answers. But it has also pushed out insecure, bad performing, and bad practice code. I also tried to get it to generate Salesforce B2C Commerce Cloud code, but since most of the code is not public, it tends to create Salesforce B2B examples or give generic answers. We use "Controllers" as the name for our server-side code, which is probably not helping our case with this AI. [![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/sfra-prepend-controller-chatgpt.jpeg) ](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/sfra-prepend-controller-chatgpt.jpeg)Ok... let's try that again? [![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/sfra-prepend-reviews-chatgpt-attempt2.jpeg) ](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/sfra-prepend-reviews-chatgpt-attempt2.jpeg)Ok, that is not nearly close to what I meant. Let's see how many attempts I need for a Salesforce Apex trigger. [![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/salesforce-apex-trigger-chatgpt-download-reviews.jpeg) ](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/salesforce-apex-trigger-chatgpt-download-reviews.jpeg)That is more like it! There is much more public code available for the Salesforce platform than for B2C Commerce Cloud (Demandware). And that also explains why I need fewer attempts to get what I want. But some things could be improved in the code it generated - Notice the insert of the single review inside a loop? So again, _**USE WITH CARE**_! But you can ask the AI to correct itself: [![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/salesforce-apex-trigger-fixed-chatgpt.jpeg) ](https://www.rhino-inquisitor.com/wp-content/uploads/2022/12/salesforce-apex-trigger-fixed-chatgpt.jpeg)Maybe formulating the questions in a specific manner will generate higher-quality responses. Perhaps something like this:

```

					Write a Salesforce apex trigger to download reviews from a third party when a product is saved, making use of best practices and avoiding governor limits


```

Invalid Code Even with the corrections in the Apex Trigger mentioned above, there is still a big issue with the code generated: ['Callout from triggers are currently not supported' error](https://help.salesforce.com/s/articleView?id=000386018&type=1) But it is a starting point.

## The future

It is exciting and scary how quickly the world of AI is evolving. We have gotten quite a few new toys this year to play with. But what does 2023 have in store for us? How quickly will they evolve now that we have come to a point where data is so easily accessible and in large volumes?

## Conclusion

These new AI tools make our lives easier, and the results it is pushing out are amazing to behold. Learning how to use this tool will also take some time: The better you can formulate your questions or descriptions, the better the AI's responses will get. Speaking from personal experience, I have to rephrase my questions quite often to get a good result. Luckily, for now, the failed attempts are free. But for how long? And on a final note, make sure to fact-check and optimize what has been generated. In many cases, the text or code generated needs some "refactoring" to be useful. If there is **one takeaway** from the above article: "**Don't trust the info it gives you just yet**. Use it as a starting point - but nothing more."

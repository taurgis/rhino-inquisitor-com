---
title: Why Circumventing Salesforce B2C Commerce Cloud Quota Limits Is a Bad Idea
description: >-
  Salesforce B2C Commerce Cloud empowers developers to create robust and
  scalable e commerce solutions. It is designed with certain $1 to maintain
  efficie...
lastmod: '2023-12-11T08:29:25.000Z'
url: /why-circumventing-sfcc-quota-limits-is-a-bad-idea/
draft: false
date: '2023-12-11T08:21:33.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - quota
  - sfcc
  - technical
author: Thomas Theunen
---
Salesforce B2C Commerce Cloud empowers developers to create robust and scalable e-commerce solutions. It is designed with certain [governance and quotas](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-governance-and-quotas.html) to maintain efficiency and stability across the platform.

One such quota limit is on array sizes, which caps at 20,000 items to manage memory usage effectively. Despite these safeguards, developers may attempt to work around these limitations using custom code, like the "UnlimitedArray" I have created. While this approach is possible, it has significant implications we must consider.

Let's explore this "UnlimitedArray" I have created and discuss why I should be arrested (as implied by the image of this post) for doing so.

## Inside the "UnlimitedArray"

Below is the code for the "UnlimitedArray," a data structure designed to bypass Salesforce's restriction on the number of elements in an array:

```


/**
 * A custom implementation of an array that can hold an unlimited number of elements.
 *
 * @constructor
 */
function UnlimitedArray() {
    this.listContainer = [[]];
    this.currentListPosition = 0;
}
/**
 * The length of the array.
 *
 * @returns {number} The length of the array.
 */
Object.defineProperty(UnlimitedArray.prototype, 'length', {
    /**
     * The length of the array.
     * @returns {number} The length of the array.
     */
    get: function () {
        return this.listContainer.reduce(function (totalLength, list) {
            return totalLength + list.length;
        }, 0);
    }
});
/**
 * Adds an element to the end of the array.
 *
 * @param {*} value The element to add to the end of the array.
 *
 * @returns {number} The new length of the array.
 */
UnlimitedArray.prototype.push = function (value) {
    var currentList = this.listContainer[this.currentListPosition];
    if (currentList.length === 20000) {
        currentList = [];
        this.currentListPosition += 1;
        this.listContainer.push(currentList);
    }
    currentList.push(value);
    return this.length;
};
/**
 * Checks if the array contains the specified element.
 *
 * @param {*} value The element to check for.
 * @param {number} fromIndex The index to start checking from.
 *
 * @returns {boolean} True if the array contains the element, false otherwise.
 */
UnlimitedArray.prototype.includes = function (value, fromIndex) {
    var curFromIndex = fromIndex || 0;
    var correctedIndex = 0;
    for (var i = 0; i < this.listContainer.length; i++) {
        var currentList = this.listContainer[i];
        var currentListLength = currentList.length;
        if (curFromIndex <= (correctedIndex + currentListLength)) {
            if (currentList.includes(value, curFromIndex - correctedIndex)) {
                return true;
            }
        }
        correctedIndex += currentListLength;
    }
    return false;
};
/**
 * Returns the index of the specified element in the array.
 * If the element is not found, -1 is returned.
 *
 * @param {*} value The element to search for.
 * @param {number} fromIndex The index to start searching from.
 *
 * @returns {number} The index of the specified element in the array.
 */
UnlimitedArray.prototype.indexOf = function (value, fromIndex) {
    var curFromIndex = fromIndex || 0;
    var correctedIndex = 0;
    for (var i = 0; i < this.listContainer.length; i++) {
        var currentList = this.listContainer[i];
        var currentListLength = currentList.length;
        if (curFromIndex <= (correctedIndex + currentListLength)) {
            var index = currentList.indexOf(value, curFromIndex - correctedIndex);
            if (index >= 0) {
                return correctedIndex + index;
            }
        }
        correctedIndex += currentListLength;
    }
    return -1;
};
/**
 * Returns the element at the specified position in the array.
 *
 * @param {number} position The position of the element to return.
 *
 * @returns {*} The element at the specified position in the array.
 */
UnlimitedArray.prototype.get = function (position) {
    var currentTotalIndex = 0;
    for (var i = 0; i < this.listContainer.length; i++) {
        var list = this.listContainer[i];
        var previousTotalIndex = currentTotalIndex;
        currentTotalIndex += list.length;
        if (currentTotalIndex > position) {
            return list[position - previousTotalIndex];
        }
    }
    return null;
};



```

This construct "cleverly" uses nested arrays to exceed the Salesforce-imposed limit. However, it can result in inefficiencies when using methods such as push, get, includes, and indexOf, especially as the combined size of the nested arrays grows.

[![A screenshot of the Business Manager. The system is warning that the quota limit for the array size has been reached.](https://www.rhino-inquisitor.com/wp-content/uploads/2023/12/quota-limit-warning-1024x138.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/12/quota-limit-warning-scaled.jpg)

We are at the edge, but never crossing the limit!

### A Closer Look at the "UnlimitedArray"

The "UnlimitedArray" is a creative (but could probably be improved) solution to the B2C Commerce Cloud's limitation on the size of arrays. Here's how it operates:

#### Initialization

The "UnlimitedArray" starts as an object with a property called `listContainer`, which is an array that holds other arrays—effectively nesting arrays inside a container array. It also has a `currentListPosition`, which keeps track of the current working sub-array within the container.

#### Managing Growth

To circumvent the limit of 20,000 elements, when an individual sub-array in `listContainer` reaches this limit, the `UnlimitedArray` creates a new sub-array and continues adding elements to it. This gives the appearance of an array that can hold an "unlimited" number of elements without directly violating platform array size constraints.

#### Push Operation

When pushing an element, the function determines if the current sub-array has hit the 20,000 limit. If it has, it increments `currentListPosition`, creates a new sub-array, and appends the value there. Otherwise, it adds the value to the current sub-array.

#### Length Computation

The `length` getter provides the total count of elements within all sub-arrays in `listContainer`. It does this by reducing over the container and summing up the lengths of each sub-array.

#### Retrieval and Search

The `get`, `includes`, and `indexOf` functions iterate through each sub-array, keeping track of the offset to accurately retrieve elements or check for their existence based on their corrected position within the overall structure.

## Why You Should Think Twice

![A bear wearing an orange prison jumpsuit with a blue cloud logo on the back, walks into a prison with several guards waiting for it.](https://www.rhino-inquisitor.com/wp-content/uploads/2023/12/cloud-prison-1024x341.jpg)

No... you aren't going to get arrested 🤣

The performance penalty for using such a structure is significant — every additional layer of complexity can lead to longer execution times. For example, to determine the `length` of the "UnlimitedArray," you must sum the lengths of all included sub-arrays.

Similarly, operations like `push` may necessitate iterating through multiple arrays to find the right one to add a new element when the limit is reached. Searching for an element with `includes` or `indexOf` might require a linear search across all the nested arrays.

## The Case Against Circumventing Quota Limits

While the "UnlimitedArray" and solutions like it is a testament to the creativity and skill of Salesforce Commerce Cloud developers, it exemplifies the pitfalls of attempting to bypass platform governance. The issues range from:

1.  **Performance**: As the size of the combined data structure grows, performance can degrade, affecting user experience and increasing server resource consumption.

2.  **Maintainability**: Maintaining a custom and complex data structure is inherently more challenging and can become burdensome over time as code bases evolve and scale.

3.  **Scalability**: As e-commerce platforms typically handle a significant volume of transactions, any potential latency or performance issues can be magnified.

4.  **Adherence to Best Practices**: Salesforce imposes quotas to steer developers toward building optimised, stable, scalable applications. Ignoring these guidelines may result in short-term gains but can endanger long-term success and platform health.


## Conclusion

The "UnlimitedArray" module is a cautionary example of why circumventing Salesforce B2C Commerce Cloud's quota limitations, while technically feasible, is inadvisable. Such workarounds may introduce performance bottlenecks, complex debugging, maintenance challenges, and risk platform stability.

Instead, developers should focus on designing efficient solutions within established limits and best practices. By doing so, we ensure that our applications are performant, scalable, stable, and aligned with the vision of Salesforce's robust and enterprise-ready ecosystem.

---
title: How to migrate passwords from Magento using Argon2
description: >-
  As a developer, you might encounter situations where you need to data from one
  platform to another securely.
date: '2024-03-27T08:47:32.000Z'
lastmod: '2024-03-28T15:01:14.000Z'
url: /migrate-magento-passwords-using-argon2/
draft: false
heroImage: /media/2024/cryptography-668cd24089.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
As a developer, you might encounter situations where you need to [migrate](https://osapishchuk.medium.com/legacy-customers-password-migration-3fa1596303cc) data from one platform to another securely. This requires handling sensitive data like passwords with utmost care. In the case of Magento, password hashing is done using the Argon2 algorithm (depending on the Magento version, your mileage may vary), which is known for its security and resistance against brute force attacks.

Now, if you're migrating from Magento to Salesforce B2C Commerce Cloud, you need to make sure that the passwords are securely migrated as well. The bad news is that Salesforce B2C Commerce Cloud does not support the Argon2 algorithm out of the box for importing.

The good news is that I managed to migrate a Python script to Node.js that verifies the Magento password hash using the Argon2 algorithm.

## TL;DR; The script

I have created a [script](https://osapishchuk.medium.com/legacy-customers-password-migration-3fa1596303cc) that can be used for various purposes. However, I would strongly suggest using it only for educational purposes or with proper authorisation. You can just change this script to meet your specific needs. For example, you can use it to develop a microservice for migrational purposes with proper authorisation.

### hashes.txt

```
ab5ebf8d273b085b6a60336198e0a5a2090fdc3e0606a678315c7274ab06e046:5PiKJRn28bBKoFMopMaaKuV47aJ6GzVg:3_32_2_67108864
```

### wordlist.txt

```
Password1
Password2
Password@
Password3
```

### Script

```
const argon2 = require('argon2');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const hashFilePath = path.join(__dirname, 'hashes.txt');
const wordlistFilePath = path.join(__dirname, 'wordlist.txt');
/**
 * Verifies the given hash string with the given password.
 *
 * @param {string} hashString - The hash string to verify.
 * @param {string} password - The password to verify the hash with.
 *
 * @returns {Promise}
 */
async function verifyHash(hashString, password) {
    const split = hashString.trim().split(":");
    if (split.length !== 3) {
        console.log(`Invalid hash format: ${hashString}`);
        return;
    }
    let [hash, salt_b64, version] = split;
    if (version === "2" || version === "3") {
        version += "_32_2_67108864";
        hashString = `${hash}:${salt_b64}:${version}`;
    }
    const salt = Buffer.from(salt_b64.substring(0, 16));
    const versionInfo = version.split("_");
    if (versionInfo.length !== 4) {
        console.log(`Invalid version format: ${hashString}`);
        return;
    }
    const hashLength = parseInt(versionInfo[1]);
    const hashTimeCost = parseInt(versionInfo[2]);
    const hashMemory = parseInt(versionInfo[3]) / 1024;
    password = Buffer.from(password.trim());
    const result = await argon2.hash(password, {
        salt,
        type: argon2.argon2id,
        memoryCost: hashMemory,
        timeCost: hashTimeCost,
        parallelism: 1,
        hashLength: hashLength,
        raw: true
    });
    const hexHash = result.toString('hex');
    if (hexHash === hash) {
        console.log(`${hashString.trim()}:${password.toString()}`);
    }
}
/**
 * Processes each line of the file at the given file path.
 *
 * @param {string} filePath - The path to the file to process.
 * @param {Function} processLine - The function to process each line of the file.
 *
 * @returns {Promise}
 */
async function processFile(filePath, processLine) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        await processLine(line);
    }
}
/**
 * Processes each hash string in the hash file and verifies it with each password in the wordlist file.
 */
processFile(hashFilePath, async (hashString) => {
    await processFile(wordlistFilePath, async (password) => {
        await verifyHash(hashString, password);
    });
}).then(() => {
    console.log("Done");
});
```

## Breaking It Down

### Dependencies

The code relies on the `argon2` library to hash passwords securely using the Argon2 algorithm, which should not come as a surprise. The downside is that this module is written in C, which makes it impossible to use in the back-end of Commerce Cloud.

It is possible to migrate (probably), but it would require a significant amount of effort.

It also uses the `fs` module for reading files, `readline` for processing lines, and `path` for handling file paths.

### VerifyHash

This function takes a stored hash (`hashString`) and a candidate password (`password`).

It performs the following steps:

-   -   Parses the hash string into its components (hash, salt, and version).
    -   Adjusts the version if needed.
    -   Extracts the salt.
    -   Retrieves information about hash length, time cost, and memory cost.
    -   Computes a new hash using Argon2 with the same parameters.
    -   Compares the computed hash with the stored hash.
    -   If they match, it logs the hash and the original password.

#### Version Information

Luckily, Magento stores the required parameters for Argon2 in its version number, which can be extracted for our purposes:

_hash_:_salt_:**3\_32\_2\_67108864**

## Conclusion

Although Commerce Cloud does not support Argon2 by default, this workaround is available. You can create a Microservice in Node.js to enable frictionless migration for customers.

During login, you can call the service to verify the entered credentials and update the Commerce Cloud password with the available plain text password.

After the migration, you should have an attribute to turn off this service call for that account to avoid unnecessary calls.

Security As we are dealing with sensitive data, it is crucial to ensure that your service is built securely and that hashes or passwords are never exposed to the outside world.

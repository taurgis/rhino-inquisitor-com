---
title: 'Navigating Dates, Calendars, and Timezones in Salesforce B2C Commerce Cloud'
description: >-
  In today's world, managing dates, calendars, and time zones is expected for
  any e-commerce platform.
date: '2023-08-14T17:27:04.000Z'
lastmod: '2023-08-15T07:44:20.000Z'
url: /navigating-dates-calendars-in-sfcc/
draft: false
heroImage: /media/2023/a-clock-as-a-shopping-bag-7fc3eb9c21.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
In today's world, managing dates, calendars, and time zones is expected for any e-commerce platform. [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/) is no exception, and this article will explore the intricacies of working with dates and calendars in SFCC, focusing on the JavaScript Date object, the Java Calendar class.

By understanding these concepts, you can ensure that your code works seamlessly across different regions and time zones.

## Date (JavaScript)

The JavaScript Date object is a built-in object that represents and manipulates dates and times. It provides [a range of methods](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/index.html?target=class_TopLevel_Date.html) for parsing, formatting, and performing calculations with dates and times. The Date object can be instantiated with or without arguments, representing either a specific date and time or the current date and time by default.

Example 1: Creating a Date object and displaying the current date and time

```

					const currentDate = new Date();
console.log("Current date and time:", currentDate.toString());



```

Example 2: Calculating the difference between two dates

```

					const startDate = new Date("2023-01-01");
const endDate = new Date("2023-12-31");
const timeDifference = endDate - startDate;
const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
console.log("Days between the two dates:", daysDifference);


```

## Calendar (Rhino / Java)

The [Rhino Engine](https://en.wikipedia.org/wiki/Rhino_\(JavaScript_engine\)) is a JavaScript runtime that allows Java classes to be used within JavaScript code, enabling developers to leverage Java's powerful features in their scripts.

One such Java class is the [Calendar](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_util_Calendar.html), which provides advanced functionality for working with dates and times. The Calendar class offers methods for converting between different date and time representations.

It also enables developers to work with timezones, a crucial aspect of managing dates and times globally.

Different than Java Even though it has been exposed, some differences exist, such as how to instantiate a Calendar.

e.g. "Calendar.getInstance()" in Java vs "new Calendar()" in the Rhino Engine.

Example 1: Creating a Calendar instance and setting the date

```

					var Calendar = require('dw/util/Calendar');
var calendarInstance = new Calendar()
calendarInstance.set(2023, Calendar.JANUARY, 1);


```

Example 2: Adding days to a Calendar instance with a particular timezone and converting to a JavaScript Date object

```

					var Calendar = require('dw/util/Calendar');
var calendarInstance = new Calendar();
calendarInstance.setTimeZone( "Etc/GMT+1" );
calendarInstance.add(Calendar.DATE, 10);
var dateInstance = calendarInstance.getTime();


```

But in this use case, "odd things" happen. Watch for the "pitfalls" section at the end of this article!

## Working with timezones

In the previous section, we discussed how to work with time zones in the Calendar class. But there are multiple functions available to manipulate the zones, such as:

1.  **Setting the timezone**: You can set the timezone for a Calendar instance using the [setTimeZone()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_util_Calendar.html#dw_util_Calendar_setTimeZone_String_DetailAnchor) method, which accepts a TimeZone object as its argument.
2.  **Getting the timezone**: To retrieve the timezone of a Calendar instance, use the [getTimeZone()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_util_Calendar.html#dw_util_Calendar_getTimeZone_DetailAnchor) method, which returns a TimeZone object.
3.  **Converting between timezones**: To convert a date and time between different timezones, you can create a new Calendar instance with the desired timezone and set its time using the [setTime()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_util_Calendar.html#dw_util_Calendar_setTime_Date_DetailAnchor) method.

### Configuring timezones

If you didn't know already, it is possible to configure what time zone your instance uses and what time zone your sites are in.

-   [Setting your Instance Time Zone](https://help.salesforce.com/s/articleView?id=cc.b2c_instance_time_zone.htm&language=en_us&release=2.0.1&type=5)
-   [Setting your Site Time Zone](https://help.salesforce.com/s/articleView?id=cc.b2c_site_time_zone.htm&language=en_us&release=2.0.1&type=5)

### Getting the configured values

Once you have these configured, you kind of hope that there is some way to access these settings in the code (not everything is available after all).

Example 1: Getting the Instance Time Zone

```

					var System = require('dw/system/System');
var instanceTimeZone = System.getInstanceTimeZone();


```

-   [Function Documentation](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_System.html#dw_system_System_getInstanceTimeZone_DetailAnchor)

Example 2: Getting the Site Time Zone

```

					var Site = require('dw/system/Site');
var siteTimeZone = Site.getCurrent().getTimezone();
// Get it as a Calendar with the timezone set.
var siteTimeZoneCalendar = Site.getCalendar();


```

-   [Function Documentation](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Site.html#dw_system_Site_getTimezone_DetailAnchor)

### List of zone IDs

To get the list of supported zones, I executed some Java code:

```

					import java.util.TimeZone;
public class HelloWorld {
    public static void main(String []args) {
        String [] zones = TimeZone.getAvailableIDs();
        for ( String zone : zones) {
            System.out.println(zone);
        }
    }
}


```

Which results in this list:

```

					Africa/Abidjan
Africa/Accra
Africa/Addis_Ababa
Africa/Algiers
Africa/Asmara
Africa/Asmera
Africa/Bamako
Africa/Bangui
Africa/Banjul
Africa/Bissau
Africa/Blantyre
Africa/Brazzaville
Africa/Bujumbura
Africa/Cairo
Africa/Casablanca
Africa/Ceuta
Africa/Conakry
Africa/Dakar
Africa/Dar_es_Salaam
Africa/Djibouti
Africa/Douala
Africa/El_Aaiun
Africa/Freetown
Africa/Gaborone
Africa/Harare
Africa/Johannesburg
Africa/Juba
Africa/Kampala
Africa/Khartoum
Africa/Kigali
Africa/Kinshasa
Africa/Lagos
Africa/Libreville
Africa/Lome
Africa/Luanda
Africa/Lubumbashi
Africa/Lusaka
Africa/Malabo
Africa/Maputo
Africa/Maseru
Africa/Mbabane
Africa/Mogadishu
Africa/Monrovia
Africa/Nairobi
Africa/Ndjamena
Africa/Niamey
Africa/Nouakchott
Africa/Ouagadougou
Africa/Porto-Novo
Africa/Sao_Tome
Africa/Timbuktu
Africa/Tripoli
Africa/Tunis
Africa/Windhoek
America/Adak
America/Anchorage
America/Anguilla
America/Antigua
America/Araguaina
America/Argentina/Buenos_Aires
America/Argentina/Catamarca
America/Argentina/ComodRivadavia
America/Argentina/Cordoba
America/Argentina/Jujuy
America/Argentina/La_Rioja
America/Argentina/Mendoza
America/Argentina/Rio_Gallegos
America/Argentina/Salta
America/Argentina/San_Juan
America/Argentina/San_Luis
America/Argentina/Tucuman
America/Argentina/Ushuaia
America/Aruba
America/Asuncion
America/Atikokan
America/Atka
America/Bahia
America/Bahia_Banderas
America/Barbados
America/Belem
America/Belize
America/Blanc-Sablon
America/Boa_Vista
America/Bogota
America/Boise
America/Buenos_Aires
America/Cambridge_Bay
America/Campo_Grande
America/Cancun
America/Caracas
America/Catamarca
America/Cayenne
America/Cayman
America/Chicago
America/Chihuahua
America/Coral_Harbour
America/Cordoba
America/Costa_Rica
America/Creston
America/Cuiaba
America/Curacao
America/Danmarkshavn
America/Dawson
America/Dawson_Creek
America/Denver
America/Detroit
America/Dominica
America/Edmonton
America/Eirunepe
America/El_Salvador
America/Ensenada
America/Fort_Nelson
America/Fort_Wayne
America/Fortaleza
America/Glace_Bay
America/Godthab
America/Goose_Bay
America/Grand_Turk
America/Grenada
America/Guadeloupe
America/Guatemala
America/Guayaquil
America/Guyana
America/Halifax
America/Havana
America/Hermosillo
America/Indiana/Indianapolis
America/Indiana/Knox
America/Indiana/Marengo
America/Indiana/Petersburg
America/Indiana/Tell_City
America/Indiana/Vevay
America/Indiana/Vincennes
America/Indiana/Winamac
America/Indianapolis
America/Inuvik
America/Iqaluit
America/Jamaica
America/Jujuy
America/Juneau
America/Kentucky/Louisville
America/Kentucky/Monticello
America/Knox_IN
America/Kralendijk
America/La_Paz
America/Lima
America/Los_Angeles
America/Louisville
America/Lower_Princes
America/Maceio
America/Managua
America/Manaus
America/Marigot
America/Martinique
America/Matamoros
America/Mazatlan
America/Mendoza
America/Menominee
America/Merida
America/Metlakatla
America/Mexico_City
America/Miquelon
America/Moncton
America/Monterrey
America/Montevideo
America/Montreal
America/Montserrat
America/Nassau
America/New_York
America/Nipigon
America/Nome
America/Noronha
America/North_Dakota/Beulah
America/North_Dakota/Center
America/North_Dakota/New_Salem
America/Nuuk
America/Ojinaga
America/Panama
America/Pangnirtung
America/Paramaribo
America/Phoenix
America/Port-au-Prince
America/Port_of_Spain
America/Porto_Acre
America/Porto_Velho
America/Puerto_Rico
America/Punta_Arenas
America/Rainy_River
America/Rankin_Inlet
America/Recife
America/Regina
America/Resolute
America/Rio_Branco
America/Rosario
America/Santa_Isabel
America/Santarem
America/Santiago
America/Santo_Domingo
America/Sao_Paulo
America/Scoresbysund
America/Shiprock
America/Sitka
America/St_Barthelemy
America/St_Johns
America/St_Kitts
America/St_Lucia
America/St_Thomas
America/St_Vincent
America/Swift_Current
America/Tegucigalpa
America/Thule
America/Thunder_Bay
America/Tijuana
America/Toronto
America/Tortola
America/Vancouver
America/Virgin
America/Whitehorse
America/Winnipeg
America/Yakutat
America/Yellowknife
Antarctica/Casey
Antarctica/Davis
Antarctica/DumontDUrville
Antarctica/Macquarie
Antarctica/Mawson
Antarctica/McMurdo
Antarctica/Palmer
Antarctica/Rothera
Antarctica/South_Pole
Antarctica/Syowa
Antarctica/Troll
Antarctica/Vostok
Arctic/Longyearbyen
Asia/Aden
Asia/Almaty
Asia/Amman
Asia/Anadyr
Asia/Aqtau
Asia/Aqtobe
Asia/Ashgabat
Asia/Ashkhabad
Asia/Atyrau
Asia/Baghdad
Asia/Bahrain
Asia/Baku
Asia/Bangkok
Asia/Barnaul
Asia/Beirut
Asia/Bishkek
Asia/Brunei
Asia/Calcutta
Asia/Chita
Asia/Choibalsan
Asia/Chongqing
Asia/Chungking
Asia/Colombo
Asia/Dacca
Asia/Damascus
Asia/Dhaka
Asia/Dili
Asia/Dubai
Asia/Dushanbe
Asia/Famagusta
Asia/Gaza
Asia/Harbin
Asia/Hebron
Asia/Ho_Chi_Minh
Asia/Hong_Kong
Asia/Hovd
Asia/Irkutsk
Asia/Istanbul
Asia/Jakarta
Asia/Jayapura
Asia/Jerusalem
Asia/Kabul
Asia/Kamchatka
Asia/Karachi
Asia/Kashgar
Asia/Kathmandu
Asia/Katmandu
Asia/Khandyga
Asia/Kolkata
Asia/Krasnoyarsk
Asia/Kuala_Lumpur
Asia/Kuching
Asia/Kuwait
Asia/Macao
Asia/Macau
Asia/Magadan
Asia/Makassar
Asia/Manila
Asia/Muscat
Asia/Nicosia
Asia/Novokuznetsk
Asia/Novosibirsk
Asia/Omsk
Asia/Oral
Asia/Phnom_Penh
Asia/Pontianak
Asia/Pyongyang
Asia/Qatar
Asia/Qostanay
Asia/Qyzylorda
Asia/Rangoon
Asia/Riyadh
Asia/Saigon
Asia/Sakhalin
Asia/Samarkand
Asia/Seoul
Asia/Shanghai
Asia/Singapore
Asia/Srednekolymsk
Asia/Taipei
Asia/Tashkent
Asia/Tbilisi
Asia/Tehran
Asia/Tel_Aviv
Asia/Thimbu
Asia/Thimphu
Asia/Tokyo
Asia/Tomsk
Asia/Ujung_Pandang
Asia/Ulaanbaatar
Asia/Ulan_Bator
Asia/Urumqi
Asia/Ust-Nera
Asia/Vientiane
Asia/Vladivostok
Asia/Yakutsk
Asia/Yangon
Asia/Yekaterinburg
Asia/Yerevan
Atlantic/Azores
Atlantic/Bermuda
Atlantic/Canary
Atlantic/Cape_Verde
Atlantic/Faeroe
Atlantic/Faroe
Atlantic/Jan_Mayen
Atlantic/Madeira
Atlantic/Reykjavik
Atlantic/South_Georgia
Atlantic/St_Helena
Atlantic/Stanley
Australia/ACT
Australia/Adelaide
Australia/Brisbane
Australia/Broken_Hill
Australia/Canberra
Australia/Currie
Australia/Darwin
Australia/Eucla
Australia/Hobart
Australia/LHI
Australia/Lindeman
Australia/Lord_Howe
Australia/Melbourne
Australia/NSW
Australia/North
Australia/Perth
Australia/Queensland
Australia/South
Australia/Sydney
Australia/Tasmania
Australia/Victoria
Australia/West
Australia/Yancowinna
Brazil/Acre
Brazil/DeNoronha
Brazil/East
Brazil/West
CET
CST6CDT
Canada/Atlantic
Canada/Central
Canada/Eastern
Canada/Mountain
Canada/Newfoundland
Canada/Pacific
Canada/Saskatchewan
Canada/Yukon
Chile/Continental
Chile/EasterIsland
Cuba
EET
EST5EDT
Egypt
Eire
Etc/GMT
Etc/GMT+0
Etc/GMT+1
Etc/GMT+10
Etc/GMT+11
Etc/GMT+12
Etc/GMT+2
Etc/GMT+3
Etc/GMT+4
Etc/GMT+5
Etc/GMT+6
Etc/GMT+7
Etc/GMT+8
Etc/GMT+9
Etc/GMT-0
Etc/GMT-1
Etc/GMT-10
Etc/GMT-11
Etc/GMT-12
Etc/GMT-13
Etc/GMT-14
Etc/GMT-2
Etc/GMT-3
Etc/GMT-4
Etc/GMT-5
Etc/GMT-6
Etc/GMT-7
Etc/GMT-8
Etc/GMT-9
Etc/GMT0
Etc/Greenwich
Etc/UCT
Etc/UTC
Etc/Universal
Etc/Zulu
Europe/Amsterdam
Europe/Andorra
Europe/Astrakhan
Europe/Athens
Europe/Belfast
Europe/Belgrade
Europe/Berlin
Europe/Bratislava
Europe/Brussels
Europe/Bucharest
Europe/Budapest
Europe/Busingen
Europe/Chisinau
Europe/Copenhagen
Europe/Dublin
Europe/Gibraltar
Europe/Guernsey
Europe/Helsinki
Europe/Isle_of_Man
Europe/Istanbul
Europe/Jersey
Europe/Kaliningrad
Europe/Kiev
Europe/Kirov
Europe/Kyiv
Europe/Lisbon
Europe/Ljubljana
Europe/London
Europe/Luxembourg
Europe/Madrid
Europe/Malta
Europe/Mariehamn
Europe/Minsk
Europe/Monaco
Europe/Moscow
Europe/Nicosia
Europe/Oslo
Europe/Paris
Europe/Podgorica
Europe/Prague
Europe/Riga
Europe/Rome
Europe/Samara
Europe/San_Marino
Europe/Sarajevo
Europe/Saratov
Europe/Simferopol
Europe/Skopje
Europe/Sofia
Europe/Stockholm
Europe/Tallinn
Europe/Tirane
Europe/Tiraspol
Europe/Ulyanovsk
Europe/Uzhgorod
Europe/Vaduz
Europe/Vatican
Europe/Vienna
Europe/Vilnius
Europe/Volgograd
Europe/Warsaw
Europe/Zagreb
Europe/Zaporozhye
Europe/Zurich
GB
GB-Eire
GMT
GMT0
Greenwich
Hongkong
Iceland
Indian/Antananarivo
Indian/Chagos
Indian/Christmas
Indian/Cocos
Indian/Comoro
Indian/Kerguelen
Indian/Mahe
Indian/Maldives
Indian/Mauritius
Indian/Mayotte
Indian/Reunion
Iran
Israel
Jamaica
Japan
Kwajalein
Libya
MET
MST7MDT
Mexico/BajaNorte
Mexico/BajaSur
Mexico/General
NZ
NZ-CHAT
Navajo
PRC
PST8PDT
Pacific/Apia
Pacific/Auckland
Pacific/Bougainville
Pacific/Chatham
Pacific/Chuuk
Pacific/Easter
Pacific/Efate
Pacific/Enderbury
Pacific/Fakaofo
Pacific/Fiji
Pacific/Funafuti
Pacific/Galapagos
Pacific/Gambier
Pacific/Guadalcanal
Pacific/Guam
Pacific/Honolulu
Pacific/Johnston
Pacific/Kanton
Pacific/Kiritimati
Pacific/Kosrae
Pacific/Kwajalein
Pacific/Majuro
Pacific/Marquesas
Pacific/Midway
Pacific/Nauru
Pacific/Niue
Pacific/Norfolk
Pacific/Noumea
Pacific/Pago_Pago
Pacific/Palau
Pacific/Pitcairn
Pacific/Pohnpei
Pacific/Ponape
Pacific/Port_Moresby
Pacific/Rarotonga
Pacific/Saipan
Pacific/Samoa
Pacific/Tahiti
Pacific/Tarawa
Pacific/Tongatapu
Pacific/Truk
Pacific/Wake
Pacific/Wallis
Pacific/Yap
Poland
Portugal
ROK
Singapore
SystemV/AST4
SystemV/AST4ADT
SystemV/CST6
SystemV/CST6CDT
SystemV/EST5
SystemV/EST5EDT
SystemV/HST10
SystemV/MST7
SystemV/MST7MDT
SystemV/PST8
SystemV/PST8PDT
SystemV/YST9
SystemV/YST9YDT
Turkey
UCT
US/Alaska
US/Aleutian
US/Arizona
US/Central
US/East-Indiana
US/Eastern
US/Hawaii
US/Indiana-Starke
US/Michigan
US/Mountain
US/Pacific
US/Samoa
UTC
Universal
W-SU
WET
Zulu
EST
HST
MST
ACT
AET
AGT
ART
AST
BET
BST
CAT
CNT
CST
CTT
EAT
ECT
IET
IST
JST
MIT
NET
NST
PLT
PNT
PRT
PST
SST
VST


```

## Pitfalls

![A shadow in front of a gigantic clock, wondering about the intricacies of dates and times.](/media/2023/a-shadow-in-front-of-a-clock-e925bae223.jpg)

As we all know, with development, we run into some unexpected results and requirements that require thorough investigation and thought.

To help you on your way in this process, here is a list of some of the pitfalls to think about.

### Daylight Saving Time (DST / Summer Time)

> Summertime, also known as Daylight Saving Time, is a system of uniformly advancing clocks to extend daylight hours during conventional waking time in the summer months. In countries in the Northern Hemisphere, clocks are usually set ahead one hour in late March or April and are set back one hour in late September or October. The primary purpose of Daylight Saving Time is to make better use of daylight. The practice of advancing clocks by one hour during warmer months so that darkness falls at a later clock time is known as Summer Time.

This is fun and all, but that also means that some time zones change how many hours they are ahead or behind during this period! Which can be confusing and a source of many bugs!

### Conversion

I put a warning up earlier, didn't I, with the Calendar - Date conversion? Well, now is the time to explain myself!

The first thing I would recommend to anyone is to read the documentation carefully because it contains a very clear warning!

![A screenshot of the documentation with the following text: "WARNING: Keep in mind that the given Date object is always interpreted in the time zone GMT. This means time zone information at the calendar object needs to be set separately by using the setTimeZone(String) method."](/media/2023/calendar-constructor-warning-83ef0dcd2b.png)

A warning when creating a Calendar from a Date

![A screenshot of a warning inside of the documentation: "Keep in mind that the returned Date object's time is always interpreted in the time zone GMT. This means time zone information set at the calendar object will not be honored and gets lost."](/media/2023/calendar-to-date-warning-a652a2a931.png)

A warning when converting from a Calendar to Date

Documentation Many Calendar functions have helpful examples to understand the intricacies of working with timezones.

### Caching

It is crucial to remember that the Page Cache does not maintain individual caches for each Time Zone when presenting data.

In certain situations, it may be necessary to rely on client-side JavaScript to accurately calculate data based on the current user's Time Zone.

### Storefront Toolkit

We mentioned the function to get the Calendar automatically in the Site timezone before: "[Site.getCalendar()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Site.html#dw_system_Site_getCalendar_DetailAnchor)".

To ensure your code incorporates the toolkit, it is necessary to utilise this function. To provide a more precise understanding, I have recorded a video demonstrating this behaviour:

https://www.rhino-inquisitor.com/wp-content/uploads/2023/08/storefront-tookit-and-calendars.mov

### Is there a third-party way?

Funny you should ask 😉, a few years ago, I asked myself the same question [and got the crazy idea of making well-known libraries compatible with the Rhino Engine](https://github.com/taurgis/salesforce-commerce-cloud-libraries).

One of those libraries was [date-fns](https://date-fns.org/), a library with modular, efficient, and reliable date and time functionalities for projects. It promotes a function-per-file approach to avoid unnecessary bloat in projects.

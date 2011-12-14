Helsinki area Journey Planner for AaltoWindow multitouch tables.

Description
-----------

Aalto Journey Planner is a HTML5 application, which brings public transport journey planning to multitouch environments. The application is a mashup service that uses Google Maps API, HSL’s Journey Planner API and Google Infographics API to create an alternative user interface for the Journey Planner. All code is standards-compliant, so the application works on many touchscreen devices as it is.

The application has been designed to be fast and intuitive to use on a multitouch display. In particular, there are no text input fields. All interaction relies on touch gestures and taps, and to streamline the user experience, the start position is preset so only the destination needs to be set by the user. This is treasonable considering the application is meant to be used on stationary Aalto Window touch tables. 

The typical use scenario is for a Aalto University student to search a route from his/her current position to another Aalto campus. This only takes a single tap: the campuses are set as favorites on the map, and tapping one will result in three possible routes shown. The user can select which one of the routes to be shown on the map by tapping the route’s description. If the desired destination is anywhere else, the user can either drag and drop the goal flag or tap and hold, and the routes are recalculated. The journey’s start time can also be changed with swipe gestures on the Mobiscroll widget.

The application consists of a barebone HTML-file (index.html), a stylesheet (common.css) and two Javascript files (config.js and app.js). Config.js is the application’s configuration file. It includes Journey Planner API credentials and all the default locations: map center, start, end and favorites. Only the map center and start locations are required, others are optional. If the end location is set, the application will calculate routes as it starts up. Otherwise the destination needs to be set by the user before any routes are displayed.


Installation instructions:
--------------------------

1. Request Reittiopas API account from http://developer.reittiopas.fi/pages/en/account-request.php
2. Rename config.js.template to config.js and add account details
3. Enable Apache mod_proxy and mod_proxy_http

Notes:

- apiProxy -folder is a Apache proxy to Reittiopas API to prevent cross-domain issues
- If you want to use a different proxy, change it in config.js


Running on a multitouch table with Google Chrome:
-------------------------------------------------

Add following startup parameters to the chrome application

1) Enable touch events 
--enable-touch-events 

2) Switch user agent to iOS to get the right version of Google Maps JS API
--user-agent="Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10"


Used libraries
--------------

* JQuery 1.7
* Mobiscroll 1.5.2
* Google Maps API
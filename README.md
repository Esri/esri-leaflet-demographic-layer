# Esri Leaflet Demographic Layers

Esri Leaflet Demographic Layers is a Leaflet plugin that will allow you to render and query demographic maps from ArcGIS Online.

**Currently Esri Leaflet Demographic Layers is in development and should be thought of as a beta or preview.**

Despite sharing a name and a namespace with Esri Leaflet, Esri Leaflet Geocoder does not require Esri Leaflet. It is however tested with Esri Leaflet and will work just fine with or without it.

## Demo

[View the demo](http://esri.github.io/esri-leaflet-demographic-layer/). 

**An ArcGIS Online account is required!** You can sign up for a free developer account on [ArcGIS for Developers](https://developers.arcgis.com/en/sign-up/).

![Demographic Layer](https://raw.github.com/Esri/esri-leaflet-demographic-layer/master/preview.jpg)

## Documentation

In order to use Esri Leaflet Demographic Layers you will need an ArcGIS account. You can sign up for a free developer account on [ArcGIS for Developers](https://developers.arcgis.com/en/sign-up/).

You will also need to obtain `access_tokens` in order to use these services. See the [handling authentication](#handling-authentication) documentation for more info.

* [L.esri.Demographics.DemographicLayer](#lesridemographicsdemographiclayer)
* [L.esri.Demographics.Legend](#lesridemographicslegend)
* [Handling Authentication](#handling-authentication)
* [Available Layers](#available-layers)
* [Costs](#cost)

### L.esri.Demographics.DemographicLayer

Render the ArcGIS Online demographic layers.

#### Constructor

Constructor | Description
--- | ---
`new L.esri.Demographics.DemographicLayer(key, options)`<br>`L.esri.Demographics.demographicLayer(key, options)` | `key` should be one of the [available layer](#available-layers) keys.

#### Options

Option | Type | Default | Description
--- | --- | --- | ---
`token` | `String` | `null` | If you pass a token in your options it will included in all requests to the service. See [handling authentication](#handling-authentication) for more information.
`opacity` | `Integer` | `0.5` | Opacity of the layer. Generally this should be between `0.25` and `0.75` for best results.
`detectRetina` | `Boolean` | `false` | If `true` on retina devices higher quality images will be fetched from the server, however these images are also much larger so this must be enabled with care.
`debounce` | `Integer` | `150` | Controls the delay between requesting new images when panning or zooming.
`position` | `String` | `"front"` | can be set to `"front"` or `"back"` to control where the layer is placed in the overlay stack. 

#### Events

Event | Data | Description
--- | --- | ---
`loading` | [`Loading`](#loading-event) | Fires when new features start loading.
`load` | [`Load`](#load-event) | Fires when all features in the current bounds of the map have loaded.
`metadata` | [`Metadata`](#metadata-event) | After creating a new `L.esri.ClusteredFeatureLayer` a request for data describing the service will be made and passed to the metadata event.
`authenticationrequired` | [`Authentication`](#authentication-event) | This will be fired when a request to a service fails and requires authentication. See [handling authentication](#handling-authentication) for more information.

#### Methods

Method | Returns |  Description
--- | --- | ---
`query(latlng, callback)` | `null` | Used to query detailed demographic info about an area. The first parameter is a [`L.LatLng`](http://leafletjs.com/reference.html#latlng) object, the second is a callback that will be passed GeoJSON is the query was successful or an error message.


#### Example

```js
var layer = L.esri.Demographics.demographicLayer('USAAverageHouseholdSize', {
    token: token
}).addTo(map);

map.on(click, function(e){
    layer.query(e.latlng, function(response){
        // response will be a GeoJSON Feature Collection
    });    
})
```

### L.esri.Demographics.Legend

Generates a legend for a given layer key that can be displayed on the map.

#### Constructor

Constructor | Description
--- | ---
`new L.esri.Demographics.Legend(key, options)`<br>`L.esri.Demographics.legend(key, options)` | `key` should be one of the [available layer](#available-layers) keys.

#### Options

`L.esri.Demographics.Legend` Inherits all options from [`L.Control`](http://leafletjs.com/reference.html#control).

#### Methods

`L.esri.Demographics.Legend` Inherits all methods from [`L.Control`](http://leafletjs.com/reference.html#control).

#### Example

```
var legend = new L.esri.Demographics.Legend("USAAverageHouseholdSize").addTo(map);
```

### Handling Authentication

Esri Leaflet supports access private services on ArcGIS Online and ArcGIS Server services that require authentication.

Handing authentication in Esri Leaflet is flexible and lightweight but makes serveral assumptions.

1. You (the developer) will handle obtaining and persisting tokens.
2. Your token will be used automatically to access services.
3. Esri Leaflet Demographics will notify you when it recives an error while using your token and prompt you for a new one via the `authenticationrequired`.

The [current demo](https://github.com/Esri/esri-leaflet-demographic-layer/blob/master/demo/index.html) shows and example of allowing users to sign in via OAuth 2.0 and obtaining access tokens. If your users do not have ArcGIS Online accounts or you do not want to force your users to login you can [generate tokens on the server](https://developers.arcgis.com/authentication/app-logins.html) and pass them to Esri Leaflet Demographics.

### Available Layers

In order to use `L.esri.Demographics.DemographicLayer` or `L.esri.Demographics.Legend` you must have a layer key from one of the [layer files](https://github.com/Esri/esri-leaflet-demographic-layer/tree/master/layers). These files are small peices of metadata that map the ArcGIS Online maps to easy to read keys.

You can view a full list of all 250+ keys [here](https://github.com/Esri/esri-leaflet-demographic-layer/blob/master/layers/README.md)

Make sure you load the layer file for the keys you want to make available for use AFTER you load `esri-leaflet-demographics.js`.

```html
<!-- Load the required JS and CSS files -->
<link href="esri-leaflet-legend.css" rel="stylesheet" />
<script src="esri-leaflet-demographics.js"></script>

<!-- Load US and Canadian layer keys -->
<script src="usa.js"></script>
<script src="canada.js"></script>
``` 

### Costs

Using theses demographic maps will use credits from your ArcGIS Online account. You can check the current cost of the demographic map service and learn more about credits [here](https://developers.arcgis.com/credits/)

If you are using a [free development and testing](https://developers.arcgis.com/plans) account from [http://developers.arcgis.com](http://developers.arcgis.com). You can draw about 50,000 map views with the 50 credits per month you recive as part of that plan.

Make sure you familiarize yourself with the [ArcGIS for Developers terms](https://developers.arcgis.com/en/terms/) and [FAQ](https://developers.arcgis.com/en/terms/faq/) before launching your application.

### Events

#### Metadata Event

Data | Value | Description
--- | --- | ---
`bounds` | [`LatLngBounds`](http://leafletjs.com/reference.html#latlngbounds) | The bounds that features are currently being loaded.
`metadata` | `Object` | The JSON metadata for the service. See below.

#### Loading Event

Data | Value | Description
--- | --- | ---
`bounds` | [`LatLngBounds`](http://leafletjs.com/reference.html#latlngbounds) | The bounds that features are currently being loaded.

#### Load Event

Data | Value | Description
--- | --- | ---
`bounds` | [`LatLngBounds`](http://leafletjs.com/reference.html#latlngbounds) | The bounds that where loaded.

#### Authentication Event

Data | Value | Description
--- | --- | ---
`retry` | `Function` | Pass an access token to this method to retry the failed request and update the `token` parameter for the layer. See [handling authentication](#handling-authentication) for more information.

## Development Instructions

1. [Fork and clone](https://help.github.com/articles/fork-a-repo)
2. `cd` into the `esri-leaflet-demographic-layer` folder
3. Install the dependancies with `npm install`
4. Copy the `spec/config.json.example` file to `spec/conifg.json` and fill in your client ID and client secret from an app on arcgis for developers.
5. The demo in the `/demo` folder should work
6. Make your changes and create a [pull request](https://help.github.com/articles/creating-a-pull-request)

## Resources

* [ArcGIS for Developers](http://developers.arcgis.com)
* [twitter@esri](http://twitter.com/esri)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2013 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/esri-leaflet-demographic-layer/master/license.txt) file.

[](Esri Tags: ArcGIS Web Mapping Leaflet Demographics)
[](Esri Language: JavaScript)
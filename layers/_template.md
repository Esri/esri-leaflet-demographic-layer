# Available Layers

To preview layers you will need an ArcGIS Online account. You can sign up for a free developer account on [ArcGIS for Developers](https://developers.arcgis.com/en/sign-up/).

<% _.forIn(countries, function(layers, name){ %>
* [<%= name %>](#<%= layers[0].hash %>) <% }); %>
<% _.forIn(countries, function(layers, name){ %>
#### <%= name %>

<% _.forEach(layers, function(layer){ %>
* `<%= layer.key %>` - [Preview in ArcGIS Online](http://www.arcgis.com/home/webmap/viewer.html?services=<%= layer.id %>) <% }); %>
<% }); %>

var request = require('request');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

module.exports = function (grunt) {

  var countryNames = /(Germany)|(Zambia)|(Great Britain)|(Norway)|(Spain)|(Netherlands)|(Ireland)|(Austria)|(Belgium)|(Greece)|(Portugal)|(Cote D'Ivoire)|(Denmark)|(Luxembourg)|(Liechtenstein)|(Lithuania)|(Latvia)|(Indonesia)|(Saudi Arabia)|(Colombia)|(Peru)|(Swaziland)|(Montenegro)|(Ghana)|(Cyprus)|(USA)|(New Zealand)|(South Korea)|(Venezuela)|(Vietnam)|(Uzbekistan)|(Uruguay)|(Tunisia)|(United Arab Emirates)|(Trinidad and Tobago)|(Syria)|(Sudan)|(Sri Lanka)|(South Africa)|(Philippines)|(Paraguay)|(Panama)|(Oman)|(Nicaragua)|(New Caledonia)|(Morocco)|(Mongolia)|(Monaco)|(Martinique)|(Macao)|(Lesotho)|(Lebanon)|(Kyrgyzstan)|(Kuwait)|(Jordan)|(Jamaica)|(Honduras)|(Guatemala)|(Guadalupe)|(Georgia)|(Estonia)|(El Salvador)|(Egypt)|(Costa Rica)|(Chile)|(Canada)|(Brazil)|(Botswana)|(Bangladesh)|(Bolivia)|(Bahamas)|(Azerbaijan)|(Aruba)|(Armenia)|(Argentina)|(Andorra)|(Algeria)|(Malaysia)|(Sweden)|(Switzerland)|(India)|(France)|(Russia)|(Czech Republic)|(Mexico)|(Italy)|(Finland)|(The Former Yugoslav Republic of Macedonia)|(Taiwan)|(Thailand)|(Serbia)|(Croatia)|(Poland)|(Bulgaria)|(Singapore)|(Israel)|(Malawi)|(Kazakhstan)|(Moldova)|(China)|(Turkey)|(Kenya)|(Bahrain)|(Nigeria)|(Tanzania)|(Japan)|(Kosovo)|(Australia)|(Slovenia)|(Namibia)|(Iceland)|(Bosnia Herzegovina)|(Mozambique)|(Romania)|(Puerto Rico)|(Hungary)|(Malta)|(Albania)|(Belarus)|(Ukraine)|(Cyprus)|(Slovakia)|(Uganda)|(Reunion)|(Hong Kong)|(Mauritius)/;
  var query = 'group:455c272c9b004bb99984df4e2f4d2eb1 -type:"web mapping application" -type:"Geodata Service" (type: "Feature Collection" OR type:"Layer" OR type: "Explorer Layer" OR type: "Tile Package" OR type:"Layer Package" OR type:"Feature Service" OR type:"Map Service" OR type:"Image Service" OR type:"WMS" OR type:"KML" OR typekeywords:"OGC" OR typekeywords:"Geodata Service" OR type:"Globe Service" OR type:"CSV" OR type: "Shapefile" OR type: "Service Definition" OR type: "File Geodatabase") -type:"Layer" -type: "Map Document" -type:"Map Package" -type:"ArcPad Package" -type:"Explorer Map" -type:"Globe Document" -type:"Scene Document" -type:"Published Map" -type:"Map Template" -type:"Windows Mobile Package" -type:"Layer Package" -type:"Explorer Layer" -type:"Geoprocessing Package" -type:"Application Template" -type:"Code Sample" -type:"Geoprocessing Package" -type:"Geoprocessing Sample" -type:"Locator Package" -type:"Workflow Manager Package" -type:"Windows Mobile Package" -type:"Explorer Add In" -type:"Desktop Add In" -type:"File Geodatabase" -type:"Feature Collection Template" -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration"';
  var template = _.template(fs.readFileSync('layers/_template.md'));

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function searchLayers(start, callback) {

    request({
      url: 'http://arcgis.com/sharing/rest/search',
      method: 'GET',
      qs: {
        q: query,
        num: 100,
        start: start,
        f: 'json'
      },
      json: true
    }, callback);
  }

  function buildRequest(index) {
    return function (callback) {
      searchLayers(index, function (error, response, data) {
        callback(error, data.results);
      });
    };
  }

  function processResults(items) {
    var layers = [];

    for (var i = items.length - 1; i >= 0; i--) {
      var item = items[i];
      var country = item.title.match(countryNames)[0];
      if (!item.title.match('Mature Support')) {
        layers.push({
          country: country,
          hash: country.replace(/ /g, '-').toLowerCase(),
          filename: country.replace(/ /g, '-').toLowerCase(),
          key: item.title.replace(/\W/g, ''),
          id: item.id
        });
      }
    }

    return _.groupBy(layers, 'country');
  }

  function writeFiles(items, callback) {
    var countries = processResults(items);
    var all = [];
    async.forEach(Object.keys(countries), function (key, cb) {
      var filename = 'layers/' + countries[key][0].filename + '.js';

      var layers = _.collect(countries[key], function (layer) {
        return {
          key: layer.key,
          id: layer.id
        };
      });

      all = all.concat(layers);

      fs.writeFile(filename, 'L.esri.Demographics._addKeys(' + JSON.stringify(layers, undefined, 2).replace(/\"/g, '\'') + ');', function (error, result) {
        if (error) {
          grunt.log.error('Error creating ' + filename + ' ' + error);
        } else {
          grunt.log.ok('Created ' + filename + ' with ' + layers.length + ' layers');
        }
        cb(error, result);
      });
    }, function () {

      fs.writeFile('layers/all.js', 'L.esri.Demographics._addKeys(' + JSON.stringify(all, undefined, 2).replace(/\"/g, '\'') + ');', function (error) {
        if (error) {
          grunt.log.error('Error creating all.js' + error);
        } else {
          grunt.log.ok('Created all.js with ' + all.length + ' layers');
        }
      });

      fs.writeFile('layers/README.md', template({countries: countries}), function (error) {
        if (error) {
          grunt.log.error('Error updating layer README.md');
        } else {
          grunt.log.ok('Updated layer README.md');
        }
        callback();
      });
    });
  }

  grunt.registerTask('buildLayerFiles', 'Query available demographic layers from ArcGIS Online and build layer files', function () {
    var done = this.async();

    searchLayers(0, function (error, response, data) {
      var additionalRequests = [];
      var currentSearchPos = data.nextStart;
      var total = data.total;
      var items = data.results;

      if (currentSearchPos < total && currentSearchPos !== -1) {
        while (currentSearchPos < total) {
          additionalRequests.push(buildRequest(currentSearchPos));
          currentSearchPos += 100;
        }

        async.parallel(additionalRequests, function (error, results) {
          var allItems = items.concat.apply(items, results);
          writeFiles(allItems, done);
        });
      } else {
        writeFiles(items, done);
      }
    });
  });
};
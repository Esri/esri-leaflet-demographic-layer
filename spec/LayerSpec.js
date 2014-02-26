// rip a pregenerated access token out of the karma context
var token;
if (window.opener && window.opener.parent) {
  token = window.opener.parent.karma.config.args.access_token;
} else {
  token = window.parent.karma.config.args.access_token;
}

function createMap() {
  // create container
  var container = document.createElement('div');

  // give container a width/height
  container.setAttribute('style', 'width:500px; height: 500px;');

  // add contianer to body
  document.body.appendChild(container);

  // create map
  return L.map(container).setView([37.75, -122.45], 12);
}

describe('L.esri.Demographics.Layer', function () {

  describe('intialization', function () {
    it('should successfully initalize with a key', function () {
      expect(function () {
        L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize', {
          token: token
        });
      }).not.toThrow();
    });

    it('should throw and error without a key', function () {
      expect(function () {
        L.esri.Demographics.demographicLayer();
      }).toThrow();
    });
  });

  describe('events', function () {
    var map = createMap();
    var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize', {
      token: token
    });

    it('should fire a loading event with bounds', function () {
      var spy = jasmine.createSpy();

      layer.on('loading', spy);

      layer.addTo(map);

      waitsFor(function () {
        return spy.callCount;
      }, 'loading event', 5000);

      runs(function () {
        expect(spy.callCount).toEqual(1);
      });
    });

    it('should fire a load event with bounds', function () {
      var spy = jasmine.createSpy();

      layer.on('load', spy);

      waitsFor(function () {
        return spy.callCount;
      }, 'load event', 5000);

      runs(function () {
        expect(spy.callCount).toEqual(1);
      });
    });
  });

  describe('authentication', function () {
    it('should fire an authenticationrequired event and reauthenticate', function () {
      var map = createMap();

      var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize').addTo(map);

      var spy = jasmine.createSpy();

      layer.on('authenticationrequired', function (e) {
        e.retry(token);
      });

      layer.on('newimage', spy);

      waitsFor(function () {
        return spy.callCount;
      }, 'could not authenticate', 5000);

      runs(function () {
        expect(spy.callCount).toEqual(1);
        expect(layer._currentImage).toBeTruthy();
      });
    });
  });

  describe('rendering', function () {
    it('should mirror the current bounds of the map', function () {
      var map = createMap();

      var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize', {
        token: token
      }).addTo(map);

      var spy = jasmine.createSpy();

      layer.on('load', spy);

      waitsFor(function () {
        return spy.callCount;
      }, 'load event', 5000);

      runs(function () {
        expect(spy.callCount).toEqual(1);
        expect(layer._currentImage).toBeTruthy();
        expect(layer._currentImage._bounds).toEqual(map.getBounds());
      });
    });

    it('should redraw when the map is panned', function () {
      var map = createMap();

      var loadSpy = jasmine.createSpy();
      var imageSpy = jasmine.createSpy();

      var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize', {
        token: token
      }).addTo(map);

      layer.on('load', loadSpy);
      layer.on('newimage', imageSpy);

      map.panBy([200, 200]);

      waitsFor(function () {
        return loadSpy.callCount > 1;
      }, 'load event', 5000);

      runs(function () {
        expect(loadSpy.callCount).toEqual(2);
        expect(imageSpy.callCount).toEqual(1);
        expect(layer._currentImage).toBeTruthy();
        expect(layer._currentImage._bounds).toEqual(map.getBounds());
      });
    });
  });

  describe('querying', function () {
    it('should be able to query for data about a latlng', function () {
      var map = createMap();

      var spy = jasmine.createSpy();

      var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize', {
        token: token
      }).addTo(map);

      layer.query(map.getCenter(), spy);

      waitsFor(function () {
        return spy.callCount;
      }, 'load event', 5000);

      runs(function () {
        var response = spy.mostRecentCall.args[0];
        expect(response.type).toEqual('FeatureCollection');
      });
    });

    it('should fire an authenticationrequired event and reauthenticate', function () {
      var map = createMap();

      var spy = jasmine.createSpy();

      var layer = L.esri.Demographics.demographicLayer('UsaAverageHouseholdSize').addTo(map);

      layer.on('authenticationrequired', function (e) {
        e.retry(token);
      });

      layer.query(map.getCenter(), spy);

      waitsFor(function () {
        return spy.callCount;
      }, 'query', 5000);

      runs(function () {
        var response = spy.mostRecentCall.args[0];
        expect(response.type).toEqual('FeatureCollection');
      });
    });
  });

});
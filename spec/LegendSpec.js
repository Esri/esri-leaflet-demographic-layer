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

describe('L.esri.Demographics.Legend', function () {

  it('should render a legend', function () {
    var map = createMap();

    var spy = jasmine.createSpy();

    var legend = L.esri.Demographics.legend('USAAverageHouseholdSize', {
      token: token
    }).addTo(map);

    legend.on('render', spy);

    waitsFor(function () {
      return spy.callCount;
    }, 'render', 5000);

    runs(function () {
      expect(spy.callCount).toEqual(1);
      expect(legend._container.textContent).toMatch('USA Average Household Size');
    });
  });

  it('should should fire an authenticationrequired event and reauthenticate', function () {
    var map = createMap();

    var spy = jasmine.createSpy();

    var legend = L.esri.Demographics.legend('USAAverageHouseholdSize').addTo(map);

    legend.on('authenticationrequired', function (e) {
      e.retry(token);
    });

    legend.on('render', spy);

    waitsFor(function () {
      return spy.callCount;
    }, 'render', 5000);

    runs(function () {
      expect(spy.callCount).toEqual(1);
      expect(legend._container.textContent).toMatch('USA Average Household Size');
    });
  });

  it('should fire load and loading events', function () {
    var map = createMap();

    var spy = jasmine.createSpy();

    var legend = L.esri.Demographics.legend('USAAverageHouseholdSize', {
      token: token
    }).addTo(map);

    legend.on('load', spy);
    legend.on('loading', spy);

    waitsFor(function () {
      return spy.callCount > 1;
    }, 'render', 5000);

    runs(function () {
      expect(spy.callCount).toEqual(2);
    });
  });
});
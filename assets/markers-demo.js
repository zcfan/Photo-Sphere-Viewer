var PSV = new PhotoSphereViewer({
  panorama: rootURL + '/assets/Bryce-Canyon-National-Park-Mark-Doliner.jpg',
  container: 'photosphere',
  loading_img: rootURL + '/assets/photosphere-logo.gif',
  time_anim: false,
  caption: 'Bryce Canyon National Park <b>&copy; Mark Doliner</b>',
  default_fov: 70,
  default_lat: 0.3,
  mousewheel: false,
  size: {
    height: 500
  },
  markers: [
    {
      id: 'image',
      longitude: 5.69810,
      latitude: -0.13770,
      image: rootURL + '/assets/pin-blue.png',
      width: 32,
      height: 32,
      anchor: 'bottom center',
      tooltip: 'A image marker. <b>Click me!</b>',
      content: document.getElementById('lorem-content').innerHTML
    },
    {
      id: 'text',
      longitude: 0,
      latitude: 0,
      html: 'HTML <b>marker</b> &hearts;',
      anchor: 'bottom right',
      style: {
        maxWidth: '100px',
        color: 'white',
        fontSize: '20px',
        fontFamily: 'Helvetica, sans-serif',
        textAlign: 'center'
      },
      tooltip: {
        content: 'An HTML marker',
        position: 'right'
      }
    },
    {
      id: 'polygon',
      polygon_px: [3184, 794, 3268, 841, 3367, 1194, 3327, 1307, 3065, 1221, 3097, 847],
      svgStyle: {
        fill: 'rgba(200, 0, 0, 0.2)',
        stroke: 'rgba(200, 0, 50, 0.8)',
        'stroke-width': '2px'
      },
      tooltip: {
        content: 'A dynamic polygon marker',
        position: 'right bottom'
      }
    },
    {
      id: 'circle',
      circle: 20,
      x: 2500,
      y: 1000,
      tooltip: 'A circle marker'
    }
  ]
});

PSV.on('click', function(e) {
  PSV.addMarker({
    id: '#' + Math.random(),
    longitude: e.longitude,
    latitude: e.latitude,
    image: rootURL + '/assets/pin-red.png',
    width: 32,
    height: 32,
    anchor: 'bottom center',
    tooltip: 'Generated pin'
  });
});

PSV.on('select-marker', function(marker) {
  if (marker.id.indexOf('#') === 0) {
    PSV.removeMarker(marker);
  }
});

/**
 * Number of pixels bellow which a mouse move will be considered as a click
 * @type {int}
 */
PhotoSphereViewer.MOVE_THRESHOLD = 4;

/**
 * Time size of the mouse position history used to compute inertia
 * @type {int}
 */
PhotoSphereViewer.INERTIA_WINDOW = 300;

/**
 * Radius of the THREE.SphereGeometry
 * Half-length of the THREE.BoxGeometry
 * @type {int}
 */
PhotoSphereViewer.SPHERE_RADIUS = 100;

/**
 * Number of vertice of the THREE.SphereGeometry
 * @type {int}
 */
PhotoSphereViewer.SPHERE_VERTICES = 64;

/**
 * Number of vertices of each side of the THREE.BoxGeometry
 * @type {int}
 */
PhotoSphereViewer.CUBE_VERTICES = 8;

/**
 * Map between keyboard events "keyCode|which" and "key"
 * @type {Object.<int, string>}
 */
PhotoSphereViewer.KEYMAP = {
  33: 'PageUp',
  34: 'PageDown',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  107: '+',
  109: '-'
};

/**
 * SVG icons sources
 * @type {Object.<string, string>}
 */
PhotoSphereViewer.ICONS = {};

/**
 * System properties
 * @type {Object}
 */
PhotoSphereViewer.SYSTEM = {
  loaded: false,
  pixelRatio: 1,
  isWebGLSupported: false,
  isCanvasSupported: false,
  deviceOrientationSupported: null,
  maxTextureWidth: 0,
  mouseWheelEvent: null,
  fullscreenEvent: null
};

/**
 * PhotoSphereViewer defaults
 * @type {Object}
 */
PhotoSphereViewer.DEFAULTS = {
  panorama: null, // url(s) of the panorama
  container: null, // htmlelement/id of container
  caption: null, // text displayed in the navbar
  autoload: true, // automatically load the panorama
  usexmpdata: true, // use xmp data if present
  pano_data: null, // overwrite xmp data
  webgl: true, // enable webgl
  min_fov: 30, // minimum field-of-view (max zoom)
  max_fov: 90, // maximum field-of-view (min zoom)
  default_fov: null, //  field-of-view
  default_long: 0, // default longitude
  default_lat: 0, // default latitude
  longitude_range: null, // allowed longitude range
  latitude_range: null, // allowed latitude range
  move_speed: 1, // mouse move speed ratio
  time_anim: 2000, // delay before automatic rotation
  anim_speed: '2rpm', // automatic rotation speed
  anim_lat: null, // automatic rotation latitude
  fisheye: false, // fisheye amount (0-1)
  navbar: [ // navigation par configuration
    'autorotate',
    'zoom',
    'download',
    'markers',
    'caption',
    'gyroscope',
    'fullscreen'
  ],
  tooltip: { // tooltip configuration
    offset: 5,
    arrow_size: 7,
    delay: 100
  },
  lang: { // labels translation
    autorotate: 'Automatic rotation',
    zoom: 'Zoom',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    download: 'Download',
    fullscreen: 'Fullscreen',
    markers: 'Markers',
    gyroscope: 'Gyroscope'
  },
  mousewheel: true, // enable mouse wheel zoom
  mousemove: true, // enable mouse/touch move
  keyboard: true, // enable keyboard move in fullscreen
  gyroscope: false, // enable gyroscope move
  move_inertia: true, // enable mouse/touch move inertia
  click_event_on_marker: false, // trigger "click" event when a marker is activated
  transition: { // options for "setPanorama"
    duration: 1500,
    loader: true,
    blur: false
  },
  loading_img: null, // path to loading image
  loading_txt: 'Loading...', // loading text
  size: null, // force viewer size (width & height)
  cache_texture: 6, // number of images to cache in memory
  templates: {}, // templates overrides
  markers: [] // markers !
};

/**
 * doT.js templates
 * @type {Object.<string, string>}
 */
PhotoSphereViewer.TEMPLATES = {
  markersList: '\
<div class="psv-markers-list-container"> \
  <h1 class="psv-markers-list-title">{{= it.config.lang.markers }}</h1> \
  <ul class="psv-markers-list"> \
  {{~ it.markers: marker }} \
    <li data-psv-marker="{{= marker.id }}" class="psv-markers-list-item {{? marker.className }}{{= marker.className }}{{?}}"> \
      {{? marker.image }}<img class="psv-markers-list-image" src="{{= marker.image }}"/>{{?}} \
      <p class="psv-markers-list-name">{{? marker.tooltip }}{{= marker.tooltip.content }}{{?? marker.html }}{{= marker.html }}{{??}}{{= marker.id }}{{?}}</p> \
    </li> \
  {{~}} \
  </ul> \
</div>'
};

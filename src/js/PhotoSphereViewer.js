/**
 * Viewer class
 * @param {Object} options - Viewer settings
 * @constructor
 */
function PhotoSphereViewer(options) {
  // return instance if called as a function
  if (!(this instanceof PhotoSphereViewer)) {
    return new PhotoSphereViewer(options);
  }

  // init global system variables
  if (!PhotoSphereViewer.SYSTEM.loaded) {
    PhotoSphereViewer.loadSystem();
  }

  // merge config
  this.config = PSVUtils.clone(PhotoSphereViewer.DEFAULTS);
  PSVUtils.deepmerge(this.config, options);

  // check container
  if (!options.container) {
    throw new PSVError('No value given for container.');
  }

  // must support canvas
  if (!PhotoSphereViewer.SYSTEM.isCanvasSupported) {
    throw new PSVError('Canvas is not supported.');
  }

  // additional scripts if webgl not supported/disabled
  if ((!PhotoSphereViewer.SYSTEM.isWebGLSupported || !this.config.webgl) && !PSVUtils.checkTHREE('CanvasRenderer', 'Projector')) {
    throw new PSVError('Missing Three.js components: CanvasRenderer, Projector. Get them from threejs-examples package.');
  }

  if (this.config.transition && this.config.transition.blur) {
    // transition blur only works with webgl
    if (!PhotoSphereViewer.SYSTEM.isWebGLSupported || !this.config.webgl) {
      this.config.transition.blur = false;
      console.warn('PhotoSphereViewer: Using canvas rendering, blur transition disabled.');
    }
    // additional scripts for transition blur
    else if (!PSVUtils.checkTHREE('EffectComposer', 'RenderPass', 'ShaderPass', 'MaskPass', 'CopyShader')) {
      throw new PSVError('Missing Three.js components: EffectComposer, RenderPass, ShaderPass, MaskPass, CopyShader. Get them from threejs-examples package.');
    }
  }

  // longitude range must have two values
  if (this.config.longitude_range && this.config.longitude_range.length !== 2) {
    this.config.longitude_range = null;
    console.warn('PhotoSphereViewer: longitude_range must have exactly two elements.');
  }

  if (this.config.latitude_range) {
    // latitude range must have two values
    if (this.config.latitude_range.length !== 2) {
      this.config.latitude_range = null;
      console.warn('PhotoSphereViewer: latitude_range must have exactly two elements.');
    }
    // latitude range must be ordered
    else if (this.config.latitude_range[0] > this.config.latitude_range[1]) {
      this.config.latitude_range = [this.config.latitude_range[1], this.config.latitude_range[0]];
      console.warn('PhotoSphereViewer: latitude_range values must be ordered.');
    }
  }
  // migrate legacy tilt_up_max and tilt_down_max
  else if (this.config.tilt_up_max !== undefined || this.config.tilt_down_max !== undefined) {
    this.config.latitude_range = [
      this.config.tilt_down_max !== undefined ? this.config.tilt_down_max - Math.PI / 4 : -PSVUtils.HalfPI,
      this.config.tilt_up_max !== undefined ? this.config.tilt_up_max + Math.PI / 4 : PSVUtils.HalfPI
    ];
    console.warn('PhotoSphereViewer: tilt_up_max and tilt_down_max are deprecated, use latitude_range instead.');
  }

  // min_fov and max_fov must be ordered
  if (this.config.max_fov < this.config.min_fov) {
    var temp_fov = this.config.max_fov;
    this.config.max_fov = this.config.min_fov;
    this.config.min_fov = temp_fov;
    console.warn('PhotoSphereViewer: max_fov cannot be lower than min_fov.');
  }

  if (this.config.cache_texture && (!PSVUtils.isInteger(this.config.cache_texture) || this.config.cache_texture < 0)) {
    this.config.cache_texture = PhotoSphereViewer.DEFAULTS.cache_texture;
    console.warn('PhotoSphreViewer: invalid valud for cache_texture');
  }

  // min_fov/max_fov between 1 and 179
  this.config.min_fov = PSVUtils.stayBetween(this.config.min_fov, 1, 179);
  this.config.max_fov = PSVUtils.stayBetween(this.config.max_fov, 1, 179);

  // default default_fov is middle point between min_fov and max_fov
  if (this.config.default_fov === null) {
    this.config.default_fov = this.config.max_fov / 2 + this.config.min_fov / 2;
  }
  // default_fov between min_fov and max_fov
  else {
    this.config.default_fov = PSVUtils.stayBetween(this.config.default_fov, this.config.min_fov, this.config.max_fov);
  }

  // parse default_long, is between 0 and 2*PI
  this.config.default_long = PSVUtils.parseAngle(this.config.default_long);

  // parse default_lat, is between -PI/2 and PI/2
  this.config.default_lat = PSVUtils.parseAngle(this.config.default_lat, -Math.PI);
  this.config.default_lat = PSVUtils.stayBetween(this.config.default_lat, -PSVUtils.HalfPI, PSVUtils.HalfPI);

  // default anim_lat is default_lat
  if (this.config.anim_lat === null) {
    this.config.anim_lat = this.config.default_lat;
  }
  // parse anim_lat, is between -PI/2 and PI/2
  else {
    this.config.anim_lat = PSVUtils.parseAngle(this.config.anim_lat, -Math.PI);
    this.config.anim_lat = PSVUtils.stayBetween(this.config.anim_lat, -PSVUtils.HalfPI, PSVUtils.HalfPI);
  }

  // parse longitude_range, between 0 and 2*PI
  if (this.config.longitude_range) {
    this.config.longitude_range = this.config.longitude_range.map(function(angle) {
      return PSVUtils.parseAngle(angle);
    });
  }

  // parse latitude_range, between -PI/2 and PI/2
  if (this.config.latitude_range) {
    this.config.latitude_range = this.config.latitude_range.map(function(angle) {
      angle = PSVUtils.parseAngle(angle, -Math.PI);
      return PSVUtils.stayBetween(angle, -PSVUtils.HalfPI, PSVUtils.HalfPI);
    });
  }

  // parse anim_speed
  this.config.anim_speed = PSVUtils.parseSpeed(this.config.anim_speed);

  // reactivate the navbar if the caption is provided
  if (this.config.caption && !this.config.navbar) {
    this.config.navbar = ['caption'];
  }

  // translate boolean fisheye to amount
  if (this.config.fisheye === true) {
    this.config.fisheye = 1;
  }
  else if (this.config.fisheye === false) {
    this.config.fisheye = 0;
  }

  // references to components
  this.parent = (typeof options.container == 'string') ? document.getElementById(options.container) : options.container;
  this.container = null;
  this.loader = null;
  this.navbar = null;
  this.hud = null;
  this.panel = null;
  this.tooltip = null;
  this.canvas_container = null;
  this.renderer = null;
  this.composer = null;
  this.passes = {};
  this.scene = null;
  this.camera = null;
  this.mesh = null;
  this.raycaster = null;
  this.doControls = null;

  // local properties
  this.prop = {
    isCubemap: undefined, // if the panorama is a cubemap
    latitude: 0, // current latitude of the center
    longitude: 0, // current longitude of the center
    anim_speed: 0, // parsed anim speed (rad/sec)
    zoom_lvl: 0, // current zoom level
    vFov: 0, // vertical FOV
    hFov: 0, // horizontal FOV
    aspect: 0, // viewer aspect ratio
    move_speed: 0.1, // move speed (computed with pixel ratio and config move_speed)
    moving: false, // is the user moving
    zooming: false, // is the user zooming
    start_mouse_x: 0, // start x position of the click/touch
    start_mouse_y: 0, // start y position of the click/touch
    mouse_x: 0, // current x position of the cursor
    mouse_y: 0, // current y position of the cursor
    mouse_history: [], // list of latest positions of the cursor [time, x, y]
    pinch_dist: 0, // distance between fingers when zooming
    direction: null, // direction of the camera (Vector3)
    orientation_reqid: null, // animationRequest id of the device orientation
    autorotate_reqid: null, // animationRequest id of the automatic rotation
    animation_promise: null, // promise of the current animation (either go to position or image transition)
    loading_promise: null, // promise of the setPanorama method
    start_timeout: null, // timeout id of the automatic rotation delay
    cache: [],
    size: { // size of the container
      width: 0,
      height: 0
    },
    pano_data: { // panorama metadata
      full_width: 0,
      full_height: 0,
      cropped_width: 0,
      cropped_height: 0,
      cropped_x: 0,
      cropped_y: 0
    }
  };

  // init templates
  Object.keys(PhotoSphereViewer.TEMPLATES).forEach(function(tpl) {
    if (!this.config.templates[tpl]) {
      this.config.templates[tpl] = PhotoSphereViewer.TEMPLATES[tpl];
    }
    if (typeof this.config.templates[tpl] == 'string') {
      this.config.templates[tpl] = doT.template(this.config.templates[tpl]);
    }
  }, this);

  // init
  this.parent.photoSphereViewer = this;

  // create actual container
  this.container = document.createElement('div');
  this.container.classList.add('psv-container');
  this.parent.appendChild(this.container);

  // apply container size
  if (this.config.size !== null) {
    this._setViewerSize(this.config.size);
  }
  this._onResize();

  // apply default zoom level
  var tempZoom = Math.round((this.config.default_fov - this.config.min_fov) / (this.config.max_fov - this.config.min_fov) * 100);
  this.zoom(tempZoom - 2 * (tempZoom - 50), false);

  // actual move speed depends on pixel-ratio
  this.prop.move_speed = 1 / PhotoSphereViewer.SYSTEM.pixelRatio * Math.PI / 180 * this.config.move_speed;

  // set default position
  this.rotate({
    longitude: this.config.default_long,
    latitude: this.config.default_lat
  }, false);

  // load navbar
  if (this.config.navbar) {
    this.container.classList.add('psv-container--has-navbar');
    this.navbar = new PSVNavBar(this);
    this.navbar.hide();
  }

  // load hud
  this.hud = new PSVHUD(this);
  this.hud.hide();

  // load side panel
  this.panel = new PSVPanel(this);

  // load hud tooltip
  this.tooltip = new PSVTooltip(this.hud);

  // attach event handlers
  this._bindEvents();

  // load panorama
  if (this.config.autoload) {
    this.load();
  }

  // enable GUI after first render
  this.once('render', function() {
    if (this.config.navbar) {
      this.navbar.show();
    }

    this.hud.show();

    if (this.config.markers) {
      this.config.markers.forEach(function(marker) {
        this.hud.addMarker(marker, false);
      }, this);

      this.hud.updatePositions();
    }

    // Queue animation
    if (this.config.time_anim !== false) {
      this.prop.start_timeout = window.setTimeout(this.startAutorotate.bind(this), this.config.time_anim);
    }

    this.trigger('ready');
  }.bind(this));
}

uEvent.mixin(PhotoSphereViewer);

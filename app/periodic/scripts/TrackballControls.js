/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.TrackballControls = function ( object, domElement ) {

  var _this = this;
  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5 };

  this.object = object;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  // API

  this.enabled = true;

  this.screen = { left: 0, top: 0, width: 0, height: 0 };

  this.rotateSpeed = 1.0;
  this.zoomSpeed = 1.2;
  this.panSpeed = 0.3;

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;
  this.noRoll = false;

  this.staticMoving = false;
  this.dynamicDampingFactor = 0.2;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

  // internals

  this.target = new THREE.Vector3();

  var lastPosition = new THREE.Vector3();

  var _state = STATE.NONE,
  _prevState = STATE.NONE,

  _eye = new THREE.Vector3(),

  _rotateStart = new THREE.Vector3(),
  _rotateEnd = new THREE.Vector3(),

  _zoomStart = new THREE.Vector2(),
  _zoomEnd = new THREE.Vector2(),

  _touchZoomDistanceStart = 0,
  _touchZoomDistanceEnd = 0,

  _panStart = new THREE.Vector2(),
  _panEnd = new THREE.Vector2();

  // for reset

  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.up0 = this.object.up.clone();

  // events

  var changeEvent = { type: 'change' };


  // methods

  this.handleResize = function () {

    if ( this.domElement === document ) {

      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;

    } else {

      this.screen = this.domElement.getBoundingClientRect();

    }

  };

  this.handleEvent = function ( event ) {

    if ( typeof this[ event.type ] == 'function' ) {

      this[ event.type ]( event );

    }

  };

  this.getMouseOnScreen = function ( clientX, clientY ) {

    return new THREE.Vector2(
      ( clientX - _this.screen.left ) / _this.screen.width,
      ( clientY - _this.screen.top ) / _this.screen.height
    );

  };

  this.getMouseProjectionOnBall = function ( clientX, clientY ) {

    var mouseOnBall = new THREE.Vector3(
      ( clientX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
      ( _this.screen.height * 0.5 + _this.screen.top - clientY ) / (_this.screen.height*.5),
      0.0
    );

    var length = mouseOnBall.length();

    if ( _this.noRoll ) {

      if ( length < Math.SQRT1_2 ) {

        mouseOnBall.z = Math.sqrt( 1.0 - length*length );

      } else {

        mouseOnBall.z = .5 / length;

      }

    } else if ( length > 1.0 ) {

      mouseOnBall.normalize();

    } else {

      mouseOnBall.z = Math.sqrt( 1.0 - length * length );

    }

    _eye.copy( _this.object.position ).sub( _this.target );

    var projection = _this.object.up.clone().setLength( mouseOnBall.y );
    projection.add( _this.object.up.clone().cross( _eye ).setLength( mouseOnBall.x ) );
    projection.add( _eye.setLength( mouseOnBall.z ) );

    return projection;

  };

  this.rotateCamera = function () {

    var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

    if ( angle ) {

      var axis = ( new THREE.Vector3() ).crossVectors( _rotateStart, _rotateEnd ).normalize(),
        quaternion = new THREE.Quaternion();

      angle *= _this.rotateSpeed;

      quaternion.setFromAxisAngle( axis, -angle );

      _eye.applyQuaternion( quaternion );
      _this.object.up.applyQuaternion( quaternion );

      _rotateEnd.applyQuaternion( quaternion );

      if ( _this.staticMoving ) {

        _rotateStart.copy( _rotateEnd );

      } else {

        quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
        _rotateStart.applyQuaternion( quaternion );

      }

    }

  };

  this.zoomCamera = function () {

    if ( _state === STATE.TOUCH_ZOOM ) {

      var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
      _touchZoomDistanceStart = _touchZoomDistanceEnd;
      _eye.multiplyScalar( factor );

    } else {

      var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

      if ( factor !== 1.0 && factor > 0.0 ) {

        _eye.multiplyScalar( factor );

        if ( _this.staticMoving ) {

          _zoomStart.copy( _zoomEnd );

        } else {

          _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

        }

      }

    }

  };

  this.panCamera = function () {

    var mouseChange = _panEnd.clone().sub( _panStart );

    if ( mouseChange.lengthSq() ) {

      mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

      var pan = _eye.clone().cross( _this.object.up ).setLength( mouseChange.x );
      pan.add( _this.object.up.clone().setLength( mouseChange.y ) );

      _this.object.position.add( pan );
      _this.target.add( pan );

      if ( _this.staticMoving ) {

        _panStart = _panEnd;

      } else {

        _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

      }

    }

  };

  this.checkDistances = function () {

    if ( !_this.noZoom || !_this.noPan ) {

      if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

      }

      if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

      }

    }

  };

  this.update = function () {

    _eye.subVectors( _this.object.position, _this.target );

    if ( !_this.noRotate ) {

      _this.rotateCamera();

    }

    if ( !_this.noZoom ) {

      _this.zoomCamera();

    }

    if ( !_this.noPan ) {

      _this.panCamera();

    }

    _this.object.position.addVectors( _this.target, _eye );

    _this.checkDistances();

    _this.object.lookAt( _this.target );

    if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {

      _this.dispatchEvent( changeEvent );

      lastPosition.copy( _this.object.position );

    }

  };

  this.reset = function () {

    _state = STATE.NONE;
    _prevState = STATE.NONE;

    _this.target.copy( _this.target0 );
    _this.object.position.copy( _this.position0 );
    _this.object.up.copy( _this.up0 );

    _eye.subVectors( _this.object.position, _this.target );

    _this.object.lookAt( _this.target );

    _this.dispatchEvent( changeEvent );

    lastPosition.copy( _this.object.position );

  };

  this.initAdmoMove = function(admoX, admoY) {
    if ( _state === STATE.NONE ) {
      _state = 0;
    }

    if ( _state === STATE.ROTATE && !_this.noRotate ) {
      _rotateStart = _this.getMouseProjectionOnBall( admoX, admoY );
    }

    _this.inited = true;
  }

  this.admomove = function(admoX, admoY) {
    if (!_this.inited) {
      _this.initAdmoMove(admoX, admoY);
    }

    var x = admoX;
    var y = admoY;

    _this.STATE = 0;

    _rotateEnd = _this.getMouseProjectionOnBall( x, y );
  }

  this.handleResize();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );

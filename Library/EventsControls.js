 /** This EventsControls will allow to facilitate development speed for simple manipulations by means of a mouse
 * - point and click, drag and drop.
 * @author Vildanov Almaz / alvild@gmail.com
 * R18 version 10.10.2015.
 */
  

 
THREE.Object3D.userDataParent = null;
THREE.Mesh.userDataParent = null;
 
EventsControls = function ( camera, domElement ) {

	var _this = this;

	this.camera = camera;
	this.container = ( domElement !== undefined ) ? domElement : document;
	
	var _DisplaceFocused = null; 
	this.focused = null; 
	this.focusedChild = null; 
	this.previous = new THREE.Vector3(); 
	var _DisplacemouseOvered = null; 	
	this.mouseOvered = null; 
	this.mouseOveredChild = null; 

	this.raycaster = new THREE.Raycaster();

	this.map = null;
	this.event = null;
	this.offset = new THREE.Vector3();
	this.offsetUse = false;
	
	this._mouse = new THREE.Vector2();
	this.mouse = new THREE.Vector2();
	this._vector = new THREE.Vector3();
	this._direction = new THREE.Vector3();

	var _collidable = false;
	this.collidableEntities = [];


	// API

	this.enabled = true;

	this.objects = [];
	var _DisplaceIntersects = [];
	var _DisplaceIntersectsMap = [];	
	this.intersects = [];
	this.intersectsMap = [];

	this.update = function () {
		if ( _this.enabled ) {
			onContainerMouseMove();
			if ( _mouseMoveFlag ) _this.mouseMove();
		}
	}

	this.dragAndDrop = function () {} // example: this.container.style.cursor = 'move'; 
	this.mouseOver = function () {} // example: this.container.style.cursor = 'pointer';
	this.mouseOut = function () {} // example: this.container.style.cursor = 'auto';
	this.mouseUp = function () {} // example: this.container.style.cursor = 'auto';
	this.mouseMove = function () {}	
	this.onclick = function () {}

	this.attach = function ( object ) {

		if ( object instanceof THREE.Mesh ) { 
			this.objects.push( object );
		}
		else {

			this.objects.push( object );

			for ( var i = 0; i < object.children.length; i++ ) {
				object.children[i].userDataParent = object;		
			}
		}

	}

	this.detach = function ( object ) {

		var item = _this.objects.indexOf( object );
		this.objects.splice( item, 1 );

	}
	
	var _mouseOverFlag = false;
	var _mouseOutFlag = false;	
	var _dragAndDropFlag = false;	
	var _mouseUpFlag = false;
	var _onclickFlag = false;
	var _ontoucheFlag = false;
	var _mouseMoveFlag = false;
	
	this.attachEvent = function ( event, handler ) {

		switch ( event ) {
			case 'mouseOver': 		this.mouseOver = handler; 		_mouseOverFlag = true;		break;
			case 'mouseOut': 		this.mouseOut = handler; 		_mouseOutFlag = true;		break;
			case 'dragAndDrop': 	this.dragAndDrop = handler; 	_dragAndDropFlag = true;	break;
			case 'mouseUp': 		this.mouseUp = handler; 		_mouseUpFlag = true;		break;
			case 'onclick': 		this.onclick = handler; 		_onclickFlag = true;		break;
			case 'mouseMove': 		this.mouseMove = handler; 		_mouseMoveFlag = true;		break;		
			break;
		}

	}

	this.detachEvent = function ( event ) {

		switch ( event ) {
			case 'mouseOver': 		_mouseOverFlag = false;			break;
			case 'mouseOut': 		_mouseOutFlag = false;			break;
			case 'dragAndDrop': 	_dragAndDropFlag = false;		break;
			case 'mouseUp': 		_mouseUpFlag = false;			break;
			case 'onclick': 		_onclickFlag = false;			break;
			case 'mouseMove': 		_mouseMoveFlag = false;			break;				
			break;
		}

	}

	this.setFocus = function ( object ) {

		_DisplaceFocused = object;
		_this.event.item = _this.objects.indexOf( object );

		if ( object.userDataParent ) {
			this.focused = object.userDataParent;
			this.focusedChild = _DisplaceFocused;
			this.previous.copy( this.focused.position );
		}
		else {
			this.focused = object; this.focusedChild = null;
			this.previous.copy( this.focused.position );
		}

	}

	this.removeFocus = function () {

		_DisplaceFocused = null;
		this.focused = null;
		this.focusedChild = null;
		this.event = null;

	}

	this.select = function ( object ) {

		_DisplacemouseOvered = object;
		_this.event.item = _this.objects.indexOf( object );
		if ( object.userDataParent ) {
			this.mouseOvered = object.userDataParent;
			this.mouseOveredChild = _DisplacemouseOvered;
		}
		else {
			this.mouseOvered = object; this.mouseOveredChild = null;
		}

	}

	this.deselect = function () {

		_DisplacemouseOvered = null;
		this.mouseOvered =  null;
		this.mouseOveredChild = null;
		this.event = null;

	}

	this.returnPrevious = function() {

		_this.focused.position.copy( this.previous );

	}

	this._raySet = function () {

		if ( _this.camera instanceof THREE.OrthographicCamera ) {

			_this._vector.set( _this._mouse.x, _this._mouse.y, - 1 ).unproject( _this.camera );
			_this._direction.set( 0, 0, -1 ).transformDirection( _this.camera.matrixWorld );
			_this.raycaster.set( _this._vector, _this._direction );

		}
		else {
			

			var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, 1 );
			//_this._projector.unprojectVector( vector, camera ); 
			vector.unproject( _this.camera );
			//	_this.raycaster = new THREE.Raycaster( _this.camera.position, vector.sub( _this.camera.position ).normalize() );
			_this.raycaster.set( _this.camera.position, vector.sub( _this.camera.position ).normalize() );		

		}

	}
	
	this._setMap = function () {

		_this.intersectsMap = _DisplaceIntersectsMap;

	}

	function getMousePos( event ) {
		if ( _this.enabled ) {
			var x = event.offsetX == undefined ? event.layerX : event.offsetX;
			var y = event.offsetY == undefined ? event.layerY : event.offsetY;	
		
			var width  = window.innerWidth;
			var height = window.innerHeight;
			//console.log('before '+ width,height)
			_this._mouse.x = ( ( x ) / width ) * 2 - 1;
			_this._mouse.y = - ( ( y ) / height ) * 2 + 1;
			
			//_this._mouse.x = ( ( x ) / ( canvasBounds.right - canvasBounds.left ) ) * 2 - 1;
			//_this._mouse.y = - ( ( y ) / _( canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
			
			// toggel prevent firing wrong
			_ontoucheFlag = true;
			//console.log('mouse '+ _this._mouse.x,_this._mouse.y)
			
			onContainerMouseMove();
			if ( _mouseMoveFlag ) _this.mouseMove();
		}
	}
	/**
	 * touche deviced get mouse coordinates
	 */
	function getTouchPos( event ) {
		if ( _this.enabled ) {
			event.preventDefault();
			//event = event.changedTouches[ 0 ];
			var x = event.targetTouches[0].pageX
			var y = event.targetTouches[0].pageY
			
			//_this._mouse.x = ( ( x ) / _this.container.width ) * 2 - 1;
			//_this._mouse.y = - ( ( y ) / _this.container.height ) * 2 + 1;
			
			var width  = window.innerWidth;
			var height = window.innerHeight;
			
			_this._mouse.x = ( ( x ) / width ) * 2 - 1;
			_this._mouse.y = - ( ( y ) / height ) * 2 + 1;
			
			console.log('touche after '+ _this._mouse.x ,_this._mouse.y,_onclickFlag,_ontoucheFlag )
		
			onContainerMouseMove();
			// toggel prevent firing wrong
			_ontoucheFlag = true;
			_onclickFlag = true;
			
			_this.focused = null;
			if ( _mouseMoveFlag ) _this.mouseMove();
		}
	}

	

	function onContainerMouseDown( event ) {

	  // touche 
		if(_ontoucheFlag == false) {
	
			return; 
		}
		if ( _this.enabled && ( _onclickFlag || _dragAndDropFlag ) ) { 	
			if ( _this.focused ) { return; }
		
			
			//console.dir(_this.objects);
			
			_this._raySet();
			_this.intersects = _this.raycaster.intersectObjects( _this.objects, true );
			//console.dir(_this.intersects)

			if ( _this.intersects.length > 0 ) {
				
				_this.event = _this.intersects[ 0 ];
				_this.setFocus( _this.intersects[ 0 ].object );

				if ( _dragAndDropFlag ) {
					_this.intersects = _this.raycaster.intersectObject( _this.map );
					
					try {
						if ( _this.offsetUse ) { 
							var pos = new THREE.Vector3().copy( _this.focused.position );		
							_this.offset.subVectors( _this.intersects[ 0 ].point, pos );
							//console.log( _this.offset );
						}
						//_this.offset.copy( _this.intersects[ 0 ].point ).sub( _this.map.position );
					}
					catch( err ) {}
					
				}

				_this.onclick();
				
				_ontoucheFlag = false;
				

			}
			else {
				_this.removeFocus(); _this.event = null;
			}
		}
	}

		
	function onContainerMouseMove() {

		_this._raySet();

		if ( _this.focused ) {
			
			if ( _dragAndDropFlag ) {
				_DisplaceIntersectsMap = _this.raycaster.intersectObject( _this.map );
				//_this._setMap();
				try {
					var pos = new THREE.Vector3().copy( _DisplaceIntersectsMap[ 0 ].point.sub( _this.offset ) );			
					_this.focused.position.copy( pos );
				}
				catch( err ) {}

				_this.dragAndDrop();
			}
		}
		else {
		
			if ( _mouseOverFlag ) {
				
				_DisplaceIntersects = _this.raycaster.intersectObjects( _this.objects, true );
				_this.intersects = _DisplaceIntersects;
				if ( _this.intersects.length > 0 ) {
					_this.event = _this.intersects[ 0 ];
					if ( _this.mouseOvered ) {
						if ( _DisplacemouseOvered != _this.intersects[ 0 ].object ) {
							_this.mouseOut();
							_this.select( _this.intersects[ 0 ].object );
						//	console.log( '_this.mouseOver();' );
							_this.mouseOver();
						}
					}
					else {
						
						_this.select( _this.intersects[ 0 ].object );
						_this.mouseOver();
					}
				}
				else {
					if ( _DisplacemouseOvered ) { _this.mouseOut(); _this.deselect(); }
				}
			}
		}
	}

	function onContainerMouseUp( event ) {

		if ( _this.enabled ) { 
			if ( _this.focused ) {

				_this.mouseUp();
                _DisplaceFocused = null;
				_this.focused = null;

			}
		}

	}

	
	
	this.container.addEventListener( 'mousedown', onContainerMouseDown, false );	
	this.container.addEventListener( 'mousemove', getMousePos, false );   // 
	this.container.addEventListener( 'mouseup', onContainerMouseUp, false );       
	
	this.container.addEventListener( 'touchstart', getTouchPos, false );	
	window.addEventListener("touchend", onContainerMouseDown);
	
	
		
};

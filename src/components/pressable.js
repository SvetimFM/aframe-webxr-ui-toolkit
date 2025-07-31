/**
 * Pressable Component
 * 
 * Detects when a finger is close enough to hover or press this element.
 * Works with hand-tracking-controls using THREE.Box3 for accurate detection.
 * 
 * @module aframe-webxr-ui-toolkit/components/pressable
 * @example
 * <a-entity pressable="pressDistance: 0.005; hoverDistance: 0.02"></a-entity>
 */

AFRAME.registerComponent('pressable', {
  schema: {
    pressDistance: { default: 0.005 },  // Z-distance for press detection
    hoverDistance: { default: 0.020 },  // Z-distance for hover detection
    debug: { default: false }           // Show debug visualization
  },

  init: function () {
    this.worldPosition = new THREE.Vector3();
    this.handEls = document.querySelectorAll('[hand-tracking-controls]');
    this.pressed = false;
    this.hovered = false;
    this.hadRealPress = false;
    this.pressDuration = 0;
    
    // Create bounding box for button
    this.boundingBox = new THREE.Box3();
    this.tempVector = new THREE.Vector3();
    this.boundingBoxSize = new THREE.Vector3();
    
    // Track matrix state for transformations
    this.matrix = new THREE.Matrix4();
    this.inverse = new THREE.Matrix4();
    
    // Debug visualization
    if (this.data.debug) {
      this.createDebugVisualization();
    }
  },
  
  createDebugVisualization: function() {
    const debugEl = document.createElement('a-box');
    debugEl.setAttribute('material', 'color: yellow; opacity: 0.3; wireframe: true');
    debugEl.setAttribute('scale', '1 1 1');
    this.el.appendChild(debugEl);
    this.debugEl = debugEl;
  },
  
  updateBoundingBox: function() {
    const el = this.el;
    const object3D = el.object3D;
    let width = 0.08;
    let height = 0.02;
    
    // Get size from geometry
    const geometry = el.getAttribute('geometry');
    if (geometry) {
      width = geometry.width || width;
      height = geometry.height || height;
    } else {
      // Check child elements for geometry
      const childWithGeometry = el.querySelector('[geometry]');
      if (childWithGeometry) {
        const childGeo = childWithGeometry.getAttribute('geometry');
        width = childGeo.width || width;
        height = childGeo.height || height;
      }
    }
    
    // Update size
    this.boundingBoxSize.set(width, height, 0.01);
    
    // Get world position and update matrices
    this.worldPosition.copy(object3D.position);
    object3D.parent.updateMatrixWorld();
    object3D.parent.localToWorld(this.worldPosition);
    
    // Set box center at button position
    this.boundingBox.setFromCenterAndSize(
      this.worldPosition, 
      this.boundingBoxSize
    );
    
    // Store transformation matrix
    this.matrix.copy(object3D.matrixWorld);
    this.inverse.copy(this.matrix).invert();
    
    // Update debug visualization
    if (this.debugEl) {
      this.debugEl.setAttribute('width', width);
      this.debugEl.setAttribute('height', height);
      this.debugEl.setAttribute('depth', 0.01);
    }
  },

  tick: function () {
    const handEls = this.handEls;
    let handEl;
    let distance;
    let minDistance = Infinity;
    
    // Update bounding box to current transform
    this.updateBoundingBox();
    
    // Find the closest finger
    for (let i = 0; i < handEls.length; i++) {
      handEl = handEls[i];
      const handControls = handEl.components['hand-tracking-controls'];
      if (handControls && handControls.indexTipPosition) {
        distance = this.calculateFingerDistance(handControls.indexTipPosition);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
    }
    
    // Handle press state
    if (minDistance < this.data.pressDistance) {
      if (!this.pressed) { 
        this.el.emit('pressedstarted');
        this.hadRealPress = true;
      }
      this.pressed = true;
    } else if (this.pressed) {
      if (this.hadRealPress) {
        this.el.emit('pressedended');
      }
      this.pressed = false;
      this.hadRealPress = false;
    }
    
    // Handle hover state
    if (minDistance < this.data.hoverDistance && !this.hovered) {
      this.el.emit('mouseenter');
      this.hovered = true;
    } else if (minDistance >= this.data.hoverDistance && this.hovered) {
      this.el.emit('mouseleave');
      this.hovered = false;
    }
  },

  calculateFingerDistance: function (fingerPosition) {
    // Transform finger position to local space
    this.tempVector.copy(fingerPosition);
    
    // Check if finger is within X and Y bounds of button
    const withinXBounds = (this.tempVector.x >= this.boundingBox.min.x && 
                          this.tempVector.x <= this.boundingBox.max.x);
    const withinYBounds = (this.tempVector.y >= this.boundingBox.min.y && 
                          this.tempVector.y <= this.boundingBox.max.y);
    
    if (withinXBounds && withinYBounds) {
      // If within X and Y boundaries, return Z distance
      return Math.abs(this.tempVector.z - this.worldPosition.z);
    }
    
    // Return large distance if outside bounds
    return Infinity;
  },
  
  remove: function() {
    if (this.debugEl) {
      this.debugEl.remove();
    }
  }
});
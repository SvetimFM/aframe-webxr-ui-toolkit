/**
 * Interaction Utility Functions
 * 
 * Helper functions for WebXR hand tracking and controller interactions.
 * 
 * @module aframe-webxr-ui-toolkit/utils/interaction
 */

/**
 * Get hand entities from scene
 * @param {HTMLElement} sceneEl - A-Frame scene element
 * @returns {Object} Object with left and right hand entities
 */
export function getHandEntities(sceneEl = null) {
  const scene = sceneEl || document.querySelector('a-scene');
  
  return {
    left: scene.querySelector('[hand-tracking-controls][hand="left"]'),
    right: scene.querySelector('[hand-tracking-controls][hand="right"]')
  };
}

/**
 * Get pinch position from hand entity
 * @param {HTMLElement} handEl - Hand entity with hand-tracking-controls
 * @returns {THREE.Vector3|null} Pinch position or null if not available
 */
export function getPinchPosition(handEl) {
  if (!handEl || !handEl.components['hand-tracking-controls']) {
    return null;
  }
  
  const handControls = handEl.components['hand-tracking-controls'];
  
  // Check for index tip position (used for pointing/pressing)
  if (handControls.indexTipPosition) {
    return handControls.indexTipPosition.clone();
  }
  
  // Fallback to pinch position if available
  if (handControls.pinchPosition) {
    return handControls.pinchPosition.clone();
  }
  
  return null;
}

/**
 * Check if hand is pinching
 * @param {HTMLElement} handEl - Hand entity
 * @returns {boolean} True if pinching
 */
export function isPinching(handEl) {
  if (!handEl || !handEl.components['hand-tracking-controls']) {
    return false;
  }
  
  const handControls = handEl.components['hand-tracking-controls'];
  return handControls.isPinching || false;
}

/**
 * Get controller entities from scene
 * @param {HTMLElement} sceneEl - A-Frame scene element
 * @returns {Object} Object with left and right controller entities
 */
export function getControllerEntities(sceneEl = null) {
  const scene = sceneEl || document.querySelector('a-scene');
  
  return {
    left: scene.querySelector('[tracked-controls][hand="left"]'),
    right: scene.querySelector('[tracked-controls][hand="right"]')
  };
}

/**
 * Create a debounced interaction handler
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced function
 */
export function debounceInteraction(callback, delay = 300) {
  let timeoutId = null;
  let lastCallTime = 0;
  
  return function debounced(...args) {
    const now = Date.now();
    
    // Clear any pending timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Check if enough time has passed
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      callback.apply(this, args);
    } else {
      // Schedule for later
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        callback.apply(this, args);
      }, delay - (now - lastCallTime));
    }
  };
}

/**
 * Create a throttled interaction handler
 * @param {Function} callback - Function to throttle
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} Throttled function
 */
export function throttleInteraction(callback, limit = 100) {
  let inThrottle = false;
  
  return function throttled(...args) {
    if (!inThrottle) {
      callback.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get ray intersection point from controller or hand
 * @param {HTMLElement} controllerEl - Controller/hand entity
 * @param {HTMLElement} targetEl - Target element to intersect
 * @returns {THREE.Vector3|null} Intersection point or null
 */
export function getRayIntersection(controllerEl, targetEl) {
  if (!controllerEl || !targetEl) return null;
  
  const raycaster = controllerEl.components.raycaster;
  if (!raycaster) return null;
  
  const intersections = raycaster.intersections;
  
  for (let i = 0; i < intersections.length; i++) {
    if (intersections[i].object.el === targetEl) {
      return intersections[i].point.clone();
    }
  }
  
  return null;
}

/**
 * Check if element is being looked at
 * @param {HTMLElement} el - Element to check
 * @param {HTMLElement} cameraEl - Camera element
 * @param {number} threshold - Angle threshold in degrees
 * @returns {boolean} True if element is being looked at
 */
export function isLookingAt(el, cameraEl = null, threshold = 30) {
  const camera = cameraEl || document.querySelector('[camera]');
  if (!camera || !el) return false;
  
  // Get world positions
  const cameraWorld = new THREE.Vector3();
  const targetWorld = new THREE.Vector3();
  
  camera.object3D.getWorldPosition(cameraWorld);
  el.object3D.getWorldPosition(targetWorld);
  
  // Get camera forward direction
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(camera.object3D.quaternion);
  
  // Calculate direction to target
  const toTarget = targetWorld.sub(cameraWorld).normalize();
  
  // Calculate angle
  const angle = Math.acos(forward.dot(toTarget)) * (180 / Math.PI);
  
  return angle < threshold;
}

/**
 * Vibrate controller (if supported)
 * @param {HTMLElement} controllerEl - Controller entity
 * @param {number} intensity - Vibration intensity (0-1)
 * @param {number} duration - Duration in ms
 */
export function vibrateController(controllerEl, intensity = 0.5, duration = 100) {
  if (!controllerEl) return;
  
  const trackedControls = controllerEl.components['tracked-controls'];
  if (!trackedControls || !trackedControls.controller) return;
  
  const gamepad = trackedControls.controller;
  
  if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
    gamepad.hapticActuators[0].pulse(intensity, duration);
  } else if (gamepad.vibrationActuator) {
    gamepad.vibrationActuator.playEffect('dual-rumble', {
      duration: duration,
      strongMagnitude: intensity,
      weakMagnitude: intensity
    });
  }
}

/**
 * Get finger positions from hand
 * @param {HTMLElement} handEl - Hand entity
 * @returns {Object|null} Object with finger positions or null
 */
export function getFingerPositions(handEl) {
  if (!handEl || !handEl.components['hand-tracking-controls']) {
    return null;
  }
  
  const handControls = handEl.components['hand-tracking-controls'];
  const joints = handControls.joints;
  
  if (!joints || joints.length === 0) return null;
  
  // Standard WebXR hand joint indices
  const fingerMap = {
    thumb: [1, 2, 3, 4],
    index: [5, 6, 7, 8],
    middle: [9, 10, 11, 12],
    ring: [13, 14, 15, 16],
    pinky: [17, 18, 19, 20]
  };
  
  const positions = {};
  
  Object.entries(fingerMap).forEach(([finger, indices]) => {
    positions[finger] = indices.map(i => {
      if (joints[i]) {
        const pos = new THREE.Vector3();
        joints[i].getWorldPosition(pos);
        return pos;
      }
      return null;
    }).filter(p => p !== null);
  });
  
  return positions;
}

/**
 * Calculate hand gesture confidence
 * @param {HTMLElement} handEl - Hand entity
 * @param {string} gesture - Gesture name (e.g., 'pinch', 'point', 'fist')
 * @returns {number} Confidence score (0-1)
 */
export function getGestureConfidence(handEl, gesture) {
  // This is a simplified implementation
  // Real implementation would analyze joint positions
  
  if (!handEl || !handEl.components['hand-tracking-controls']) {
    return 0;
  }
  
  const handControls = handEl.components['hand-tracking-controls'];
  
  switch (gesture) {
    case 'pinch':
      return handControls.isPinching ? 1 : 0;
    case 'point':
      // Simplified - would check if index is extended
      return handControls.indexTipPosition ? 0.8 : 0;
    default:
      return 0;
  }
}
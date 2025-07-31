/**
 * UI Elements Utility Functions
 * 
 * Helper functions for creating common WebXR UI elements like markers,
 * lines, text labels, and other visual components.
 * 
 * @module aframe-webxr-ui-toolkit/utils/ui-elements
 */

/**
 * Create a 3D marker/anchor point
 * @param {Object} position - {x, y, z} position
 * @param {string} label - Marker label
 * @param {string} color - Marker color
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Marker entity
 */
export function createMarker(position, label = '', color = '#FF0000', options = {}) {
  const marker = document.createElement('a-entity');
  
  // Marker sphere
  const sphere = document.createElement('a-sphere');
  sphere.setAttribute('radius', options.radius || 0.01);
  sphere.setAttribute('color', color);
  sphere.setAttribute('shader', 'flat');
  marker.appendChild(sphere);
  
  // Optional label
  if (label) {
    const text = document.createElement('a-text');
    text.setAttribute('value', label);
    text.setAttribute('align', 'center');
    text.setAttribute('color', options.textColor || '#FFFFFF');
    text.setAttribute('position', `0 ${(options.radius || 0.01) + 0.02} 0`);
    text.setAttribute('scale', '0.05 0.05 0.05');
    text.setAttribute('look-at', '[camera]');
    marker.appendChild(text);
  }
  
  // Set position
  marker.setAttribute('position', position);
  
  // Optional animations
  if (options.animate) {
    marker.setAttribute('animation', {
      property: 'scale',
      from: '0 0 0',
      to: '1 1 1',
      dur: 300,
      easing: 'easeOutBack'
    });
  }
  
  return marker;
}

/**
 * Create a line between two points
 * @param {Object} start - Start position {x, y, z}
 * @param {Object} end - End position {x, y, z}
 * @param {string} color - Line color
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Line entity
 */
export function createLine(start, end, color = '#00FF00', options = {}) {
  const line = document.createElement('a-entity');
  
  // Calculate line geometry
  const direction = new THREE.Vector3(
    end.x - start.x,
    end.y - start.y,
    end.z - start.z
  );
  const length = direction.length();
  
  // Create line using a thin cylinder
  line.setAttribute('geometry', {
    primitive: 'cylinder',
    radius: options.thickness || 0.001,
    height: length
  });
  
  line.setAttribute('material', {
    color: color,
    shader: 'flat',
    opacity: options.opacity || 1
  });
  
  // Position at midpoint
  line.setAttribute('position', {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    z: (start.z + end.z) / 2
  });
  
  // Rotate to align with direction
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(axis, direction.normalize());
  line.object3D.quaternion.copy(quaternion);
  
  return line;
}

/**
 * Create measurement text that faces the camera
 * @param {number} value - Measurement value
 * @param {Object} position - Text position {x, y, z}
 * @param {string} unit - Measurement unit
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Text entity
 */
export function createMeasurementText(value, position, unit = 'm', options = {}) {
  const text = document.createElement('a-text');
  
  // Format measurement
  const formattedValue = value.toFixed(options.precision || 2);
  const displayText = `${formattedValue}${unit}`;
  
  text.setAttribute('value', displayText);
  text.setAttribute('align', 'center');
  text.setAttribute('color', options.color || '#FFFF00');
  text.setAttribute('position', position);
  
  // Scale based on distance (optional)
  const scale = options.scale || 0.1;
  text.setAttribute('scale', `${scale} ${scale} ${scale}`);
  
  // Always face camera
  text.setAttribute('look-at', '[camera]');
  
  // Background panel (optional)
  if (options.background) {
    const bg = document.createElement('a-plane');
    bg.setAttribute('color', options.backgroundColor || '#000000');
    bg.setAttribute('opacity', options.backgroundOpacity || 0.8);
    bg.setAttribute('width', displayText.length * 0.015);
    bg.setAttribute('height', 0.03);
    bg.setAttribute('position', '0 0 -0.01');
    text.appendChild(bg);
  }
  
  return text;
}

/**
 * Create a bounding box visualization
 * @param {Object} min - Minimum bounds {x, y, z}
 * @param {Object} max - Maximum bounds {x, y, z}
 * @param {string} color - Box color
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Bounding box entity
 */
export function createBoundingBox(min, max, color = '#00FFFF', options = {}) {
  const box = document.createElement('a-entity');
  
  // Calculate center and size
  const center = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2
  };
  
  const size = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z
  };
  
  // Create wireframe box
  const wireframe = document.createElement('a-box');
  wireframe.setAttribute('width', size.x);
  wireframe.setAttribute('height', size.y);
  wireframe.setAttribute('depth', size.z);
  wireframe.setAttribute('material', {
    color: color,
    wireframe: true,
    opacity: options.opacity || 0.8
  });
  
  box.appendChild(wireframe);
  box.setAttribute('position', center);
  
  // Add corner markers (optional)
  if (options.showCorners) {
    const corners = [
      { x: min.x, y: min.y, z: min.z },
      { x: max.x, y: min.y, z: min.z },
      { x: min.x, y: max.y, z: min.z },
      { x: max.x, y: max.y, z: min.z },
      { x: min.x, y: min.y, z: max.z },
      { x: max.x, y: min.y, z: max.z },
      { x: min.x, y: max.y, z: max.z },
      { x: max.x, y: max.y, z: max.z }
    ];
    
    corners.forEach(corner => {
      const sphere = document.createElement('a-sphere');
      sphere.setAttribute('radius', 0.005);
      sphere.setAttribute('color', color);
      sphere.setAttribute('position', {
        x: corner.x - center.x,
        y: corner.y - center.y,
        z: corner.z - center.z
      });
      box.appendChild(sphere);
    });
  }
  
  return box;
}

/**
 * Create a grid plane for reference
 * @param {Object} size - Grid size {width, height}
 * @param {number} divisions - Number of grid divisions
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Grid entity
 */
export function createGrid(size = { width: 2, height: 2 }, divisions = 10, options = {}) {
  const grid = document.createElement('a-entity');
  
  const step = {
    x: size.width / divisions,
    y: size.height / divisions
  };
  
  // Create horizontal lines
  for (let i = 0; i <= divisions; i++) {
    const y = -size.height / 2 + i * step.y;
    const line = createLine(
      { x: -size.width / 2, y: y, z: 0 },
      { x: size.width / 2, y: y, z: 0 },
      options.color || '#444444',
      { thickness: options.thickness || 0.001 }
    );
    grid.appendChild(line);
  }
  
  // Create vertical lines
  for (let i = 0; i <= divisions; i++) {
    const x = -size.width / 2 + i * step.x;
    const line = createLine(
      { x: x, y: -size.height / 2, z: 0 },
      { x: x, y: size.height / 2, z: 0 },
      options.color || '#444444',
      { thickness: options.thickness || 0.001 }
    );
    grid.appendChild(line);
  }
  
  // Add major axis lines (optional)
  if (options.showAxes) {
    // X axis (red)
    const xAxis = createLine(
      { x: -size.width / 2, y: 0, z: 0 },
      { x: size.width / 2, y: 0, z: 0 },
      '#FF0000',
      { thickness: 0.003 }
    );
    grid.appendChild(xAxis);
    
    // Y axis (green)
    const yAxis = createLine(
      { x: 0, y: -size.height / 2, z: 0 },
      { x: 0, y: size.height / 2, z: 0 },
      '#00FF00',
      { thickness: 0.003 }
    );
    grid.appendChild(yAxis);
  }
  
  return grid;
}

/**
 * Create an arrow indicator
 * @param {Object} start - Start position
 * @param {Object} direction - Direction vector
 * @param {number} length - Arrow length
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Arrow entity
 */
export function createArrow(start, direction, length = 0.5, options = {}) {
  const arrow = document.createElement('a-entity');
  arrow.setAttribute('position', start);
  
  // Normalize direction
  const dir = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
  
  // Arrow shaft
  const shaft = createLine(
    { x: 0, y: 0, z: 0 },
    { x: dir.x * length, y: dir.y * length, z: dir.z * length },
    options.color || '#FFFFFF',
    { thickness: options.thickness || 0.003 }
  );
  arrow.appendChild(shaft);
  
  // Arrow head (cone)
  const head = document.createElement('a-cone');
  head.setAttribute('radius-bottom', options.headRadius || 0.01);
  head.setAttribute('radius-top', 0);
  head.setAttribute('height', options.headLength || 0.03);
  head.setAttribute('color', options.color || '#FFFFFF');
  head.setAttribute('position', {
    x: dir.x * length,
    y: dir.y * length,
    z: dir.z * length
  });
  
  // Orient cone to point in direction
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  head.object3D.quaternion.copy(quaternion);
  
  arrow.appendChild(head);
  
  return arrow;
}
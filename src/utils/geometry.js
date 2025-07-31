/**
 * Geometry Utility Functions
 * 
 * Helper functions for 3D math operations commonly needed in WebXR applications.
 * 
 * @module aframe-webxr-ui-toolkit/utils/geometry
 */

/**
 * Convert A-Frame position string or object to THREE.Vector3
 * @param {string|Object|THREE.Vector3} position - Position to convert
 * @returns {THREE.Vector3} Vector3 instance
 */
export function toVector3(position) {
  if (position instanceof THREE.Vector3) {
    return position.clone();
  }
  
  if (typeof position === 'string') {
    const parts = position.split(' ').map(parseFloat);
    return new THREE.Vector3(parts[0] || 0, parts[1] || 0, parts[2] || 0);
  }
  
  if (typeof position === 'object') {
    return new THREE.Vector3(
      position.x || 0,
      position.y || 0,
      position.z || 0
    );
  }
  
  return new THREE.Vector3();
}

/**
 * Calculate distance between two points
 * @param {Object|THREE.Vector3} point1 - First point
 * @param {Object|THREE.Vector3} point2 - Second point
 * @returns {number} Distance between points
 */
export function distance(point1, point2) {
  const v1 = toVector3(point1);
  const v2 = toVector3(point2);
  return v1.distanceTo(v2);
}

/**
 * Calculate midpoint between two points
 * @param {Object|THREE.Vector3} point1 - First point
 * @param {Object|THREE.Vector3} point2 - Second point
 * @returns {THREE.Vector3} Midpoint
 */
export function midpoint(point1, point2) {
  const v1 = toVector3(point1);
  const v2 = toVector3(point2);
  return v1.add(v2).multiplyScalar(0.5);
}

/**
 * Calculate normal vector from three points
 * @param {Object|THREE.Vector3} p1 - First point
 * @param {Object|THREE.Vector3} p2 - Second point
 * @param {Object|THREE.Vector3} p3 - Third point
 * @returns {THREE.Vector3} Normal vector (normalized)
 */
export function calculateNormal(p1, p2, p3) {
  const v1 = toVector3(p1);
  const v2 = toVector3(p2);
  const v3 = toVector3(p3);
  
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  
  return new THREE.Vector3().crossVectors(edge1, edge2).normalize();
}

/**
 * Create a plane from three points
 * @param {Object|THREE.Vector3} p1 - First point
 * @param {Object|THREE.Vector3} p2 - Second point
 * @param {Object|THREE.Vector3} p3 - Third point
 * @returns {THREE.Plane} Plane instance
 */
export function planeFromPoints(p1, p2, p3) {
  const v1 = toVector3(p1);
  const normal = calculateNormal(p1, p2, p3);
  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, v1);
}

/**
 * Project point onto plane
 * @param {Object|THREE.Vector3} point - Point to project
 * @param {THREE.Plane} plane - Target plane
 * @returns {THREE.Vector3} Projected point
 */
export function projectPointOntoPlane(point, plane) {
  const p = toVector3(point);
  const projected = new THREE.Vector3();
  plane.projectPoint(p, projected);
  return projected;
}

/**
 * Calculate angle between two vectors
 * @param {Object|THREE.Vector3} v1 - First vector
 * @param {Object|THREE.Vector3} v2 - Second vector
 * @returns {number} Angle in radians
 */
export function angleBetween(v1, v2) {
  const vec1 = toVector3(v1).normalize();
  const vec2 = toVector3(v2).normalize();
  return Math.acos(Math.max(-1, Math.min(1, vec1.dot(vec2))));
}

/**
 * Calculate bounding box from array of points
 * @param {Array<Object|THREE.Vector3>} points - Array of points
 * @returns {THREE.Box3} Bounding box
 */
export function boundingBoxFromPoints(points) {
  const box = new THREE.Box3();
  
  if (points.length === 0) return box;
  
  const vectors = points.map(p => toVector3(p));
  box.setFromPoints(vectors);
  
  return box;
}

/**
 * Calculate area of triangle from three points
 * @param {Object|THREE.Vector3} p1 - First point
 * @param {Object|THREE.Vector3} p2 - Second point
 * @param {Object|THREE.Vector3} p3 - Third point
 * @returns {number} Triangle area
 */
export function triangleArea(p1, p2, p3) {
  const v1 = toVector3(p1);
  const v2 = toVector3(p2);
  const v3 = toVector3(p3);
  
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  const cross = new THREE.Vector3().crossVectors(edge1, edge2);
  
  return cross.length() * 0.5;
}

/**
 * Find closest point on line segment to given point
 * @param {Object|THREE.Vector3} point - Target point
 * @param {Object|THREE.Vector3} lineStart - Line segment start
 * @param {Object|THREE.Vector3} lineEnd - Line segment end
 * @returns {THREE.Vector3} Closest point on line segment
 */
export function closestPointOnLineSegment(point, lineStart, lineEnd) {
  const p = toVector3(point);
  const a = toVector3(lineStart);
  const b = toVector3(lineEnd);
  
  const line = new THREE.Vector3().subVectors(b, a);
  const lineLength = line.length();
  
  if (lineLength === 0) return a.clone();
  
  line.normalize();
  
  const toPoint = new THREE.Vector3().subVectors(p, a);
  const t = Math.max(0, Math.min(lineLength, toPoint.dot(line)));
  
  return a.clone().add(line.multiplyScalar(t));
}

/**
 * Transform point by matrix
 * @param {Object|THREE.Vector3} point - Point to transform
 * @param {THREE.Matrix4} matrix - Transformation matrix
 * @returns {THREE.Vector3} Transformed point
 */
export function transformPoint(point, matrix) {
  return toVector3(point).applyMatrix4(matrix);
}

/**
 * Calculate signed angle between vectors on a plane
 * @param {Object|THREE.Vector3} v1 - First vector
 * @param {Object|THREE.Vector3} v2 - Second vector
 * @param {Object|THREE.Vector3} normal - Plane normal
 * @returns {number} Signed angle in radians (-π to π)
 */
export function signedAngle(v1, v2, normal) {
  const vec1 = toVector3(v1).normalize();
  const vec2 = toVector3(v2).normalize();
  const n = toVector3(normal).normalize();
  
  const angle = Math.acos(Math.max(-1, Math.min(1, vec1.dot(vec2))));
  const cross = new THREE.Vector3().crossVectors(vec1, vec2);
  
  return cross.dot(n) < 0 ? -angle : angle;
}

/**
 * Linear interpolation between two points
 * @param {Object|THREE.Vector3} p1 - Start point
 * @param {Object|THREE.Vector3} p2 - End point
 * @param {number} t - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Interpolated point
 */
export function lerp(p1, p2, t) {
  const v1 = toVector3(p1);
  const v2 = toVector3(p2);
  return v1.lerp(v2, t);
}

/**
 * Check if point is inside bounding box
 * @param {Object|THREE.Vector3} point - Point to test
 * @param {THREE.Box3} box - Bounding box
 * @returns {boolean} True if point is inside box
 */
export function isPointInBox(point, box) {
  const p = toVector3(point);
  return box.containsPoint(p);
}
/**
 * Global test setup for A-Frame WebXR UI Toolkit
 * Sets up mocks and helpers for testing WebXR components
 */

import { vi } from 'vitest';

// Mock THREE.js globals
global.THREE = {
  Vector3: class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    
    clone() {
      return new THREE.Vector3(this.x, this.y, this.z);
    }
    
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    }
    
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }
    
    normalize() {
      const length = this.length();
      if (length > 0) {
        this.multiplyScalar(1 / length);
      }
      return this;
    }
    
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    distanceTo(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    
    crossVectors(a, b) {
      this.x = a.y * b.z - a.z * b.y;
      this.y = a.z * b.x - a.x * b.z;
      this.z = a.x * b.y - a.y * b.x;
      return this;
    }
    
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      return this;
    }
    
    applyMatrix4(m) {
      // Simplified matrix multiplication
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      
      this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
      
      return this;
    }
  },
  
  Box3: class Box3 {
    constructor(min, max) {
      this.min = min || new THREE.Vector3(Infinity, Infinity, Infinity);
      this.max = max || new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    
    setFromCenterAndSize(center, size) {
      const halfSize = new THREE.Vector3().copy(size).multiplyScalar(0.5);
      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);
      return this;
    }
    
    setFromPoints(points) {
      this.makeEmpty();
      for (let i = 0; i < points.length; i++) {
        this.expandByPoint(points[i]);
      }
      return this;
    }
    
    makeEmpty() {
      this.min.x = this.min.y = this.min.z = Infinity;
      this.max.x = this.max.y = this.max.z = -Infinity;
      return this;
    }
    
    expandByPoint(point) {
      this.min.x = Math.min(this.min.x, point.x);
      this.min.y = Math.min(this.min.y, point.y);
      this.min.z = Math.min(this.min.z, point.z);
      this.max.x = Math.max(this.max.x, point.x);
      this.max.y = Math.max(this.max.y, point.y);
      this.max.z = Math.max(this.max.z, point.z);
      return this;
    }
    
    containsPoint(point) {
      return point.x >= this.min.x && point.x <= this.max.x &&
             point.y >= this.min.y && point.y <= this.max.y &&
             point.z >= this.min.z && point.z <= this.max.z;
    }
  },
  
  Matrix4: class Matrix4 {
    constructor() {
      this.elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    }
    
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      for (let i = 0; i < 16; i++) {
        te[i] = me[i];
      }
      return this;
    }
    
    invert() {
      // Simplified inversion (identity for testing)
      return this;
    }
  },
  
  Quaternion: class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    
    setFromUnitVectors(from, to) {
      // Simplified quaternion from vectors
      const r = from.dot(to) + 1;
      if (r < 0.000001) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
      } else {
        const s = Math.sqrt(r * 2);
        const invs = 1 / s;
        const c = new THREE.Vector3().crossVectors(from, to);
        this.x = c.x * invs;
        this.y = c.y * invs;
        this.z = c.z * invs;
        this.w = s * 0.5;
      }
      return this;
    }
    
    copy(q) {
      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      return this;
    }
  },
  
  Euler: class Euler {
    constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
      this.x = x;
      this.y = y;
      this.z = z;
      this.order = order;
    }
  },
  
  Plane: class Plane {
    constructor(normal, constant) {
      this.normal = normal || new THREE.Vector3(1, 0, 0);
      this.constant = constant || 0;
    }
    
    setFromNormalAndCoplanarPoint(normal, point) {
      this.normal.copy(normal);
      this.constant = -point.dot(this.normal);
      return this;
    }
    
    projectPoint(point, target) {
      return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(point)).add(point);
    }
    
    distanceToPoint(point) {
      return this.normal.dot(point) + this.constant;
    }
  },
  
  MathUtils: {
    degToRad: (degrees) => degrees * (Math.PI / 180),
    radToDeg: (radians) => radians * (180 / Math.PI)
  }
};

// Mock A-Frame
global.AFRAME = {
  components: {},
  systems: {},
  
  registerComponent: vi.fn((name, definition) => {
    AFRAME.components[name] = definition;
  }),
  
  registerSystem: vi.fn((name, definition) => {
    AFRAME.systems[name] = definition;
  })
};

// Mock DOM elements for A-Frame entities
global.MockEntity = class MockEntity extends EventTarget {
  constructor() {
    super();
    this.nodeType = 1; // Element node
    this.tagName = 'A-ENTITY';
    this.components = {};
    this.object3D = {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      parent: {
        matrixWorld: new THREE.Matrix4(),
        updateMatrixWorld: vi.fn(),
        localToWorld: vi.fn((v) => v)
      },
      matrixWorld: new THREE.Matrix4(),
      getWorldPosition: vi.fn((target) => {
        target.copy(this.object3D.position);
        return target;
      })
    };
    this.sceneEl = {
      systems: {},
      emit: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    this.children = [];
    this.attributes = {};
    this.eventListeners = new Map();
  }
  
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  
  getAttribute(name) {
    return this.attributes[name];
  }
  
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
  }
  
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parentNode = null;
    }
  }
  
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  
  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(handler);
  }
  
  removeEventListener(event, handler) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(handler);
    }
  }
  
  emit(event, detail = {}) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(handler => {
        handler({ detail, target: this, type: event });
      });
    }
  }
  
  querySelector(selector) {
    // Simple implementation for testing
    return this.children.find(child => {
      if (selector.startsWith('#')) {
        return child.id === selector.slice(1);
      }
      if (selector.startsWith('[') && selector.endsWith(']')) {
        const attr = selector.slice(1, -1);
        return child.getAttribute(attr) !== undefined;
      }
      return false;
    });
  }
};

// Helper to create mock A-Frame entities
global.createMockEntity = () => new MockEntity();

// Mock document.createElement for A-Frame elements
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName) => {
  if (tagName.startsWith('a-')) {
    return new MockEntity();
  }
  return originalCreateElement.call(document, tagName);
});

// Mock hand tracking data
global.createMockHandData = (gesture = 'idle') => {
  const positions = {
    idle: { x: 0.1, y: 1.5, z: -0.5 },
    pinch: { x: 0.1, y: 1.5, z: -0.05 },
    point: { x: 0.1, y: 1.5, z: -0.3 }
  };
  
  return {
    indexTipPosition: new THREE.Vector3(...Object.values(positions[gesture])),
    isPinching: gesture === 'pinch',
    joints: Array(21).fill(null).map((_, i) => ({
      getWorldPosition: (target) => {
        target.set(0.1 + i * 0.01, 1.5, -0.5);
        return target;
      }
    }))
  };
};

// Mock WebXR session
global.MockXRSession = class MockXRSession {
  constructor() {
    this.inputSources = [];
    this.requestAnimationFrame = vi.fn();
  }
};

// Console helpers for tests
global.suppressConsole = () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
};

global.restoreConsole = () => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
};
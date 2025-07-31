import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../../../src/components/pressable.js';

describe('Pressable Component', () => {
  let el;
  let component;
  
  beforeEach(() => {
    el = createMockEntity();
    
    // Mock querySelector for hand entities
    document.querySelectorAll = vi.fn(() => [
      {
        components: {
          'hand-tracking-controls': createMockHandData('idle')
        }
      }
    ]);
    
    // Initialize component
    const ComponentDef = AFRAME.components.pressable;
    component = Object.create(ComponentDef);
    component.el = el;
    component.data = ComponentDef.schema.pressDistance.default 
      ? { pressDistance: 0.005, hoverDistance: 0.02 } 
      : ComponentDef.schema;
    
    // Call init
    ComponentDef.init.call(component);
  });
  
  describe('initialization', () => {
    it('should register as an A-Frame component', () => {
      expect(AFRAME.registerComponent).toHaveBeenCalledWith('pressable', expect.any(Object));
    });
    
    it('should initialize with default schema values', () => {
      expect(component.data.pressDistance).toBe(0.005);
      expect(component.data.hoverDistance).toBe(0.02);
    });
    
    it('should create required properties', () => {
      expect(component.worldPosition).toBeInstanceOf(THREE.Vector3);
      expect(component.boundingBox).toBeInstanceOf(THREE.Box3);
      expect(component.pressed).toBe(false);
      expect(component.hovered).toBe(false);
    });
  });
  
  describe('bounding box updates', () => {
    it('should update bounding box based on entity geometry', () => {
      // Set geometry on element
      el.setAttribute('geometry', {
        width: 0.2,
        height: 0.08
      });
      
      // Mock child with geometry
      const child = createMockEntity();
      child.getAttribute = vi.fn((attr) => {
        if (attr === 'geometry') {
          return { width: 0.2, height: 0.08 };
        }
      });
      el.querySelector = vi.fn(() => child);
      
      // Update bounding box
      component.updateBoundingBox();
      
      // Check size was set correctly
      expect(component.boundingBoxSize.x).toBe(0.2);
      expect(component.boundingBoxSize.y).toBe(0.08);
      expect(component.boundingBoxSize.z).toBe(0.01);
    });
  });
  
  describe('finger distance calculation', () => {
    beforeEach(() => {
      // Set up bounding box
      component.boundingBox.min = new THREE.Vector3(-0.1, -0.04, -0.005);
      component.boundingBox.max = new THREE.Vector3(0.1, 0.04, 0.005);
      component.worldPosition.set(0, 0, 0);
    });
    
    it('should return correct distance when finger is within bounds', () => {
      const fingerPos = new THREE.Vector3(0, 0, -0.01);
      const distance = component.calculateFingerDistance(fingerPos);
      expect(distance).toBeCloseTo(0.01, 3);
    });
    
    it('should return Infinity when finger is outside X bounds', () => {
      const fingerPos = new THREE.Vector3(0.2, 0, -0.01);
      const distance = component.calculateFingerDistance(fingerPos);
      expect(distance).toBe(Infinity);
    });
    
    it('should return Infinity when finger is outside Y bounds', () => {
      const fingerPos = new THREE.Vector3(0, 0.1, -0.01);
      const distance = component.calculateFingerDistance(fingerPos);
      expect(distance).toBe(Infinity);
    });
  });
  
  describe('interaction states', () => {
    beforeEach(() => {
      // Mock hand with specific position
      const mockHand = {
        components: {
          'hand-tracking-controls': {
            indexTipPosition: new THREE.Vector3(0, 0, -0.01)
          }
        }
      };
      document.querySelectorAll = vi.fn(() => [mockHand]);
      
      // Set up component bounds
      component.boundingBox.min = new THREE.Vector3(-0.1, -0.04, -0.005);
      component.boundingBox.max = new THREE.Vector3(0.1, 0.04, 0.005);
      component.worldPosition.set(0, 0, 0);
    });
    
    it('should emit pressedstarted when finger enters press distance', () => {
      const emitSpy = vi.spyOn(el, 'emit');
      
      // Finger at hover distance
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.015;
      component.tick();
      
      expect(component.hovered).toBe(true);
      expect(component.pressed).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('mouseenter');
      
      // Move finger to press distance
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.003;
      component.tick();
      
      expect(component.pressed).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('pressedstarted');
    });
    
    it('should emit pressedended when finger leaves press distance', () => {
      const emitSpy = vi.spyOn(el, 'emit');
      
      // Start in pressed state
      component.pressed = true;
      component.hadRealPress = true;
      
      // Move finger away
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.02;
      component.tick();
      
      expect(component.pressed).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('pressedended');
    });
    
    it('should handle hover state transitions', () => {
      const emitSpy = vi.spyOn(el, 'emit');
      
      // Start outside hover distance
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.03;
      component.tick();
      
      expect(component.hovered).toBe(false);
      
      // Move to hover distance
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.015;
      component.tick();
      
      expect(component.hovered).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('mouseenter');
      
      // Move away
      document.querySelectorAll()[0].components['hand-tracking-controls'].indexTipPosition.z = -0.03;
      component.tick();
      
      expect(component.hovered).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('mouseleave');
    });
  });
  
  describe('multiple hands', () => {
    it('should track the closest hand', () => {
      const leftHand = {
        components: {
          'hand-tracking-controls': {
            indexTipPosition: new THREE.Vector3(0, 0, -0.02)
          }
        }
      };
      
      const rightHand = {
        components: {
          'hand-tracking-controls': {
            indexTipPosition: new THREE.Vector3(0, 0, -0.01)
          }
        }
      };
      
      document.querySelectorAll = vi.fn(() => [leftHand, rightHand]);
      
      component.boundingBox.min = new THREE.Vector3(-0.1, -0.04, -0.005);
      component.boundingBox.max = new THREE.Vector3(0.1, 0.04, 0.005);
      component.worldPosition.set(0, 0, 0);
      
      component.tick();
      
      // Should detect hover from the closer (right) hand
      expect(component.hovered).toBe(true);
    });
  });
});
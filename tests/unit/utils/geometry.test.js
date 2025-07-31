import { describe, it, expect } from 'vitest';
import * as Geometry from '../../../src/utils/geometry.js';

describe('Geometry Utilities', () => {
  describe('toVector3', () => {
    it('should convert object to Vector3', () => {
      const v = Geometry.toVector3({ x: 1, y: 2, z: 3 });
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
    
    it('should parse string position', () => {
      const v = Geometry.toVector3('1.5 2.5 3.5');
      expect(v.x).toBe(1.5);
      expect(v.y).toBe(2.5);
      expect(v.z).toBe(3.5);
    });
    
    it('should handle partial objects', () => {
      const v = Geometry.toVector3({ x: 1 });
      expect(v.x).toBe(1);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });
    
    it('should clone existing Vector3', () => {
      const original = new THREE.Vector3(1, 2, 3);
      const v = Geometry.toVector3(original);
      expect(v).not.toBe(original);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });
  
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 4, z: 0 };
      expect(Geometry.distance(p1, p2)).toBe(5);
    });
    
    it('should handle 3D distances', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 2, y: 2, z: 2 };
      expect(Geometry.distance(p1, p2)).toBeCloseTo(3.464, 3);
    });
  });
  
  describe('midpoint', () => {
    it('should find midpoint between two points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 2, y: 4, z: 6 };
      const mid = Geometry.midpoint(p1, p2);
      expect(mid.x).toBe(1);
      expect(mid.y).toBe(2);
      expect(mid.z).toBe(3);
    });
  });
  
  describe('calculateNormal', () => {
    it('should calculate normal from three points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 0, z: 0 };
      const p3 = { x: 0, y: 1, z: 0 };
      const normal = Geometry.calculateNormal(p1, p2, p3);
      
      // Normal should point in +Z direction
      expect(normal.x).toBeCloseTo(0);
      expect(normal.y).toBeCloseTo(0);
      expect(normal.z).toBeCloseTo(1);
    });
    
    it('should return normalized vector', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 10, y: 0, z: 0 };
      const p3 = { x: 0, y: 10, z: 0 };
      const normal = Geometry.calculateNormal(p1, p2, p3);
      
      expect(normal.length()).toBeCloseTo(1);
    });
  });
  
  describe('planeFromPoints', () => {
    it('should create plane from three points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 0, z: 0 };
      const p3 = { x: 0, y: 1, z: 0 };
      const plane = Geometry.planeFromPoints(p1, p2, p3);
      
      expect(plane.normal.z).toBeCloseTo(1);
      expect(plane.constant).toBeCloseTo(0);
    });
  });
  
  describe('projectPointOntoPlane', () => {
    it('should project point onto plane', () => {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = { x: 1, y: 2, z: 3 };
      const projected = Geometry.projectPointOntoPlane(point, plane);
      
      expect(projected.x).toBe(1);
      expect(projected.y).toBe(2);
      expect(projected.z).toBe(0);
    });
  });
  
  describe('angleBetween', () => {
    it('should calculate angle between parallel vectors', () => {
      const v1 = { x: 1, y: 0, z: 0 };
      const v2 = { x: 2, y: 0, z: 0 };
      expect(Geometry.angleBetween(v1, v2)).toBe(0);
    });
    
    it('should calculate angle between perpendicular vectors', () => {
      const v1 = { x: 1, y: 0, z: 0 };
      const v2 = { x: 0, y: 1, z: 0 };
      expect(Geometry.angleBetween(v1, v2)).toBeCloseTo(Math.PI / 2);
    });
    
    it('should calculate angle between opposite vectors', () => {
      const v1 = { x: 1, y: 0, z: 0 };
      const v2 = { x: -1, y: 0, z: 0 };
      expect(Geometry.angleBetween(v1, v2)).toBeCloseTo(Math.PI);
    });
  });
  
  describe('boundingBoxFromPoints', () => {
    it('should create bounding box from points', () => {
      const points = [
        { x: -1, y: -2, z: -3 },
        { x: 1, y: 2, z: 3 },
        { x: 0, y: 0, z: 0 }
      ];
      const box = Geometry.boundingBoxFromPoints(points);
      
      expect(box.min.x).toBe(-1);
      expect(box.min.y).toBe(-2);
      expect(box.min.z).toBe(-3);
      expect(box.max.x).toBe(1);
      expect(box.max.y).toBe(2);
      expect(box.max.z).toBe(3);
    });
    
    it('should handle empty array', () => {
      const box = Geometry.boundingBoxFromPoints([]);
      expect(box.min.x).toBe(Infinity);
      expect(box.max.x).toBe(-Infinity);
    });
  });
  
  describe('triangleArea', () => {
    it('should calculate area of right triangle', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 0, z: 0 };
      const p3 = { x: 0, y: 4, z: 0 };
      expect(Geometry.triangleArea(p1, p2, p3)).toBe(6);
    });
    
    it('should calculate area of equilateral triangle', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 0, z: 0 };
      const p3 = { x: 0.5, y: Math.sqrt(3) / 2, z: 0 };
      expect(Geometry.triangleArea(p1, p2, p3)).toBeCloseTo(0.433, 3);
    });
  });
  
  describe('closestPointOnLineSegment', () => {
    it('should find closest point on line segment', () => {
      const lineStart = { x: 0, y: 0, z: 0 };
      const lineEnd = { x: 10, y: 0, z: 0 };
      
      // Point directly above middle of line
      const point = { x: 5, y: 5, z: 0 };
      const closest = Geometry.closestPointOnLineSegment(point, lineStart, lineEnd);
      expect(closest.x).toBe(5);
      expect(closest.y).toBe(0);
      expect(closest.z).toBe(0);
    });
    
    it('should clamp to line segment endpoints', () => {
      const lineStart = { x: 0, y: 0, z: 0 };
      const lineEnd = { x: 10, y: 0, z: 0 };
      
      // Point beyond end
      const point = { x: 15, y: 0, z: 0 };
      const closest = Geometry.closestPointOnLineSegment(point, lineStart, lineEnd);
      expect(closest.x).toBe(10);
      expect(closest.y).toBe(0);
      expect(closest.z).toBe(0);
    });
  });
  
  describe('signedAngle', () => {
    it('should calculate positive signed angle', () => {
      const v1 = { x: 1, y: 0, z: 0 };
      const v2 = { x: 0, y: 1, z: 0 };
      const normal = { x: 0, y: 0, z: 1 };
      const angle = Geometry.signedAngle(v1, v2, normal);
      expect(angle).toBeCloseTo(Math.PI / 2);
    });
    
    it('should calculate negative signed angle', () => {
      const v1 = { x: 1, y: 0, z: 0 };
      const v2 = { x: 0, y: -1, z: 0 };
      const normal = { x: 0, y: 0, z: 1 };
      const angle = Geometry.signedAngle(v1, v2, normal);
      expect(angle).toBeCloseTo(-Math.PI / 2);
    });
  });
  
  describe('lerp', () => {
    it('should interpolate between points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 10, y: 20, z: 30 };
      
      const mid = Geometry.lerp(p1, p2, 0.5);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(10);
      expect(mid.z).toBe(15);
      
      const quarter = Geometry.lerp(p1, p2, 0.25);
      expect(quarter.x).toBe(2.5);
      expect(quarter.y).toBe(5);
      expect(quarter.z).toBe(7.5);
    });
  });
  
  describe('isPointInBox', () => {
    it('should detect point inside box', () => {
      const box = new THREE.Box3(
        new THREE.Vector3(-1, -1, -1),
        new THREE.Vector3(1, 1, 1)
      );
      
      expect(Geometry.isPointInBox({ x: 0, y: 0, z: 0 }, box)).toBe(true);
      expect(Geometry.isPointInBox({ x: 0.5, y: 0.5, z: 0.5 }, box)).toBe(true);
    });
    
    it('should detect point outside box', () => {
      const box = new THREE.Box3(
        new THREE.Vector3(-1, -1, -1),
        new THREE.Vector3(1, 1, 1)
      );
      
      expect(Geometry.isPointInBox({ x: 2, y: 0, z: 0 }, box)).toBe(false);
      expect(Geometry.isPointInBox({ x: 0, y: 2, z: 0 }, box)).toBe(false);
      expect(Geometry.isPointInBox({ x: 0, y: 0, z: 2 }, box)).toBe(false);
    });
  });
});
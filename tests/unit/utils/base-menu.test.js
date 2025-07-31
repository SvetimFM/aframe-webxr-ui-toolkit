import { describe, it, expect, beforeEach } from 'vitest';
import { BaseMenu } from '../../../src/utils/base-menu.js';

describe('BaseMenu', () => {
  let menu;
  let container;
  
  beforeEach(() => {
    menu = new BaseMenu('test-menu');
    container = new MockEntity();
  });
  
  describe('initialization', () => {
    it('should create menu with ID', () => {
      expect(menu.id).toBe('test-menu');
      expect(menu.elements).toEqual([]);
      expect(menu.eventHandlers).toBeInstanceOf(Map);
    });
  });
  
  describe('element creation', () => {
    it('should create and track elements', () => {
      menu.init(container);
      
      const el = menu.createElement('a-entity');
      expect(menu.elements).toContain(el);
      expect(menu.elements.length).toBe(1);
    });
    
    it('should create title element', () => {
      menu.init(container);
      
      const title = menu.createTitle(container, 'Test Title');
      expect(title.getAttribute('value')).toBe('Test Title');
      expect(title.getAttribute('align')).toBe('center');
      expect(container.children).toContain(title);
    });
    
    it('should create button element', () => {
      menu.init(container);
      
      let clicked = false;
      const button = menu.createButton(container, {
        label: 'Test Button',
        onClick: () => { clicked = true; }
      });
      
      expect(button.getAttribute('button')).toEqual({
        label: 'Test Button',
        width: 0.15,
        height: 0.05,
        color: '#4285F4',
        hoverColor: '#5396F5',
        pressColor: '#3274E3',
        textColor: '#FFFFFF',
        fontSize: 0.03,
        toggleable: false,
        enabled: true
      });
      
      // Simulate click
      button.emit('button-clicked', {});
      expect(clicked).toBe(true);
    });
  });
  
  describe('cleanup', () => {
    it('should remove all elements on cleanup', () => {
      menu.init(container);
      
      // Create some elements
      menu.createTitle(container, 'Title');
      menu.createButton(container, { label: 'Button' });
      menu.createDivider(container);
      
      expect(menu.elements.length).toBe(3);
      expect(container.children.length).toBe(3);
      
      // Cleanup
      menu.cleanup();
      
      expect(menu.elements.length).toBe(0);
      expect(container.children.length).toBe(0);
    });
    
    it('should remove event listeners on cleanup', () => {
      menu.init(container);
      
      const button = menu.createElement('a-entity');
      const handler = () => {};
      menu.addEventListener(button, 'click', handler);
      
      expect(menu.eventHandlers.has(button)).toBe(true);
      
      menu.cleanup();
      
      expect(menu.eventHandlers.size).toBe(0);
    });
  });
  
  describe('menu lifecycle', () => {
    it('should show and hide menu', () => {
      menu.init(container);
      
      menu.show();
      expect(container.getAttribute('visible')).toBe(true);
      
      menu.hide();
      expect(container.getAttribute('visible')).toBe(false);
    });
    
    it('should emit events', () => {
      menu.init(container);
      
      let eventFired = false;
      container.addEventListener('test-event', (e) => {
        eventFired = true;
        expect(e.detail.menu).toBe('test-menu');
        expect(e.detail.data).toBe('test');
      });
      
      menu.emit('test-event', { data: 'test' });
      expect(eventFired).toBe(true);
    });
  });
});
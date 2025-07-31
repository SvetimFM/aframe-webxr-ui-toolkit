import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BaseMenu } from '../../src/utils/base-menu.js';
import { MenuRegistry } from '../../src/utils/menu-registry.js';

describe('Menu System Integration', () => {
  let container;
  
  beforeEach(() => {
    // Create container
    container = document.createElement('a-entity');
    document.body.appendChild(container);
    
    // Clear registry
    MenuRegistry.clear();
  });
  
  afterEach(() => {
    // Clean up
    if (container.parentNode) {
      container.remove();
    }
    MenuRegistry.clear();
  });
  
  describe('Menu Registration and Display', () => {
    it('should register and display a menu', () => {
      // Create test menu
      class TestMenu extends BaseMenu {
        constructor() {
          super('test-menu');
        }
        
        render(container, data) {
          this.createTitle(container, 'Test Menu');
          this.createButton(container, {
            label: 'Test Button',
            onClick: () => this.emit('test-click')
          });
        }
      }
      
      // Register menu
      const menu = new TestMenu();
      MenuRegistry.register(menu);
      
      expect(MenuRegistry.hasMenu('test-menu')).toBe(true);
      expect(MenuRegistry.getMenuIds()).toContain('test-menu');
      
      // Show menu
      MenuRegistry.showMenu('test-menu', container);
      
      expect(MenuRegistry.getActiveMenu()).toBe(menu);
      expect(container.children.length).toBeGreaterThan(0);
      
      // Check title was created
      const title = container.querySelector('a-text');
      expect(title).toBeTruthy();
      expect(title.getAttribute('value')).toBe('Test Menu');
      
      // Check button was created
      const button = container.querySelector('[button]');
      expect(button).toBeTruthy();
    });
    
    it('should handle menu switching', () => {
      // Create two menus
      class MenuA extends BaseMenu {
        constructor() {
          super('menu-a');
        }
        
        render(container) {
          this.createTitle(container, 'Menu A');
        }
      }
      
      class MenuB extends BaseMenu {
        constructor() {
          super('menu-b');
        }
        
        render(container) {
          this.createTitle(container, 'Menu B');
        }
      }
      
      const menuA = new MenuA();
      const menuB = new MenuB();
      
      MenuRegistry.register(menuA);
      MenuRegistry.register(menuB);
      
      // Show first menu
      MenuRegistry.showMenu('menu-a', container);
      expect(MenuRegistry.getActiveMenu()).toBe(menuA);
      
      const titleA = container.querySelector('a-text');
      expect(titleA.getAttribute('value')).toBe('Menu A');
      
      // Switch to second menu
      MenuRegistry.showMenu('menu-b', container);
      expect(MenuRegistry.getActiveMenu()).toBe(menuB);
      
      // First menu should be cleaned up
      const titles = container.querySelectorAll('a-text');
      expect(titles.length).toBe(1);
      expect(titles[0].getAttribute('value')).toBe('Menu B');
    });
    
    it('should handle menu events', async () => {
      let eventFired = false;
      
      class EventMenu extends BaseMenu {
        constructor() {
          super('event-menu');
        }
        
        render(container) {
          const button = this.createButton(container, {
            label: 'Click Me',
            onClick: () => {
              eventFired = true;
              this.emit('custom-event', { data: 'test' });
            }
          });
        }
      }
      
      const menu = new EventMenu();
      MenuRegistry.register(menu);
      MenuRegistry.showMenu('event-menu', container);
      
      // Find and click button
      const button = container.querySelector('[button]');
      expect(button).toBeTruthy();
      
      // Simulate button click
      button.emit('button-clicked', { label: 'Click Me' });
      
      // Wait for event propagation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(eventFired).toBe(true);
    });
  });
  
  describe('Menu Lifecycle', () => {
    it('should properly clean up menus', () => {
      class CleanupMenu extends BaseMenu {
        constructor() {
          super('cleanup-menu');
          this.cleanedUp = false;
        }
        
        render(container) {
          // Create multiple elements
          for (let i = 0; i < 5; i++) {
            this.createButton(container, {
              label: `Button ${i}`,
              position: `0 ${-i * 0.1} 0`
            });
          }
        }
        
        cleanup() {
          super.cleanup();
          this.cleanedUp = true;
        }
      }
      
      const menu = new CleanupMenu();
      MenuRegistry.register(menu);
      
      // Show menu
      MenuRegistry.showMenu('cleanup-menu', container);
      expect(container.children.length).toBe(5);
      
      // Hide menu
      MenuRegistry.hideActiveMenu();
      expect(container.children.length).toBe(0);
      expect(menu.cleanedUp).toBe(true);
    });
    
    it('should handle missing menus gracefully', () => {
      // Suppress console error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      MenuRegistry.showMenu('non-existent-menu', container);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Menu \'non-existent-menu\' not found')
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Complex Menu Interactions', () => {
    it('should support nested menu navigation', () => {
      const navigationPath = [];
      
      class MainMenu extends BaseMenu {
        constructor() {
          super('main');
        }
        
        render(container) {
          this.createTitle(container, 'Main Menu');
          this.createButton(container, {
            label: 'Settings',
            onClick: () => {
              navigationPath.push('settings');
              MenuRegistry.showMenu('settings');
            }
          });
        }
      }
      
      class SettingsMenu extends BaseMenu {
        constructor() {
          super('settings');
        }
        
        render(container) {
          this.createTitle(container, 'Settings');
          this.createButton(container, {
            label: 'Back',
            onClick: () => {
              navigationPath.push('main');
              MenuRegistry.showMenu('main');
            }
          });
        }
      }
      
      MenuRegistry.register(new MainMenu());
      MenuRegistry.register(new SettingsMenu());
      
      // Start at main menu
      MenuRegistry.showMenu('main', container);
      
      // Navigate to settings
      const settingsButton = container.querySelector('[button]');
      settingsButton.emit('button-clicked', {});
      
      expect(navigationPath).toEqual(['settings']);
      expect(container.querySelector('a-text').getAttribute('value')).toBe('Settings');
      
      // Navigate back
      const backButton = container.querySelector('[button]');
      backButton.emit('button-clicked', {});
      
      expect(navigationPath).toEqual(['settings', 'main']);
      expect(container.querySelector('a-text').getAttribute('value')).toBe('Main Menu');
    });
  });
});
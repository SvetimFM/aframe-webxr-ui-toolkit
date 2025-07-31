/**
 * Menu Registry
 * 
 * Singleton registry for managing menu instances in WebXR applications.
 * Provides centralized menu discovery and lifecycle management.
 * 
 * @module aframe-webxr-ui-toolkit/utils/menu-registry
 */

class MenuRegistryClass {
  constructor() {
    this.menus = new Map();
    this.activeMenu = null;
    this.container = null;
  }
  
  /**
   * Register a menu instance
   * @param {BaseMenu} menu - Menu instance to register
   */
  register(menu) {
    if (!menu || !menu.id) {
      console.error('MenuRegistry: Invalid menu registration - menu must have an id');
      return;
    }
    
    this.menus.set(menu.id, menu);
    console.log(`MenuRegistry: Registered menu '${menu.id}'`);
  }
  
  /**
   * Unregister a menu
   * @param {string} menuId - ID of menu to unregister
   */
  unregister(menuId) {
    if (this.menus.has(menuId)) {
      const menu = this.menus.get(menuId);
      
      // Clean up if it's the active menu
      if (this.activeMenu === menu) {
        menu.cleanup();
        this.activeMenu = null;
      }
      
      this.menus.delete(menuId);
      console.log(`MenuRegistry: Unregistered menu '${menuId}'`);
    }
  }
  
  /**
   * Get a registered menu by ID
   * @param {string} menuId - Menu ID
   * @returns {BaseMenu|null} Menu instance or null
   */
  getMenu(menuId) {
    return this.menus.get(menuId) || null;
  }
  
  /**
   * Show a specific menu
   * @param {string} menuId - ID of menu to show
   * @param {HTMLElement} container - Container element for the menu
   * @param {Object} data - Optional data to pass to menu
   */
  showMenu(menuId, container = null, data = {}) {
    const menu = this.getMenu(menuId);
    
    if (!menu) {
      console.error(`MenuRegistry: Menu '${menuId}' not found`);
      return;
    }
    
    // Use provided container or last used container
    if (container) {
      this.container = container;
    }
    
    if (!this.container) {
      console.error('MenuRegistry: No container specified for menu');
      return;
    }
    
    // Hide current menu if exists
    if (this.activeMenu && this.activeMenu !== menu) {
      this.activeMenu.cleanup();
    }
    
    // Initialize and render new menu
    menu.init(this.container, data);
    menu.render(this.container, data);
    
    this.activeMenu = menu;
    console.log(`MenuRegistry: Showing menu '${menuId}'`);
  }
  
  /**
   * Hide the currently active menu
   */
  hideActiveMenu() {
    if (this.activeMenu) {
      this.activeMenu.cleanup();
      this.activeMenu = null;
      console.log('MenuRegistry: Hidden active menu');
    }
  }
  
  /**
   * Get the currently active menu
   * @returns {BaseMenu|null} Active menu or null
   */
  getActiveMenu() {
    return this.activeMenu;
  }
  
  /**
   * Check if a menu is registered
   * @param {string} menuId - Menu ID to check
   * @returns {boolean} True if menu is registered
   */
  hasMenu(menuId) {
    return this.menus.has(menuId);
  }
  
  /**
   * Get all registered menu IDs
   * @returns {string[]} Array of menu IDs
   */
  getMenuIds() {
    return Array.from(this.menus.keys());
  }
  
  /**
   * Clear all registered menus
   */
  clear() {
    // Clean up active menu
    if (this.activeMenu) {
      this.activeMenu.cleanup();
      this.activeMenu = null;
    }
    
    // Clear registry
    this.menus.clear();
    this.container = null;
    
    console.log('MenuRegistry: Cleared all menus');
  }
}

// Export singleton instance
export const MenuRegistry = new MenuRegistryClass();
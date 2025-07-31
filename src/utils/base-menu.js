/**
 * BaseMenu Class
 * 
 * Base class for creating WebXR menu systems with proper lifecycle management.
 * Provides helpers for common UI patterns and automatic cleanup.
 * 
 * @module aframe-webxr-ui-toolkit/utils/base-menu
 * @example
 * class MainMenu extends BaseMenu {
 *   constructor() {
 *     super('main-menu');
 *   }
 *   
 *   render(container) {
 *     this.createTitle(container, 'Main Menu');
 *     this.createButton(container, {
 *       label: 'Start',
 *       onClick: () => this.emit('start')
 *     });
 *   }
 * }
 */

export class BaseMenu {
  /**
   * @param {string} id - Unique identifier for this menu
   */
  constructor(id) {
    this.id = id;
    this.container = null;
    this.elements = [];
    this.eventHandlers = new Map();
  }
  
  /**
   * Initialize the menu with a container
   * @param {HTMLElement} container - Container element for the menu
   * @param {Object} options - Optional configuration
   */
  init(container, options = {}) {
    this.container = container;
    this.options = options;
    this.elements = [];
    this.eventHandlers.clear();
  }
  
  /**
   * Render the menu content - override in subclasses
   * @param {HTMLElement} container - Container element
   * @param {Object} data - Optional data for rendering
   */
  render(container, data = {}) {
    console.warn(`BaseMenu: render() not implemented for ${this.id}`);
  }
  
  /**
   * Clean up all menu elements and event listeners
   */
  cleanup() {
    // Remove all event listeners
    this.eventHandlers.forEach((handlers, element) => {
      handlers.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventHandlers.clear();
    
    // Remove all elements
    this.elements.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });
    this.elements = [];
  }
  
  /**
   * Create and track an element
   * @param {string} tagName - Element tag name
   * @returns {HTMLElement} Created element
   */
  createElement(tagName) {
    const el = document.createElement(tagName);
    this.elements.push(el);
    return el;
  }
  
  /**
   * Add and track an event listener
   * @param {HTMLElement} el - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  addEventListener(el, event, handler) {
    if (!this.eventHandlers.has(el)) {
      this.eventHandlers.set(el, []);
    }
    
    this.eventHandlers.get(el).push({ event, handler });
    el.addEventListener(event, handler);
  }
  
  /**
   * Create a title element
   * @param {HTMLElement} container - Container to append to
   * @param {string} text - Title text
   * @param {Object} options - Style options
   * @returns {HTMLElement} Title element
   */
  createTitle(container, text, options = {}) {
    const title = this.createElement('a-text');
    title.setAttribute('value', text);
    title.setAttribute('align', 'center');
    title.setAttribute('position', options.position || '0 0.08 0');
    title.setAttribute('color', options.color || '#FFFFFF');
    title.setAttribute('width', options.width || '1');
    title.setAttribute('wrap-count', options.wrapCount || 20);
    
    const scale = options.scale || 0.025; // 4x smaller
    title.setAttribute('scale', `${scale} ${scale} ${scale}`);
    
    container.appendChild(title);
    return title;
  }
  
  /**
   * Create a subtitle element
   * @param {HTMLElement} container - Container to append to
   * @param {string} text - Subtitle text
   * @param {Object} options - Style options
   * @returns {HTMLElement} Subtitle element
   */
  createSubtitle(container, text, options = {}) {
    const subtitle = this.createElement('a-text');
    subtitle.setAttribute('value', text);
    subtitle.setAttribute('align', 'center');
    subtitle.setAttribute('position', options.position || '0 0.05 0');
    subtitle.setAttribute('color', options.color || '#AAAAAA');
    subtitle.setAttribute('width', options.width || '0.8');
    subtitle.setAttribute('wrap-count', options.wrapCount || 30);
    
    const scale = options.scale || 0.02; // 4x smaller
    subtitle.setAttribute('scale', `${scale} ${scale} ${scale}`);
    
    container.appendChild(subtitle);
    return subtitle;
  }
  
  /**
   * Create a divider line
   * @param {HTMLElement} container - Container to append to
   * @param {Object} options - Style options
   * @returns {HTMLElement} Divider element
   */
  createDivider(container, options = {}) {
    const divider = this.createElement('a-plane');
    divider.setAttribute('width', options.width || 0.25);
    divider.setAttribute('height', 0.001);
    divider.setAttribute('color', options.color || '#666666');
    divider.setAttribute('shader', 'flat');
    divider.setAttribute('position', options.position || '0 0.03 0');
    
    container.appendChild(divider);
    return divider;
  }
  
  /**
   * Create a button element
   * @param {HTMLElement} container - Container to append to
   * @param {Object} config - Button configuration
   * @returns {HTMLElement} Button element
   */
  createButton(container, config) {
    const button = this.createElement('a-entity');
    
    // Button attributes
    button.setAttribute('button', {
      label: config.label || 'Button',
      width: config.width || 0.04,
      height: config.height || 0.0125,
      color: config.color || '#4285F4',
      hoverColor: config.hoverColor || '#5396F5',
      pressColor: config.pressColor || '#3274E3',
      textColor: config.textColor || '#FFFFFF',
      fontSize: config.fontSize || 0.02, // 4x smaller
      toggleable: config.toggleable || false,
      enabled: config.enabled !== false
    });
    
    button.setAttribute('position', config.position || '0 0 0');
    
    if (config.id) {
      button.setAttribute('id', config.id);
    }
    
    // Add click handler
    if (config.onClick) {
      this.addEventListener(button, 'button-clicked', (event) => {
        config.onClick(event.detail);
      });
    }
    
    container.appendChild(button);
    return button;
  }
  
  /**
   * Create a text input area (placeholder for future implementation)
   * @param {HTMLElement} container - Container to append to
   * @param {Object} config - Input configuration
   * @returns {HTMLElement} Input element
   */
  createTextInput(container, config) {
    // Placeholder for text input implementation
    const input = this.createElement('a-plane');
    input.setAttribute('width', config.width || 0.2);
    input.setAttribute('height', config.height || 0.05);
    input.setAttribute('color', '#333333');
    input.setAttribute('position', config.position || '0 0 0');
    
    const text = this.createElement('a-text');
    text.setAttribute('value', config.placeholder || 'Text input');
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#999999');
    text.setAttribute('position', '0 0 0.001');
    text.setAttribute('scale', '0.03 0.03 0.03');
    
    input.appendChild(text);
    container.appendChild(input);
    return input;
  }
  
  /**
   * Emit an event from this menu
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail data
   */
  emit(eventName, detail = {}) {
    if (this.container) {
      this.container.emit(eventName, {
        menu: this.id,
        ...detail
      });
    }
  }
  
  /**
   * Show this menu
   */
  show() {
    if (this.container) {
      this.container.setAttribute('visible', true);
    }
  }
  
  /**
   * Hide this menu
   */
  hide() {
    if (this.container) {
      this.container.setAttribute('visible', false);
    }
  }
  
  /**
   * Update menu content
   * @param {Object} data - Data to update with
   */
  update(data) {
    this.cleanup();
    this.render(this.container, data);
  }
}
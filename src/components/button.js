/**
 * Button Component
 * 
 * Creates an interactive button optimized for WebXR hand tracking and controllers.
 * Provides visual feedback for hover, press, and toggle states.
 * 
 * @module aframe-webxr-ui-toolkit/components/button
 * @example
 * <a-entity 
 *   button="label: Click Me; width: 0.2; height: 0.08; toggleable: true"
 *   position="0 1.5 -2">
 * </a-entity>
 */

AFRAME.registerComponent('button', {
  schema: {
    label: { type: 'string', default: 'Button' },
    width: { type: 'number', default: 0.04 },
    height: { type: 'number', default: 0.0125 },
    color: { type: 'color', default: '#4285F4' },
    hoverColor: { type: 'color', default: '#5396F5' },
    pressColor: { type: 'color', default: '#3274E3' },
    textColor: { type: 'color', default: '#FFFFFF' },
    fontSize: { type: 'number', default: 0.02 }, // 4x smaller
    toggleable: { type: 'boolean', default: false },
    enabled: { type: 'boolean', default: true },
    rounded: { type: 'boolean', default: true }
  },

  init: function () {
    // Button state
    this.pressed = false;
    this.toggled = false;
    
    // Create button elements
    this.createButton();
    
    // Add event listeners
    this.addEventListeners();
  },

  createButton: function() {
    const el = this.el;
    const data = this.data;
    
    // Button background
    this.buttonBackground = document.createElement('a-plane');
    this.buttonBackground.setAttribute('width', data.width);
    this.buttonBackground.setAttribute('height', data.height);
    this.buttonBackground.setAttribute('color', data.color);
    this.buttonBackground.setAttribute('shader', 'flat');
    
    if (data.rounded) {
      this.buttonBackground.setAttribute('geometry', {
        primitive: 'plane',
        width: data.width,
        height: data.height,
        segmentsWidth: 2,
        segmentsHeight: 2
      });
      this.buttonBackground.setAttribute('material', {
        shader: 'flat',
        color: data.color,
        opacity: 0.9
      });
    }
    
    // Button text
    this.buttonText = document.createElement('a-text');
    this.buttonText.setAttribute('value', data.label);
    this.buttonText.setAttribute('color', data.textColor);
    this.buttonText.setAttribute('align', 'center');
    this.buttonText.setAttribute('position', '0 0 0.001');
    this.buttonText.setAttribute('width', data.width * 20);
    this.buttonText.setAttribute('wrap-count', Math.floor(data.width * 100));
    
    // Calculate font scale based on button size
    const fontScale = Math.min(data.fontSize, data.height * 0.6);
    this.buttonText.setAttribute('scale', `${fontScale} ${fontScale} ${fontScale}`);
    
    // Add elements to button entity
    el.appendChild(this.buttonBackground);
    el.appendChild(this.buttonText);
    
    // Make button pressable for hand tracking
    el.setAttribute('pressable', '');
  },
  
  addEventListeners: function() {
    // Bind methods
    this.onPressedStarted = this.onPressedStarted.bind(this);
    this.onPressedEnded = this.onPressedEnded.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    
    // Add event listeners for pressable
    this.el.addEventListener('pressedstarted', this.onPressedStarted);
    this.el.addEventListener('pressedended', this.onPressedEnded);
    
    // Add event listeners for hover
    this.el.addEventListener('mouseenter', this.onMouseEnter);
    this.el.addEventListener('mouseleave', this.onMouseLeave);
  },
  
  onMouseEnter: function() {
    if (!this.pressed && this.data.enabled) {
      this.buttonBackground.setAttribute('color', this.data.hoverColor);
      this.el.emit('button-hover', { label: this.data.label });
    }
  },
  
  onMouseLeave: function() {
    if (!this.pressed && this.data.enabled) {
      const color = this.toggled ? this.data.hoverColor : this.data.color;
      this.buttonBackground.setAttribute('color', color);
      this.el.emit('button-hover-end', { label: this.data.label });
    }
  },
  
  onPressedStarted: function() {
    if (!this.data.enabled) return;
    
    this.pressed = true;
    this.updateButtonState();
    
    this.el.emit('button-pressed', {
      label: this.data.label,
      toggled: this.toggled
    });
  },
  
  onPressedEnded: function() {
    if (!this.data.enabled || !this.pressed) return;
    
    this.pressed = false;
    
    // Toggle state if toggleable
    if (this.data.toggleable) {
      this.toggled = !this.toggled;
    }
    
    this.updateButtonState();
    
    // Emit click event
    this.el.emit('button-clicked', {
      label: this.data.label,
      toggled: this.toggled
    });
  },
  
  updateButtonState: function() {
    let color;
    
    if (!this.data.enabled) {
      color = '#808080'; // Disabled gray
    } else if (this.pressed) {
      color = this.data.pressColor;
    } else if (this.toggled) {
      color = this.data.hoverColor;
    } else {
      color = this.data.color;
    }
    
    this.buttonBackground.setAttribute('color', color);
    this.buttonText.setAttribute('color', this.data.enabled ? this.data.textColor : '#AAAAAA');
  },
  
  update: function(oldData) {
    const data = this.data;
    
    // Skip on first initialization
    if (Object.keys(oldData).length === 0) return;
    
    // Update button dimensions
    if (oldData.width !== data.width || oldData.height !== data.height) {
      this.buttonBackground.setAttribute('width', data.width);
      this.buttonBackground.setAttribute('height', data.height);
      this.buttonText.setAttribute('width', data.width * 20);
    }
    
    // Update text
    if (oldData.label !== data.label) {
      this.buttonText.setAttribute('value', data.label);
    }
    
    // Update colors
    if (oldData.textColor !== data.textColor) {
      this.buttonText.setAttribute('color', data.textColor);
    }
    
    // Update font size
    if (oldData.fontSize !== data.fontSize) {
      const fontScale = Math.min(data.fontSize, data.height * 0.6);
      this.buttonText.setAttribute('scale', `${fontScale} ${fontScale} ${fontScale}`);
    }
    
    this.updateButtonState();
  },
  
  /**
   * Set button toggle state programmatically
   */
  setToggled: function(toggled) {
    if (this.data.toggleable) {
      this.toggled = toggled;
      this.updateButtonState();
    }
  },
  
  /**
   * Enable or disable the button
   */
  setEnabled: function(enabled) {
    this.el.setAttribute('button', 'enabled', enabled);
  },
  
  remove: function() {
    // Remove event listeners
    this.el.removeEventListener('pressedstarted', this.onPressedStarted);
    this.el.removeEventListener('pressedended', this.onPressedEnded);
    this.el.removeEventListener('mouseenter', this.onMouseEnter);
    this.el.removeEventListener('mouseleave', this.onMouseLeave);
    
    // Clean up elements
    if (this.buttonBackground && this.buttonBackground.parentNode) {
      this.buttonBackground.remove();
    }
    
    if (this.buttonText && this.buttonText.parentNode) {
      this.buttonText.remove();
    }
  }
});
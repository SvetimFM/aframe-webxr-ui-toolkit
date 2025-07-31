/**
 * A-Frame WebXR UI Toolkit
 * 
 * Production-ready WebXR UI components with hand tracking support
 * 
 * @module aframe-webxr-ui-toolkit
 */

// Import components
import './components/pressable.js';
import './components/button.js';
import './components/scene-state.js';

// Import utilities
import { BaseMenu } from './utils/base-menu.js';
import { MenuRegistry } from './utils/menu-registry.js';
import * as UIElements from './utils/ui-elements.js';
import * as Geometry from './utils/geometry.js';
import * as Interaction from './utils/interaction.js';

// Version info
const VERSION = '0.1.0';

// Export utilities for direct use
export {
  BaseMenu,
  MenuRegistry,
  UIElements,
  Geometry,
  Interaction,
  VERSION
};

// Auto-register components when script loads
if (typeof AFRAME !== 'undefined') {
  console.log(`A-Frame WebXR UI Toolkit v${VERSION} loaded`);
} else {
  console.warn('A-Frame WebXR UI Toolkit: A-Frame not found. Please load A-Frame before this library.');
}
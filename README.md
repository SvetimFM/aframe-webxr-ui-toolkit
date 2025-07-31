# A-Frame WebXR UI Toolkit

Production-ready WebXR UI components for A-Frame with first-class hand tracking support. Create menus, buttons, and interactive UI elements that work seamlessly in AR/VR environments.

Built from real-world AR/VR applications, battle-tested on Meta Quest, Pico, and other WebXR devices.

## Features

- 🤌 **Hand Tracking Excellence** - Precise finger detection with 3D bounding boxes
- 📱 **Complete Menu Framework** - Extensible menu system with automatic cleanup
- 🎯 **Smart Interaction** - Reliable press/hover detection for WebXR
- 🔄 **State Management** - Reactive state system for A-Frame components
- 🎨 **Fully Customizable** - Colors, sizes, fonts all configurable
- 📐 **AR/VR Optimized** - Automatic sizing for different XR modes
- 🚀 **Zero Configuration** - Import and use with sensible defaults
- 💾 **Memory Safe** - Automatic cleanup prevents WebXR memory leaks

## Installation

```bash
npm install aframe-webxr-ui-toolkit
```

## Quick Start

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="node_modules/aframe-webxr-ui-toolkit/dist/aframe-webxr-ui-toolkit.js"></script>

<a-scene webxr="requiredFeatures: hand-tracking">
  <!-- Hand tracking ready button -->
  <a-entity 
    button="label: Click Me; width: 0.2; height: 0.08"
    pressable="pressDistance: 0.02"
    position="0 1.5 -2">
  </a-entity>
</a-scene>
```

## Core Components

### Button Component
Interactive buttons optimized for hand tracking and controllers. Fully customizable with automatic visual feedback.

```html
<a-entity 
  button="label: Start; 
          width: 0.04; 
          height: 0.015; 
          color: #4285F4;
          hoverColor: #5396F5;
          pressColor: #3274E3;
          textColor: #FFFFFF;
          fontSize: 0.02;
          toggleable: false;
          enabled: true"
  position="0 1.2 -0.5">
</a-entity>
```

**Key Features:**
- Automatic hover/press states
- Toggle button support
- Customizable colors and sizes
- Hand tracking optimized hit detection
- Visual feedback for all states

### Pressable Component
Advanced proximity detection for hand tracking interactions.

```javascript
<a-entity 
  pressable="pressDistance: 0.02; 
             hoverDistance: 0.05;
             debug: false">
</a-entity>
```

### Menu Framework
Build complex menu systems with the BaseMenu class. Full lifecycle management with automatic cleanup.

```javascript
import { BaseMenu, MenuRegistry } from 'aframe-webxr-ui-toolkit';

class MainMenu extends BaseMenu {
  constructor() {
    super('main-menu');
  }
  
  render(container) {
    // Menu panel
    const panel = this.createElement('a-plane');
    panel.setAttribute('width', 0.1);
    panel.setAttribute('height', 0.15);
    panel.setAttribute('color', '#1a1a1a');
    container.appendChild(panel);
    
    // Title
    this.createTitle(container, 'Main Menu', {
      position: '0 0.06 0',
      scale: 0.03
    });
    
    // Buttons
    this.createButton(container, {
      label: 'Start',
      position: '0 0.02 0',
      width: 0.08,
      height: 0.02,
      onClick: () => this.emit('start-game')
    });
    
    this.createButton(container, {
      label: 'Settings',
      position: '0 -0.02 0',
      onClick: () => MenuRegistry.showMenu('settings')
    });
  }
}

// Register and show
MenuRegistry.register(new MainMenu());
MenuRegistry.showMenu('main-menu', document.querySelector('#menu-container'));
```

**Menu Features:**
- Automatic cleanup on menu switch
- Event-driven architecture
- Helper methods for common UI elements
- Memory leak prevention
- Nested menu support

### State Management
Share state across A-Frame components.

```javascript
// Set state
this.el.sceneEl.systems['scene-state'].updateState('game.score', 100);

// Listen for changes
this.el.sceneEl.addEventListener('state-changed', (event) => {
  if (event.detail.path === 'game.score') {
    console.log('New score:', event.detail.value);
  }
});
```

## Utilities

### UI Elements
Helper functions for common WebXR UI patterns.

```javascript
import { createMarker, createLine, createMeasurementText } from 'aframe-webxr-ui-toolkit/utils';

// Create visual markers
const marker = createMarker(position, 'Point A', '#4285F4');

// Draw lines between points
const line = createLine(startPos, endPos, '#00FF00');

// Add measurement text
const text = createMeasurementText(2.5, position, 'm');
```

### Interaction Helpers
Simplify hand tracking interactions.

```javascript
import { getPinchPosition, getHandEntities } from 'aframe-webxr-ui-toolkit/utils';

// Get current pinch position
const pinchPos = getPinchPosition(handEl);

// Find hand entities
const { left, right } = getHandEntities(sceneEl);
```

## Examples

### Basic Menu
```javascript
<a-scene>
  <a-entity id="menu-container" position="0 1.5 -2">
    <!-- Menu will be rendered here -->
  </a-entity>
</a-scene>

<script>
  const menu = new BaseMenu('my-menu');
  menu.render(document.querySelector('#menu-container'));
</script>
```

### Hand Tracking Button
```javascript
<a-entity
  geometry="primitive: box; width: 0.2; height: 0.08; depth: 0.02"
  material="color: #4285F4"
  button="label: Action"
  pressable
  position="0 1.5 -2"
  button-clicked="console.log('Button pressed!')">
</a-entity>
```

### State-Driven UI
```javascript
AFRAME.registerComponent('score-display', {
  init() {
    this.el.sceneEl.addEventListener('state-changed', (e) => {
      if (e.detail.path === 'game.score') {
        this.el.setAttribute('text', `value: Score: ${e.detail.value}`);
      }
    });
  }
});
```

## Browser Support

- Meta Quest Browser ✅
- Chrome (Android) ✅
- Edge (Windows MR) ✅
- Firefox Reality ✅
- Safari (Vision Pro) 🔄 (WebXR pending)

## Contributing

We welcome contributions! This toolkit grows stronger with community input.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Built with ❤️ by the O3Measure team and the WebXR community.

Special thanks to the A-Frame team for making WebXR accessible to everyone.

---

**Let's bring AR to the web together!** 🚀
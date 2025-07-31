# A-Frame WebXR UI Toolkit API Reference

## Table of Contents

- [Components](#components)
  - [button](#button-component)
  - [pressable](#pressable-component)
  - [grabbable](#grabbable-component)
  - [state-reactive](#state-reactive-component)
- [Classes](#classes)
  - [BaseMenu](#basemenu-class)
  - [MenuRegistry](#menuregistry-class)
- [State Management](#state-management)
  - [scene-state](#scene-state-system)
- [Utilities](#utilities)
  - [UI Elements](#ui-elements)
  - [Interaction Helpers](#interaction-helpers)
  - [Geometry Utilities](#geometry-utilities)

---

## Components

### button Component

Creates an interactive button optimized for WebXR hand tracking and controllers.

#### Schema

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | 'Button' | Text displayed on the button |
| `width` | number | 0.04 | Button width in meters |
| `height` | number | 0.0125 | Button height in meters |
| `color` | color | '#4285F4' | Default background color |
| `hoverColor` | color | '#5396F5' | Color when hovering |
| `pressColor` | color | '#3274E3' | Color when pressed |
| `textColor` | color | '#FFFFFF' | Text color |
| `fontSize` | number | 0.02 | Font size in meters |
| `toggleable` | boolean | false | Can be toggled on/off |
| `enabled` | boolean | true | Is button interactive |
| `rounded` | boolean | true | Show rounded corners |

#### Events

##### button-hover
Fired when hand/controller starts hovering over button.
```javascript
el.addEventListener('button-hover', (event) => {
  console.log('Hovering:', event.detail.label);
});
```

##### button-hover-end
Fired when hand/controller stops hovering.
```javascript
el.addEventListener('button-hover-end', (event) => {
  console.log('Hover ended:', event.detail.label);
});
```

##### button-pressed
Fired when button press starts.
```javascript
el.addEventListener('button-pressed', (event) => {
  console.log('Pressed:', event.detail.label);
  console.log('Toggled state:', event.detail.toggled);
});
```

##### button-clicked
Fired when button press completes.
```javascript
el.addEventListener('button-clicked', (event) => {
  console.log('Clicked:', event.detail.label);
  console.log('Toggled state:', event.detail.toggled);
});
```

#### Methods

##### setToggled(toggled)
Programmatically set toggle state.
```javascript
buttonEl.components.button.setToggled(true);
```

##### setEnabled(enabled)
Enable or disable the button.
```javascript
buttonEl.components.button.setEnabled(false);
```

#### Example
```html
<a-entity 
  button="label: Start Game; 
          width: 0.06; 
          height: 0.02; 
          color: #4CAF50;
          toggleable: false"
  position="0 1.2 -0.5">
</a-entity>
```

---

### pressable Component

Handles proximity-based hand tracking interactions using 3D bounding boxes.

#### Schema

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pressDistance` | number | 0.005 | Distance in meters to trigger press |
| `hoverDistance` | number | 0.02 | Distance in meters to trigger hover |
| `debug` | boolean | false | Show debug visualization |

#### Events

##### pressedstarted
Fired when press begins.
```javascript
el.addEventListener('pressedstarted', (event) => {
  console.log('Press started');
});
```

##### pressedended
Fired when press ends.
```javascript
el.addEventListener('pressedended', (event) => {
  console.log('Press ended');
});
```

##### mouseenter
Fired when hand enters hover distance.
```javascript
el.addEventListener('mouseenter', (event) => {
  console.log('Hand hovering');
});
```

##### mouseleave
Fired when hand leaves hover distance.
```javascript
el.addEventListener('mouseleave', (event) => {
  console.log('Hand left');
});
```

#### Example
```html
<a-entity 
  geometry="primitive: box; width: 0.1; height: 0.1; depth: 0.02"
  material="color: blue"
  pressable="pressDistance: 0.01; hoverDistance: 0.03; debug: true">
</a-entity>
```

---

### grabbable Component

Makes entities grabbable with hand pinch gestures.

#### Schema

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `startDistance` | number | 0.02 | Pinch distance to start grab |
| `endDistance` | number | 0.05 | Pinch distance to end grab |

#### Events

##### grab-start
Fired when grab begins.
```javascript
el.addEventListener('grab-start', (event) => {
  console.log('Grabbed by:', event.detail.hand); // 'left' or 'right'
});
```

##### grab-end
Fired when grab ends.
```javascript
el.addEventListener('grab-end', (event) => {
  console.log('Released by:', event.detail.hand);
});
```

#### Example
```html
<a-entity 
  geometry="primitive: sphere; radius: 0.05"
  material="color: red"
  grabbable>
</a-entity>
```

---

### state-reactive Component

Makes components reactive to scene state changes.

#### Schema

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `path` | string | '' | State path to watch (e.g., 'game.score') |
| `property` | string | '' | Component property to update |
| `component` | string | '' | Target component name |

#### Example
```html
<!-- Updates text when state changes -->
<a-text 
  value="Score: 0"
  state-reactive="path: game.score; 
                 property: value; 
                 component: text">
</a-text>
```

---

## Classes

### BaseMenu Class

Base class for creating structured WebXR menus with lifecycle management.

#### Constructor
```javascript
constructor(id)
```
- `id` {string} - Unique identifier for the menu

#### Methods

##### init(container, options)
Initialize the menu with a container.
```javascript
menu.init(container, { theme: 'dark' });
```

##### render(container, data)
Render menu content. Override in subclasses.
```javascript
render(container, data = {}) {
  this.createTitle(container, 'My Menu');
  this.createButton(container, {
    label: 'Start',
    onClick: () => this.emit('start')
  });
}
```

##### cleanup()
Clean up all menu elements and event listeners.
```javascript
menu.cleanup();
```

##### createElement(tagName)
Create and track an element.
```javascript
const plane = this.createElement('a-plane');
plane.setAttribute('width', 0.2);
```

##### addEventListener(el, event, handler)
Add and track an event listener.
```javascript
this.addEventListener(button, 'click', () => {
  console.log('Button clicked');
});
```

##### createTitle(container, text, options)
Create a title element.
```javascript
this.createTitle(container, 'Settings', {
  position: '0 0.06 0',
  scale: 0.03,
  color: '#FFFFFF'
});
```

Options:
- `position` {string} - Position relative to container
- `scale` {number} - Text scale (default: 0.025)
- `color` {string} - Text color (default: '#FFFFFF')
- `width` {number} - Text width for wrapping
- `wrapCount` {number} - Character wrap count

##### createSubtitle(container, text, options)
Create a subtitle element.
```javascript
this.createSubtitle(container, 'Choose an option', {
  position: '0 0.04 0',
  scale: 0.02,
  color: '#AAAAAA'
});
```

##### createDivider(container, options)
Create a horizontal divider.
```javascript
this.createDivider(container, {
  position: '0 0.02 0',
  width: 0.08,
  color: '#666666'
});
```

##### createButton(container, config)
Create an interactive button.
```javascript
this.createButton(container, {
  label: 'Play',
  position: '0 0 0',
  width: 0.06,
  height: 0.02,
  color: '#4CAF50',
  onClick: (detail) => {
    console.log('Button clicked:', detail);
  }
});
```

Config options:
- All button component properties
- `position` {string} - Position in container
- `id` {string} - Element ID
- `onClick` {Function} - Click handler

##### emit(eventName, detail)
Emit a custom event from the menu.
```javascript
this.emit('menu-action', {
  action: 'start-game',
  difficulty: 'hard'
});
```

##### show()
Show the menu.
```javascript
menu.show();
```

##### hide()
Hide the menu.
```javascript
menu.hide();
```

##### update(data)
Update menu content with new data.
```javascript
menu.update({ score: 100 });
```

#### Example
```javascript
class MainMenu extends BaseMenu {
  constructor() {
    super('main-menu');
  }
  
  render(container) {
    this.cleanup();
    
    // Background
    const bg = this.createElement('a-plane');
    bg.setAttribute('width', 0.1);
    bg.setAttribute('height', 0.15);
    bg.setAttribute('color', '#1a1a1a');
    container.appendChild(bg);
    
    // Title
    this.createTitle(container, 'Main Menu');
    
    // Buttons
    this.createButton(container, {
      label: 'New Game',
      position: '0 0.02 0',
      onClick: () => this.emit('new-game')
    });
    
    this.createButton(container, {
      label: 'Settings',
      position: '0 -0.02 0',
      onClick: () => MenuRegistry.showMenu('settings')
    });
  }
}
```

---

### MenuRegistry Class

Global registry for managing menus.

#### Static Methods

##### register(menu)
Register a menu instance.
```javascript
const menu = new MainMenu();
MenuRegistry.register(menu);
```

##### showMenu(menuId, container, data)
Show a registered menu.
```javascript
// Show in specific container
MenuRegistry.showMenu('main-menu', container);

// Show with data
MenuRegistry.showMenu('game-over', container, {
  score: 1500,
  highScore: 2000
});
```

##### hideActiveMenu()
Hide the currently active menu.
```javascript
MenuRegistry.hideActiveMenu();
```

##### getActiveMenu()
Get the currently active menu.
```javascript
const activeMenu = MenuRegistry.getActiveMenu();
if (activeMenu) {
  console.log('Current menu:', activeMenu.id);
}
```

##### hasMenu(menuId)
Check if a menu is registered.
```javascript
if (MenuRegistry.hasMenu('settings')) {
  MenuRegistry.showMenu('settings');
}
```

##### getMenuIds()
Get all registered menu IDs.
```javascript
const menuIds = MenuRegistry.getMenuIds();
console.log('Available menus:', menuIds);
```

##### clear()
Remove all registered menus.
```javascript
MenuRegistry.clear();
```

#### Example
```javascript
// Register menus
MenuRegistry.register(new MainMenu());
MenuRegistry.register(new SettingsMenu());
MenuRegistry.register(new GameOverMenu());

// Show main menu
const container = document.querySelector('#menu-container');
MenuRegistry.showMenu('main-menu', container);

// Switch menus
MenuRegistry.showMenu('settings', container);

// Hide current menu
MenuRegistry.hideActiveMenu();
```

---

## State Management

### scene-state System

A-Frame system for managing shared state across components.

#### Methods

##### updateState(path, value)
Update a state value.
```javascript
sceneEl.systems['scene-state'].updateState('player.health', 100);
sceneEl.systems['scene-state'].updateState('ui.menuOpen', true);
```

##### getState(path)
Get a state value.
```javascript
const health = sceneEl.systems['scene-state'].getState('player.health');
const menuOpen = sceneEl.systems['scene-state'].getState('ui.menuOpen');
```

##### clearState()
Clear all state.
```javascript
sceneEl.systems['scene-state'].clearState();
```

#### Events

##### state-changed
Fired when any state value changes.
```javascript
sceneEl.addEventListener('state-changed', (event) => {
  console.log('State changed:', event.detail.path);
  console.log('New value:', event.detail.value);
  console.log('Old value:', event.detail.oldValue);
});
```

#### Example
```javascript
// Set up state listener
AFRAME.registerComponent('health-display', {
  init() {
    this.el.sceneEl.addEventListener('state-changed', (e) => {
      if (e.detail.path === 'player.health') {
        this.el.setAttribute('text', `value: Health: ${e.detail.value}`);
      }
    });
  }
});

// Update state from anywhere
this.el.sceneEl.systems['scene-state'].updateState('player.health', 75);
```

---

## Utilities

### UI Elements

Helper functions for creating common UI patterns.

#### createMarker(position, label, color)
Create a visual marker.
```javascript
import { createMarker } from 'aframe-webxr-ui-toolkit/utils';

const marker = createMarker(
  new THREE.Vector3(0, 1, -2),
  'Point A',
  '#FF0000'
);
scene.appendChild(marker);
```

#### createLine(startPos, endPos, color)
Create a line between two points.
```javascript
import { createLine } from 'aframe-webxr-ui-toolkit/utils';

const line = createLine(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 1, -1),
  '#00FF00'
);
scene.appendChild(line);
```

#### createMeasurementText(value, position, unit)
Create measurement text.
```javascript
import { createMeasurementText } from 'aframe-webxr-ui-toolkit/utils';

const text = createMeasurementText(
  2.5,
  new THREE.Vector3(0.5, 1, -1),
  'meters'
);
scene.appendChild(text);
```

#### createButton(config)
Create a button element.
```javascript
import { createButton } from 'aframe-webxr-ui-toolkit/utils';

const button = createButton({
  label: 'Click Me',
  position: '0 1.5 -2',
  width: 0.1,
  onClick: () => console.log('Clicked!')
});
scene.appendChild(button);
```

---

### Interaction Helpers

Utilities for hand tracking interactions.

#### getPinchPosition(handEl)
Get the current pinch position from a hand entity.
```javascript
import { getPinchPosition } from 'aframe-webxr-ui-toolkit/utils';

const leftHand = document.querySelector('[hand-tracking-controls="hand: left"]');
const pinchPos = getPinchPosition(leftHand);
if (pinchPos) {
  console.log('Pinch at:', pinchPos);
}
```

#### getHandEntities(sceneEl)
Get both hand tracking entities.
```javascript
import { getHandEntities } from 'aframe-webxr-ui-toolkit/utils';

const hands = getHandEntities(sceneEl);
console.log('Left hand:', hands.left);
console.log('Right hand:', hands.right);
```

#### isHandPinching(handEl)
Check if a hand is currently pinching.
```javascript
import { isHandPinching } from 'aframe-webxr-ui-toolkit/utils';

const isPinching = isHandPinching(leftHand);
if (isPinching) {
  console.log('Hand is pinching');
}
```

---

### Geometry Utilities

3D math helpers for spatial calculations.

#### calculateDistance(point1, point2)
Calculate distance between two points.
```javascript
import { calculateDistance } from 'aframe-webxr-ui-toolkit/utils';

const distance = calculateDistance(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 1, 1)
);
console.log('Distance:', distance);
```

#### calculateNormal(points)
Calculate surface normal from points.
```javascript
import { calculateNormal } from 'aframe-webxr-ui-toolkit/utils';

const normal = calculateNormal([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0)
]);
console.log('Normal:', normal);
```

#### projectPointOntoPlane(point, planePoint, planeNormal)
Project a point onto a plane.
```javascript
import { projectPointOntoPlane } from 'aframe-webxr-ui-toolkit/utils';

const projected = projectPointOntoPlane(
  new THREE.Vector3(0, 5, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 1, 0)
);
console.log('Projected point:', projected);
```

---

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-webxr-ui-toolkit"></script>
  <script type="module">
    import { BaseMenu, MenuRegistry } from 'aframe-webxr-ui-toolkit';
    
    // Custom menu
    class GameMenu extends BaseMenu {
      constructor() {
        super('game-menu');
      }
      
      render(container, data = {}) {
        this.cleanup();
        
        // Background
        const bg = this.createElement('a-plane');
        bg.setAttribute('width', 0.12);
        bg.setAttribute('height', 0.16);
        bg.setAttribute('color', '#222');
        container.appendChild(bg);
        
        // Title
        this.createTitle(container, 'Space Game', {
          position: '0 0.06 0.001'
        });
        
        // Score
        this.createSubtitle(container, `Score: ${data.score || 0}`, {
          position: '0 0.04 0.001'
        });
        
        // Divider
        this.createDivider(container, {
          position: '0 0.025 0.001'
        });
        
        // Buttons
        this.createButton(container, {
          label: 'New Game',
          position: '0 0 0.001',
          color: '#4CAF50',
          onClick: () => {
            this.emit('new-game');
            this.updateScore(0);
          }
        });
        
        this.createButton(container, {
          label: 'Quit',
          position: '0 -0.03 0.001',
          color: '#F44336',
          onClick: () => this.emit('quit')
        });
      }
      
      updateScore(score) {
        this.el.sceneEl.systems['scene-state'].updateState('game.score', score);
      }
    }
    
    // Initialize on scene load
    document.querySelector('a-scene').addEventListener('loaded', () => {
      // Register menu
      const menu = new GameMenu();
      MenuRegistry.register(menu);
      
      // Show menu
      const container = document.querySelector('#menu-container');
      MenuRegistry.showMenu('game-menu', container, { score: 0 });
      
      // Listen for state changes
      const scene = document.querySelector('a-scene');
      scene.addEventListener('state-changed', (e) => {
        if (e.detail.path === 'game.score') {
          // Update menu with new score
          menu.update({ score: e.detail.value });
        }
      });
      
      // Listen for menu events
      container.addEventListener('new-game', () => {
        console.log('Starting new game...');
      });
      
      container.addEventListener('quit', () => {
        console.log('Quitting game...');
      });
    });
  </script>
</head>
<body>
  <a-scene webxr="requiredFeatures: hand-tracking">
    <a-entity 
      id="menu-container" 
      position="0 1.2 -0.5"
      grabbable>
    </a-entity>
    
    <a-entity camera position="0 1.6 0">
      <a-entity hand-tracking-controls="hand: left"></a-entity>
      <a-entity hand-tracking-controls="hand: right"></a-entity>
    </a-entity>
  </a-scene>
</body>
</html>
```
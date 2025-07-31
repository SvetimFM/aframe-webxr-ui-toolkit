# Menu System Configuration Guide

## Overview

The A-Frame WebXR UI Toolkit provides a flexible menu system optimized for AR/VR experiences with hand tracking support. This guide covers all configuration options and best practices.

## Quick Start

```javascript
import { BaseMenu, MenuRegistry } from 'aframe-webxr-ui-toolkit';

// Create a custom menu
class MyMenu extends BaseMenu {
  constructor() {
    super('my-menu-id');
  }
  
  render(container) {
    this.createTitle(container, 'My Menu');
    this.createButton(container, {
      label: 'Action',
      onClick: () => console.log('Clicked!')
    });
  }
}

// Register and show
MenuRegistry.register(new MyMenu());
MenuRegistry.showMenu('my-menu-id', document.querySelector('#menu-container'));
```

## Component Configuration

### Button Component

The `button` component creates interactive buttons optimized for hand tracking.

```html
<a-entity
  button="label: Click Me;
         width: 0.04;
         height: 0.015;
         color: #4285F4;
         hoverColor: #5396F5;
         pressColor: #3274E3;
         textColor: #FFFFFF;
         fontSize: 0.02;
         toggleable: false;
         enabled: true;
         rounded: true"
  position="0 1.2 -0.3">
</a-entity>
```

#### Button Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | 'Button' | Button text |
| `width` | number | 0.04 | Button width in meters |
| `height` | number | 0.0125 | Button height in meters |
| `color` | color | '#4285F4' | Default button color |
| `hoverColor` | color | '#5396F5' | Color when hovering |
| `pressColor` | color | '#3274E3' | Color when pressed |
| `textColor` | color | '#FFFFFF' | Text color |
| `fontSize` | number | 0.02 | Font size |
| `toggleable` | boolean | false | Can be toggled on/off |
| `enabled` | boolean | true | Is button interactive |
| `rounded` | boolean | true | Rounded corners |

#### Button Events

```javascript
button.addEventListener('button-hover', (e) => {
  console.log('Hovering:', e.detail.label);
});

button.addEventListener('button-pressed', (e) => {
  console.log('Pressed:', e.detail.label);
});

button.addEventListener('button-clicked', (e) => {
  console.log('Clicked:', e.detail.label, 'Toggled:', e.detail.toggled);
});
```

### Pressable Component

The `pressable` component handles hand tracking interaction detection.

```html
<a-entity
  pressable="pressDistance: 0.005;
            hoverDistance: 0.02;
            debug: false">
</a-entity>
```

#### Pressable Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pressDistance` | number | 0.005 | Distance (m) to trigger press |
| `hoverDistance` | number | 0.02 | Distance (m) to trigger hover |
| `debug` | boolean | false | Show debug visualization |

## BaseMenu Class

The `BaseMenu` class provides a framework for creating structured menus.

### Creating Custom Menus

```javascript
class CustomMenu extends BaseMenu {
  constructor() {
    super('custom-menu'); // Unique menu ID
  }
  
  render(container, data = {}) {
    // Clear previous content
    this.cleanup();
    
    // Create menu panel
    const panel = this.createElement('a-plane');
    panel.setAttribute('width', 0.1);
    panel.setAttribute('height', 0.15);
    panel.setAttribute('color', '#1a1a1a');
    container.appendChild(panel);
    
    // Add UI elements
    this.createTitle(container, 'Settings', {
      position: '0 0.06 0',
      scale: 0.03
    });
    
    this.createSubtitle(container, 'Audio Options', {
      position: '0 0.04 0',
      scale: 0.02
    });
    
    this.createDivider(container, {
      position: '0 0.03 0',
      width: 0.08
    });
    
    // Toggle button
    this.createButton(container, {
      label: 'Sound: ON',
      position: '0 0 0',
      width: 0.08,
      height: 0.02,
      toggleable: true,
      onClick: (detail) => {
        const label = detail.toggled ? 'Sound: OFF' : 'Sound: ON';
        event.target.setAttribute('button', 'label', label);
        this.emit('sound-toggle', { enabled: !detail.toggled });
      }
    });
  }
}
```

### BaseMenu Helper Methods

#### createTitle(container, text, options)
Creates a title element.

```javascript
this.createTitle(container, 'Main Menu', {
  position: '0 0.05 0',    // Position relative to container
  scale: 0.03,             // Text scale
  color: '#FFFFFF',        // Text color
  width: 1,                // Text width for wrapping
  wrapCount: 20            // Character wrap count
});
```

#### createSubtitle(container, text, options)
Creates a subtitle element.

```javascript
this.createSubtitle(container, 'Select an option', {
  position: '0 0.03 0',
  scale: 0.02,
  color: '#AAAAAA'
});
```

#### createDivider(container, options)
Creates a horizontal line divider.

```javascript
this.createDivider(container, {
  position: '0 0.02 0',
  width: 0.08,
  color: '#666666'
});
```

#### createButton(container, config)
Creates an interactive button.

```javascript
this.createButton(container, {
  label: 'Start Game',
  position: '0 -0.02 0',
  width: 0.06,
  height: 0.02,
  color: '#4285F4',
  onClick: (detail) => {
    console.log('Button clicked:', detail);
  }
});
```

#### emit(eventName, detail)
Emits a custom event from the menu.

```javascript
this.emit('menu-action', {
  action: 'start-game',
  difficulty: 'normal'
});
```

## MenuRegistry

The `MenuRegistry` manages all menus in your application.

### Registering Menus

```javascript
const mainMenu = new MainMenu();
const settingsMenu = new SettingsMenu();

MenuRegistry.register(mainMenu);
MenuRegistry.register(settingsMenu);
```

### Showing Menus

```javascript
// Show a menu in a container
const container = document.querySelector('#menu-container');
MenuRegistry.showMenu('main-menu', container);

// Show with data
MenuRegistry.showMenu('settings-menu', container, {
  soundEnabled: true,
  difficulty: 'normal'
});
```

### Menu Navigation

```javascript
// In your menu class
this.createButton(container, {
  label: 'Settings',
  onClick: () => {
    MenuRegistry.showMenu('settings-menu');
  }
});
```

### Other Registry Methods

```javascript
// Hide current menu
MenuRegistry.hideActiveMenu();

// Get active menu
const currentMenu = MenuRegistry.getActiveMenu();

// Check if menu exists
if (MenuRegistry.hasMenu('settings-menu')) {
  // ...
}

// Get all menu IDs
const menuIds = MenuRegistry.getMenuIds();

// Clear all menus
MenuRegistry.clear();
```

## AR Mode Configuration

For AR experiences, use smaller dimensions:

```javascript
// AR-optimized button
this.createButton(container, {
  label: 'AR Action',
  width: 0.04,      // 4cm wide
  height: 0.015,    // 1.5cm tall
  fontSize: 0.02,   // 2cm font
  position: '0 0 0'
});

// AR-optimized menu panel
const panel = this.createElement('a-plane');
panel.setAttribute('width', 0.1);    // 10cm wide
panel.setAttribute('height', 0.15);  // 15cm tall
```

## Making Menus Grabbable

Add the `grabbable` attribute to make menus moveable:

```html
<a-entity
  id="menu-container"
  position="0 1.2 -0.3"
  grabbable>
</a-entity>
```

## Best Practices

### 1. Size Guidelines

**VR Mode:**
- Buttons: 15cm × 5cm (0.15 × 0.05)
- Font size: 3-5cm
- Menu distance: 1-2m from user

**AR Mode:**
- Buttons: 4cm × 1.5cm (0.04 × 0.015)
- Font size: 2cm
- Menu distance: 30-50cm from user

### 2. Color Contrast

Use high contrast colors for better visibility:
- Dark backgrounds (#1a1a1a) with light text (#FFFFFF)
- Bright button colors (#4285F4) with white text
- Clear hover states (10-20% lighter)

### 3. Interaction Feedback

Always provide visual feedback:
```javascript
// Button states
color: '#4285F4'      // Default
hoverColor: '#5396F5' // 10% lighter
pressColor: '#3274E3' // 10% darker
```

### 4. Text Length

Keep labels short for AR:
```javascript
// Good for AR
label: 'Start'
label: 'Menu'
label: 'Exit'

// Too long for small buttons
label: 'Start New Game Session'
```

### 5. Menu Organization

Group related actions:
```javascript
render(container) {
  this.createTitle(container, 'Game Menu');
  
  // Game actions
  this.createButton(container, { label: 'New Game' });
  this.createButton(container, { label: 'Continue' });
  
  this.createDivider(container);
  
  // Settings
  this.createButton(container, { label: 'Settings' });
  this.createButton(container, { label: 'Exit' });
}
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-webxr-ui-toolkit"></script>
  <script type="module">
    import { BaseMenu, MenuRegistry } from 'aframe-webxr-ui-toolkit';
    
    class GameMenu extends BaseMenu {
      constructor() {
        super('game-menu');
      }
      
      render(container) {
        this.cleanup();
        
        // Menu background
        const bg = this.createElement('a-plane');
        bg.setAttribute('width', 0.12);
        bg.setAttribute('height', 0.18);
        bg.setAttribute('color', '#1a1a1a');
        bg.setAttribute('opacity', 0.95);
        container.appendChild(bg);
        
        // Title
        this.createTitle(container, 'Game Menu', {
          position: '0 0.07 0.001',
          scale: 0.025
        });
        
        // Buttons
        this.createButton(container, {
          label: 'Play',
          position: '0 0.03 0.001',
          color: '#4CAF50',
          onClick: () => this.emit('start-game')
        });
        
        this.createButton(container, {
          label: 'Options',
          position: '0 0 0.001',
          onClick: () => MenuRegistry.showMenu('options')
        });
        
        this.createButton(container, {
          label: 'Quit',
          position: '0 -0.03 0.001',
          color: '#F44336',
          onClick: () => this.emit('quit-game')
        });
      }
    }
    
    // Register when scene loads
    document.querySelector('a-scene').addEventListener('loaded', () => {
      MenuRegistry.register(new GameMenu());
      MenuRegistry.showMenu('game-menu', 
        document.querySelector('#menu-container')
      );
    });
  </script>
</head>
<body>
  <a-scene webxr="requiredFeatures: hand-tracking">
    <a-entity id="menu-container" 
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

## Troubleshooting

### Menu not appearing
- Check container element exists
- Verify menu is registered before showing
- Ensure position is in view (-0.3 to -2m in front)

### Buttons not responding
- Verify hand tracking is enabled
- Check button `enabled` property
- Ensure `pressable` component is added

### Text too small/large
- Adjust `fontSize` and `scale` properties
- Use AR-appropriate sizes (2-3cm)
- Test at actual viewing distance

### Performance issues
- Limit buttons per menu (5-10)
- Reuse menus instead of recreating
- Use simple colors, avoid gradients
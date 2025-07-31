/**
 * Scene State System
 * 
 * Provides centralized state management for A-Frame applications.
 * Uses path-based state updates with event notifications.
 * 
 * @module aframe-webxr-ui-toolkit/components/scene-state
 * @example
 * // Set state
 * sceneEl.systems['scene-state'].updateState('player.score', 100);
 * 
 * // Get state
 * const score = sceneEl.systems['scene-state'].getState('player.score');
 * 
 * // Listen for changes
 * sceneEl.addEventListener('state-changed', (e) => {
 *   if (e.detail.path === 'player.score') {
 *     console.log('New score:', e.detail.value);
 *   }
 * });
 */

AFRAME.registerSystem('scene-state', {
  schema: {
    debug: { default: false }
  },
  
  init: function() {
    // Initialize state object
    this.state = {};
    
    // State change listeners by path
    this.listeners = new Map();
    
    // History for undo/redo (optional feature)
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
    
    if (this.data.debug) {
      console.log('Scene State System: Initialized');
    }
  },
  
  /**
   * Get state value by path
   * @param {string} path - Dot-notation path (e.g., 'player.inventory.items')
   * @returns {*} State value or undefined
   */
  getState: function(path) {
    if (!path) return this.state;
    
    return path.split('.').reduce((obj, prop) => {
      return obj && obj[prop] !== undefined ? obj[prop] : undefined;
    }, this.state);
  },
  
  /**
   * Update state value by path
   * @param {string} path - Dot-notation path
   * @param {*} value - New value
   * @param {Object} options - Update options
   */
  updateState: function(path, value, options = {}) {
    if (!path) return;
    
    const oldValue = this.getState(path);
    
    // Skip if value hasn't changed (unless forced)
    if (!options.force && oldValue === value) return;
    
    // Navigate to the parent object
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((obj, prop) => {
      if (!(prop in obj)) obj[prop] = {};
      return obj[prop];
    }, this.state);
    
    // Update the value
    target[last] = value;
    
    // Add to history if not silent
    if (!options.silent && this.maxHistory > 0) {
      this.addToHistory(path, oldValue, value);
    }
    
    // Emit state change event
    this.el.emit('state-changed', {
      path: path,
      value: value,
      oldValue: oldValue,
      source: options.source || 'unknown'
    });
    
    // Call path-specific listeners
    if (this.listeners.has(path)) {
      this.listeners.get(path).forEach(callback => {
        callback(value, oldValue, path);
      });
    }
    
    if (this.data.debug) {
      console.log(`Scene State: Updated ${path}`, { from: oldValue, to: value });
    }
  },
  
  /**
   * Batch update multiple state values
   * @param {Object} updates - Object with path:value pairs
   * @param {Object} options - Update options
   */
  batchUpdate: function(updates, options = {}) {
    Object.entries(updates).forEach(([path, value]) => {
      this.updateState(path, value, { ...options, silent: true });
    });
    
    // Emit single batch event
    this.el.emit('state-batch-changed', {
      updates: updates,
      source: options.source || 'unknown'
    });
  },
  
  /**
   * Delete state value by path
   * @param {string} path - Dot-notation path
   */
  deleteState: function(path) {
    if (!path) return;
    
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((obj, prop) => {
      return obj && obj[prop];
    }, this.state);
    
    if (target && last in target) {
      const oldValue = target[last];
      delete target[last];
      
      this.el.emit('state-changed', {
        path: path,
        value: undefined,
        oldValue: oldValue,
        deleted: true
      });
    }
  },
  
  /**
   * Subscribe to state changes for a specific path
   * @param {string} path - Path to watch
   * @param {Function} callback - Called when path value changes
   * @returns {Function} Unsubscribe function
   */
  subscribe: function(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    
    this.listeners.get(path).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(path);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  },
  
  /**
   * Reset state to initial values
   * @param {Object} initialState - Optional initial state
   */
  reset: function(initialState = {}) {
    this.state = initialState;
    this.history = [];
    this.historyIndex = -1;
    
    this.el.emit('state-reset', {
      state: this.state
    });
  },
  
  /**
   * Add state change to history
   * @private
   */
  addToHistory: function(path, oldValue, newValue) {
    // Remove any history after current index
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add new history entry
    this.history.push({
      path: path,
      oldValue: oldValue,
      newValue: newValue,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  },
  
  /**
   * Undo last state change
   */
  undo: function() {
    if (this.historyIndex >= 0) {
      const entry = this.history[this.historyIndex];
      this.updateState(entry.path, entry.oldValue, { silent: true, source: 'undo' });
      this.historyIndex--;
    }
  },
  
  /**
   * Redo previously undone state change
   */
  redo: function() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const entry = this.history[this.historyIndex];
      this.updateState(entry.path, entry.newValue, { silent: true, source: 'redo' });
    }
  },
  
  /**
   * Get full state object (use sparingly)
   * @returns {Object} Complete state
   */
  getFullState: function() {
    return JSON.parse(JSON.stringify(this.state));
  },
  
  /**
   * Load state from object
   * @param {Object} state - State to load
   */
  loadState: function(state) {
    this.state = JSON.parse(JSON.stringify(state));
    this.el.emit('state-loaded', { state: this.state });
  }
});
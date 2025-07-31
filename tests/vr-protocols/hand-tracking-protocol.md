# Hand Tracking Testing Protocol

## Overview
This protocol defines manual testing procedures for hand tracking interactions with the A-Frame WebXR UI Toolkit components. These tests must be performed on actual VR devices with hand tracking support.

## Test Environment Setup

### Required Equipment
- Meta Quest 2/3 or Pico 4 with hand tracking enabled
- Well-lit room (hand tracking requires good lighting)
- Test scene URL accessible from headset

### Pre-Test Checklist
- [ ] Enable hand tracking in device settings
- [ ] Disable hand tracking auto-switch if testing controller fallback
- [ ] Clear browser cache
- [ ] Ensure latest browser version

## Test Scenarios

### 1. Button Press Detection

**Test ID**: HT-001  
**Component**: `button` + `pressable`  
**Priority**: Critical

**Setup**:
```html
<a-entity 
  button="label: Test Button; width: 0.2; height: 0.08"
  position="0 1.5 -1.5">
</a-entity>
```

**Test Steps**:
1. Point index finger at button from 30cm away
2. Slowly move finger toward button
3. Observe hover state activation at ~2cm
4. Continue moving until press state activates at ~0.5cm
5. Pull finger back slowly
6. Verify press state deactivates before hover state

**Expected Results**:
- Hover state: Button changes to hover color at 2cm (±0.5cm)
- Press state: Button changes to press color at 0.5cm (±0.2cm)
- Clean state transitions without flickering
- No false positives from other fingers

**Pass Criteria**:
- [ ] Hover activates at correct distance
- [ ] Press activates at correct distance
- [ ] State transitions are smooth
- [ ] Events fire in correct order

### 2. Multi-Button Navigation

**Test ID**: HT-002  
**Component**: Menu system  
**Priority**: High

**Setup**:
```javascript
// Menu with 3 buttons vertically arranged
```

**Test Steps**:
1. Start with hand at rest position
2. Move hand to hover over top button
3. Press top button
4. Move directly to middle button (no rest)
5. Press middle button
6. Move to bottom button with sweeping motion
7. Press bottom button

**Expected Results**:
- Each button responds independently
- No "sticky" hover states
- Smooth transitions between buttons
- No accidental activations during movement

**Pass Criteria**:
- [ ] Can navigate between buttons smoothly
- [ ] No false activations
- [ ] Previous button states clear properly
- [ ] Response time < 100ms

### 3. Two-Hand Interaction

**Test ID**: HT-003  
**Component**: `pressable` multi-hand support  
**Priority**: High

**Test Steps**:
1. Present both hands to tracking system
2. Approach same button with both index fingers
3. Press with right hand while left hovers
4. Switch - press with left while right hovers
5. Press with both simultaneously
6. Cross hands and repeat

**Expected Results**:
- Closest hand takes priority
- No conflicts between hands
- Smooth handoff between hands
- Both hands can interact with different buttons

**Pass Criteria**:
- [ ] Closest hand detection works correctly
- [ ] No interaction conflicts
- [ ] Can use both hands on different buttons
- [ ] Hand tracking doesn't lose tracking during crossover

### 4. Edge Case Testing

**Test ID**: HT-004  
**Component**: All hand tracking components  
**Priority**: Medium

**Test Cases**:

**A. Rapid Motion**
- Wave hand quickly past button
- Expected: No false activations

**B. Oblique Angles**
- Approach button from 45° angle
- Expected: Detection works at any approach angle

**C. Tracking Loss Recovery**
- Cover hand momentarily during interaction
- Expected: Graceful recovery, no stuck states

**D. Distance Limits**
- Test interaction at maximum arm extension
- Expected: Works within normal reach envelope

### 5. Performance Testing

**Test ID**: HT-005  
**Component**: System performance  
**Priority**: High

**Setup**: Scene with 20 interactive buttons

**Measurements**:
- [ ] Frame rate maintains 72fps (Quest 2) or 90fps (Quest 3)
- [ ] No visible lag in hover/press feedback
- [ ] Hand tracking remains stable
- [ ] No memory leaks over 10-minute session

## Recording Test Results

### Test Report Template
```
Date: ____________________
Tester: __________________
Device: __________________
Browser: _________________
Toolkit Version: _________

Test Results:
- HT-001: [PASS/FAIL] Notes: ________________
- HT-002: [PASS/FAIL] Notes: ________________
- HT-003: [PASS/FAIL] Notes: ________________
- HT-004: [PASS/FAIL] Notes: ________________
- HT-005: [PASS/FAIL] Notes: ________________

Issues Found:
1. _________________________________________
2. _________________________________________

Recommendations:
_________________________________________
```

### Video Recording Guidelines
- Record POV footage when possible
- Include hand position in frame
- Note timestamp of any issues
- Save videos with test ID in filename

## Debug Helpers

Add these to your test scene for better visibility:

```javascript
// Visual distance indicator
<a-text 
  id="distance-debug"
  position="0 2 -1.5"
  value="Distance: --">
</a-text>

// Hand position spheres
<a-sphere 
  id="hand-debug-left" 
  radius="0.01" 
  color="red">
</a-sphere>
```

## Common Issues and Solutions

### Issue: Inconsistent press detection
**Solution**: Check lighting conditions, clean camera lenses

### Issue: Hover state flickers
**Solution**: Increase hover distance threshold, add hysteresis

### Issue: Wrong hand priority
**Solution**: Verify both hands are tracked, check distance calculation

## Automated Test Helpers

While these tests require manual execution, use these helpers to log data:

```javascript
// Log interaction events with timestamps
window.testLogger = {
  events: [],
  log(event) {
    this.events.push({
      time: performance.now(),
      type: event.type,
      target: event.target.id,
      detail: event.detail
    });
  },
  export() {
    return JSON.stringify(this.events, null, 2);
  }
};
```

## Sign-off Checklist

Before approving a release:
- [ ] All priority "Critical" tests pass
- [ ] All priority "High" tests pass  
- [ ] No regression from previous version
- [ ] Performance metrics meet targets
- [ ] Tested on at least 2 different devices
- [ ] Test results documented and archived
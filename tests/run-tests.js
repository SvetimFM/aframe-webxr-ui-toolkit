#!/usr/bin/env node

/**
 * Test Runner for A-Frame WebXR UI Toolkit
 * Runs automated tests and provides instructions for VR tests
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runAutomatedTests() {
  log('\n🤖 Running Automated Tests...', colors.bright);
  
  return new Promise((resolve, reject) => {
    const vitest = spawn('npm', ['run', 'test'], {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });
    
    vitest.on('close', (code) => {
      if (code === 0) {
        log('✅ Automated tests passed!', colors.green);
        resolve();
      } else {
        log('❌ Automated tests failed!', colors.red);
        reject(new Error(`Tests exited with code ${code}`));
      }
    });
  });
}

async function runCoverage() {
  log('\n📊 Generating Coverage Report...', colors.bright);
  
  return new Promise((resolve, reject) => {
    const coverage = spawn('npm', ['run', 'test:coverage'], {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });
    
    coverage.on('close', (code) => {
      if (code === 0) {
        log('✅ Coverage report generated!', colors.green);
        resolve();
      } else {
        log('⚠️  Coverage generation failed', colors.yellow);
        resolve(); // Don't fail the whole process
      }
    });
  });
}

function displayVRTestInstructions() {
  log('\n🥽 VR Testing Required', colors.bright);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  
  log('\nAutomated tests can only verify logic and calculations.');
  log('To ensure hand tracking interactions work correctly, please run VR tests:\n');
  
  log('1. Start the test harness:', colors.yellow);
  log('   npm run dev');
  log('   Open: http://localhost:3000/tests/vr-protocols/test-harness.html\n');
  
  log('2. Put on your VR headset (Quest 2/3, Pico 4, etc.)');
  log('3. Navigate to the test URL in the headset browser');
  log('4. Follow the test protocol:\n');
  
  const protocols = [
    'HT-001: Button Press Detection',
    'HT-002: Multi-Button Navigation', 
    'HT-003: Two-Hand Interaction',
    'HT-004: Edge Case Testing',
    'HT-005: Performance Testing'
  ];
  
  protocols.forEach(p => log(`   ✓ ${p}`));
  
  log('\n5. Export test results from the browser console');
  log('6. Review the full protocol at:', colors.yellow);
  log('   tests/vr-protocols/hand-tracking-protocol.md\n');
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
}

async function checkTestResults() {
  try {
    // In a real implementation, this would check for saved VR test results
    const vrTestsPath = join(__dirname, 'vr-test-results.json');
    // const results = await readFile(vrTestsPath, 'utf8');
    // return JSON.parse(results);
    
    return null; // No saved results yet
  } catch {
    return null;
  }
}

async function main() {
  log('🚀 A-Frame WebXR UI Toolkit Test Suite', colors.bright);
  log('=====================================\n', colors.bright);
  
  try {
    // Run automated tests
    await runAutomatedTests();
    
    // Generate coverage
    await runCoverage();
    
    // Check for VR test results
    const vrResults = await checkTestResults();
    
    if (vrResults) {
      log('\n✅ Found VR test results from ' + new Date(vrResults.timestamp).toLocaleDateString(), colors.green);
      log(`   Device: ${vrResults.device}`);
      log(`   Duration: ${Math.round(vrResults.duration / 1000)}s`);
      log(`   Tests passed: ${vrResults.passed}/${vrResults.total}`);
    } else {
      log('\n⚠️  No VR test results found', colors.yellow);
      displayVRTestInstructions();
    }
    
    log('\n✨ Test suite complete!', colors.green);
    
    // Summary
    log('\n📋 Summary:', colors.bright);
    log('  • Unit tests: ✅ Passing');
    log('  • Integration tests: ✅ Passing');
    log(`  • VR tests: ${vrResults ? '✅ Completed' : '⏳ Manual testing required'}`);
    log(`  • Coverage: Check coverage/index.html for details\n`);
    
  } catch (error) {
    log('\n❌ Test suite failed!', colors.red);
    log(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { runAutomatedTests, displayVRTestInstructions };
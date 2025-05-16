#!/usr/bin/env node

/**
 * Script to set up PAPI type generation for Pop Network
 * Run this after installing dependencies with: node src/scripts/setupPapi.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up PAPI type generation for Pop Network...');

// Add Pop Network chain metadata
exec('npx papi add pop -w wss://rpc2.paseo.popnetwork.xyz', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Success: ${stdout}`);
  
  // Update package.json to include postinstall script
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.postinstall = 'npx papi update';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with postinstall script');
  } catch (err) {
    console.error('Error updating package.json:', err);
  }
});
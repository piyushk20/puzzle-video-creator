#!/usr/bin/env node

/**
 * HyperFrames Puzzle Video Generator & Batch Renderer
 * 
 * Usage:
 *   node render.js                       # Render default puzzle (pizza_area) -> output.mp4
 *   node render.js --puzzle eleven_trick # Render specific puzzle -> renders/eleven_trick.mp4
 *   node render.js --all                 # Batch render all puzzles in puzzles.json -> renders/{puzzle_id}.mp4
 *   node render.js --list                # List all available puzzles
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local WinGet FFmpeg path is injected into environment if not present
const wingetPath = 'C:\\Users\\HP\\AppData\\Local\\Microsoft\\WinGet\\Links';
if (fs.existsSync(wingetPath) && !process.env.PATH.includes(wingetPath)) {
  process.env.PATH = `${wingetPath};${process.env.PATH}`;
}

const puzzlesFile = path.join(__dirname, 'puzzles.json');
const rendersDir = path.join(__dirname, 'renders');
if (!fs.existsSync(rendersDir)) {
  fs.mkdirSync(rendersDir, { recursive: true });
}

const puzzlesData = JSON.parse(fs.readFileSync(puzzlesFile, 'utf-8'));
const puzzles = puzzlesData.rows;

const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('\nAvailable Puzzles:');
  puzzles.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.puzzle_id}] - ${p.hook_title}`);
  });
  console.log('\nRender any puzzle with: node render.js --puzzle <puzzle_id>\n');
  process.exit(0);
}

if (args.includes('--all')) {
  console.log(`\n🎬 Starting Batch Render of ${puzzles.length} Math Puzzle Videos...`);
  const cmd = 'npx';
  const renderArgs = [
    'hyperframes',
    'render',
    '--batch',
    'puzzles.json',
    '--output',
    'renders/{puzzle_id}.mp4'
  ];

  console.log(`Executing: ${cmd} ${renderArgs.join(' ')}\n`);
  const res = spawnSync(cmd, renderArgs, { stdio: 'inherit', shell: true });
  if (res.status === 0) {
    console.log('\n✅ All puzzle videos successfully rendered into ./renders/\n');
  } else {
    console.error(`\n❌ Batch render failed with exit code ${res.status}`);
  }
  process.exit(res.status || 0);
}

// Single puzzle render
const puzzleFlagIdx = args.indexOf('--puzzle');
const targetId = puzzleFlagIdx !== -1 && args[puzzleFlagIdx + 1] 
  ? args[puzzleFlagIdx + 1] 
  : 'pizza_area';

const selectedPuzzle = puzzles.find(p => p.puzzle_id === targetId);

if (!selectedPuzzle) {
  console.error(`❌ Puzzle "${targetId}" not found in puzzles.json.`);
  console.log('Run "node render.js --list" to view available puzzles.');
  process.exit(1);
}

const tempVarFile = path.join(__dirname, '.current-vars.json');
fs.writeFileSync(tempVarFile, JSON.stringify(selectedPuzzle, null, 2));

const outputFile = path.join(__dirname, 'renders', `${targetId}.mp4`);
console.log(`\n🎬 Rendering puzzle: "${selectedPuzzle.hook_title}"`);
console.log(`Target Output: ${outputFile}\n`);

const cmd = 'npx';
const renderArgs = [
  'hyperframes',
  'render',
  '--variables-file',
  tempVarFile,
  '--output',
  outputFile
];

const res = spawnSync(cmd, renderArgs, { stdio: 'inherit', shell: true });

// Clean up temporary variables file
if (fs.existsSync(tempVarFile)) {
  fs.unlinkSync(tempVarFile);
}

if (res.status === 0) {
  console.log(`\n✅ Render complete! Output saved to: ${outputFile}\n`);
} else {
  console.error(`\n❌ Render failed with exit code ${res.status}`);
}
process.exit(res.status || 0);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

/**
 * Write 16-bit PCM WAV (Supports Mono or True Stereo)
 */
function writeWavFile(filepath, samplesLeft, samplesRight = null, sampleRate = 44100) {
  const isStereo = samplesRight !== null;
  const numChannels = isStereo ? 2 : 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = samplesLeft.length;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM samples with soft saturation
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left Channel with soft limiter
    let sl = Math.tanh(samplesLeft[i]);
    let intL = sl < 0 ? sl * 32768 : sl * 32767;
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(intL))), offset);
    offset += 2;

    if (isStereo) {
      let sr = Math.tanh(samplesRight[i]);
      let intR = sr < 0 ? sr * 32768 : sr * 32767;
      buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(intR))), offset);
      offset += 2;
    }
  }

  fs.writeFileSync(filepath, buffer);
  console.log(`Generated WAV: ${path.basename(filepath)} (${(numSamples / sampleRate).toFixed(2)}s, ${numChannels}ch)`);
}

/**
 * High-fidelity Marimba / Mallet Note Synthesizer
 */
function marimbaTone(freq, tLocal) {
  if (tLocal < 0 || tLocal > 1.8) return 0;
  // Natural wooden bar harmonics (fundamental + 3.98x octave + 9.2x overtone)
  const env1 = Math.exp(-tLocal * 7.5);
  const env2 = Math.exp(-tLocal * 18.0);
  const env3 = Math.exp(-tLocal * 35.0);
  
  return (
    Math.sin(2 * Math.PI * freq * tLocal) * env1 * 0.75 +
    Math.sin(2 * Math.PI * freq * 3.98 * tLocal) * env2 * 0.18 +
    Math.sin(2 * Math.PI * freq * 9.2 * tLocal) * env3 * 0.07
  );
}

/**
 * Warm Acoustic / Electric Bass Note Synthesizer
 */
function bassTone(freq, tLocal) {
  if (tLocal < 0 || tLocal > 1.6) return 0;
  const env = Math.exp(-tLocal * 4.2);
  // Fundamental + warm 2nd harmonic + sub punch
  return (
    Math.sin(2 * Math.PI * freq * tLocal) * env * 0.70 +
    Math.sin(2 * Math.PI * freq * 2 * tLocal) * Math.exp(-tLocal * 8.0) * 0.22 +
    Math.sin(2 * Math.PI * (freq / 2) * tLocal) * Math.exp(-tLocal * 3.0) * 0.15
  );
}

/**
 * Warm Polyphonic Pad Chord Synthesizer
 */
function padChord(freqs, tLocal, duration = 3.0) {
  if (tLocal < 0 || tLocal > duration) return 0;
  // Gentle attack & release
  let env = 1.0;
  const attack = 0.3;
  const release = 0.5;
  if (tLocal < attack) env = tLocal / attack;
  else if (tLocal > duration - release) env = (duration - tLocal) / release;

  let sum = 0;
  freqs.forEach(f => {
    // Gentle detuned unison for chorus width
    sum += Math.sin(2 * Math.PI * f * tLocal) * 0.6;
    sum += Math.sin(2 * Math.PI * (f * 1.003) * tLocal) * 0.4;
  });
  return (sum / freqs.length) * env;
}

// Note frequencies map (A4 = 440)
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
};

/**
 * 1. "Curious Mystery" — Custom Adaptive Score for 37s Video Narrative
 * Scene 1 (0-7s): Curious, inquisitive, light marimba arpeggio
 * Scene 2 (7-14s): Clockwork ticking pulse, building tension
 * Scene 3 (14-24s): Step-by-step playful proof demonstration
 * Scene 4 (24-32s): Triumphant "Aha!" epiphany & rich harmonic chords
 * Scene 5 (32-37s): Upbeat, cheerful outro resolution
 */
function composeCuriousMystery(durationSec = 38.0, sampleRate = 44100) {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const bpm = 120; // 0.5s per beat, 2.0s per measure
  const beatSec = 60 / bpm;

  // Chord progression structure per 2-second measure
  // Chords: Cmaj7, Am7, Fmaj7, Gsus4 -> G7
  const chords = [
    { root: NOTES.C3, notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4] }, // Cmaj7
    { root: NOTES.A3, notes: [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.G5] }, // Am7
    { root: NOTES.F3, notes: [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5] }, // Fmaj7
    { root: NOTES.G3, notes: [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5] }, // G7
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = Math.floor(t / beatSec);
    const measure = Math.floor(currentBeat / 4);
    const chord = chords[measure % chords.length];
    const beatFraction = (t % beatSec) / beatSec;

    let l = 0;
    let r = 0;

    // SCENE 1: 0.0s - 7.0s (Hook & Problem: Inquisitive, Plucked, Curious)
    if (t < 7.0) {
      // Light bouncy marimba
      const step = currentBeat % 4;
      const noteIdx = (step * 2 + (currentBeat % 2)) % chord.notes.length;
      const mNote = chord.notes[noteIdx];
      const mVal = marimbaTone(mNote, t % (beatSec / 2));
      l += mVal * 0.32;
      r += mVal * 0.28;

      // Gentle walking bass on beats 1 and 3
      if (currentBeat % 2 === 0) {
        const bVal = bassTone(chord.root, t % beatSec);
        l += bVal * 0.30;
        r += bVal * 0.30;
      }

      // Soft shaker on every 8th note
      const eighth = (t % (beatSec / 2)) / (beatSec / 2);
      if (eighth < 0.12) {
        const shk = (Math.random() * 2 - 1) * Math.exp(-eighth * 25.0);
        l += shk * 0.04;
        r += shk * 0.07;
      }
    }

    // SCENE 2: 7.0s - 14.0s (5-to-1 Countdown: Ticking Tension, Clockwork Pulse)
    else if (t >= 7.0 && t < 14.0) {
      const localT = t - 7.0;
      // Faster rhythmic 16th-note clockwork ticking
      const sixteenth = (t % (beatSec / 4)) / (beatSec / 4);
      if (sixteenth < 0.1) {
        const tickVal = Math.sin(2 * Math.PI * 1800 * (t % 0.05)) * Math.exp(-sixteenth * 30.0);
        l += tickVal * 0.06;
        r += tickVal * 0.09;
      }

      // Syncopated tension bassline with rising filter intensity
      const bassStep = currentBeat % 4;
      const tensionRoots = [NOTES.D3, NOTES.E3, NOTES.F3, NOTES.G3];
      const tRoot = tensionRoots[Math.min(3, Math.floor(localT / 1.75))];
      if (bassStep === 0 || bassStep === 2.5 || bassStep === 3) {
        const bVal = bassTone(tRoot, t % (beatSec * 0.75));
        l += bVal * 0.34;
        r += bVal * 0.34;
      }

      // Rising staccato notes building anticipation
      if (currentBeat % 2 === 1) {
        const risingNotes = [NOTES.A4, NOTES.B4, NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5];
        const rIdx = Math.min(risingNotes.length - 1, Math.floor(localT / 1.1));
        const stacc = marimbaTone(risingNotes[rIdx], t % beatSec);
        l += stacc * 0.22;
        r += stacc * 0.25;
      }
    }

    // SCENE 3: 14.0s - 24.0s (Step-by-Step Proof: Playful Demonstration)
    else if (t >= 14.0 && t < 24.0) {
      const localT = t - 14.0;
      // Upbeat melodic bounce
      const step = currentBeat % 8;
      const melodyNotes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6, NOTES.B5, NOTES.G5, NOTES.A5, NOTES.E5];
      const mVal = marimbaTone(melodyNotes[step], t % (beatSec / 2));
      l += mVal * 0.35;
      r += mVal * 0.30;

      // Solid supportive bass groove
      if (currentBeat % 2 === 0) {
        const bVal = bassTone(chord.root, t % beatSec);
        l += bVal * 0.32;
        r += bVal * 0.32;
      }

      // Shaker + snap on backbeats
      if (currentBeat % 2 === 1 && beatFraction < 0.2) {
        const snap = (Math.random() * 2 - 1) * Math.exp(-beatFraction * 20.0);
        l += snap * 0.08;
        r += snap * 0.08;
      }
    }

    // SCENE 4: 24.0s - 32.0s (The Math Rule & Calculation: "Aha!" Epiphany & Rich Chords)
    else if (t >= 24.0 && t < 32.0) {
      const localT = t - 24.0;
      // Lush pad chord underpinning the epiphany
      const padVal = padChord(chord.notes, t % 2.0, 2.0);
      l += padVal * 0.28;
      r += padVal * 0.28;

      // Bell arpeggios sparkling over the rule banner
      const arpStep = Math.floor((t % 1.0) * 4);
      const arpNotes = [NOTES.C5, NOTES.G5, NOTES.C6, NOTES.E6];
      const bNote = arpNotes[arpStep];
      const bVal = marimbaTone(bNote, (t % 0.25));
      l += bVal * 0.20;
      r += bVal * 0.25;

      // Grounding warm bass
      const bassVal = bassTone(chord.root, t % beatSec);
      l += bassVal * 0.30;
      r += bassVal * 0.30;
    }

    // SCENE 5: 32.0s - 37.0s (Outro & Social CTA: Upbeat, Celebratory Payoff)
    else {
      // Celebratory upbeat fanfare cadence
      const step = currentBeat % 4;
      const outroNotes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];
      const mVal = marimbaTone(outroNotes[step], t % (beatSec / 2));
      l += mVal * 0.32;
      r += mVal * 0.36;

      if (currentBeat % 2 === 0) {
        const bVal = bassTone(NOTES.C3, t % beatSec);
        l += bVal * 0.34;
        r += bVal * 0.34;
      }
    }

    // Master Envelope: Clean fade-in (0.3s) and gentle fade-out at end (35.8s - 37.5s)
    let master = 1.0;
    if (t < 0.3) master = t / 0.3;
    else if (t > 36.0) master = Math.max(0, (37.5 - t) / 1.5);

    left[i] = l * master;
    right[i] = r * master;
  }

  writeWavFile(path.join(assetsDir, 'curious_mystery.wav'), left, right, sampleRate);
}

/**
 * 2. "Clockwork Tension" — Mechanical, Suspenseful & Paced for Tricky Paradoxes
 */
function composeClockworkTension(durationSec = 38.0, sampleRate = 44100) {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const bpm = 126;
  const beatSec = 60 / bpm;
  const rootFreqs = [NOTES.D3, NOTES.F3, NOTES.G3, NOTES.A3];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = Math.floor(t / beatSec);
    const measure = Math.floor(currentBeat / 4);
    const root = rootFreqs[measure % rootFreqs.length];

    let l = 0;
    let r = 0;

    // Clockwork double-tick rhythm
    const tickTime = (t % (beatSec / 2)) / (beatSec / 2);
    if (tickTime < 0.08) {
      const click = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-tickTime * 45.0);
      l += click * 0.05;
      r += click * 0.09;
    }

    // Pumping synth-bass pulse
    const subFrac = (t % (beatSec / 2)) / (beatSec / 2);
    const bVal = bassTone(root, subFrac * (beatSec / 2));
    l += bVal * 0.35;
    r += bVal * 0.35;

    // Ascending inquisitive plucks
    const pStep = currentBeat % 8;
    const pNotes = [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5, NOTES.C5, NOTES.A4, NOTES.G4, NOTES.F4];
    const pVal = marimbaTone(pNotes[pStep], t % (beatSec / 2));
    l += pVal * 0.28;
    r += pVal * 0.24;

    // Climax sweep during solution & rule (14s to 32s)
    if (t >= 14.0 && t < 32.0) {
      const padVal = padChord([NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5], t % 2.0, 2.0);
      l += padVal * 0.24;
      r += padVal * 0.24;
    }

    let master = 1.0;
    if (t < 0.3) master = t / 0.3;
    else if (t > 36.0) master = Math.max(0, (37.5 - t) / 1.5);

    left[i] = l * master;
    right[i] = r * master;
  }

  writeWavFile(path.join(assetsDir, 'clockwork_tension.wav'), left, right, sampleRate);
}

/**
 * 3. "Playful Discovery" — Upbeat, Joyful & Sparkly for Educational Fun
 */
function composePlayfulDiscovery(durationSec = 38.0, sampleRate = 44100) {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const bpm = 118;
  const beatSec = 60 / bpm;
  const majorChords = [
    { root: NOTES.G3, notes: [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5] }, // G
    { root: NOTES.C3, notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5] }, // C
    { root: NOTES.E3, notes: [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5] }, // Em
    { root: NOTES.D3, notes: [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5] }, // D
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = Math.floor(t / beatSec);
    const measure = Math.floor(currentBeat / 4);
    const chord = majorChords[measure % majorChords.length];

    let l = 0;
    let r = 0;

    // Cheerful glockenspiel bell bounce
    const bellStep = currentBeat % 4;
    const bellNote = chord.notes[bellStep];
    const bVal = marimbaTone(bellNote, t % (beatSec / 2));
    l += bVal * 0.32;
    r += bVal * 0.36;

    // Bouncy acoustic walking bass
    if (currentBeat % 2 === 0) {
      const bBass = bassTone(chord.root, t % beatSec);
      l += bBass * 0.30;
      r += bBass * 0.30;
    }

    // Sunny clapping backbeat
    if (currentBeat % 2 === 1 && (t % beatSec) < 0.15) {
      const clap = (Math.random() * 2 - 1) * Math.exp(-((t % beatSec) * 22.0));
      l += clap * 0.08;
      r += clap * 0.08;
    }

    // Shimmering celestial warmth in Scenes 3 & 4
    if (t >= 14.0 && t < 32.0) {
      const pad = padChord(chord.notes, t % 2.0, 2.0);
      l += pad * 0.22;
      r += pad * 0.22;
    }

    let master = 1.0;
    if (t < 0.3) master = t / 0.3;
    else if (t > 36.0) master = Math.max(0, (37.5 - t) / 1.5);

    left[i] = l * master;
    right[i] = r * master;
  }

  writeWavFile(path.join(assetsDir, 'playful_discovery.wav'), left, right, sampleRate);
}

/**
 * Bubble Pop SFX (0.12s)
 */
function createPop(sampleRate = 44100) {
  const durationSec = 0.12;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    const freq = 420 + Math.pow(progress, 0.5) * 520;
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 6.0);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.70;
  }

  writeWavFile(path.join(assetsDir, 'pop.wav'), samples, null, sampleRate);
}

/**
 * Celestial "Aha!" Chime SFX (1.8s)
 */
function createChime(sampleRate = 44100) {
  const durationSec = 1.8;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const samples = new Float32Array(totalSamples);
  const freqs = [1046.50, 1318.51, 1567.98, 2093.00];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let val = 0;

    freqs.forEach((f, idx) => {
      const delay = idx * 0.055;
      if (t > delay) {
        const localT = t - delay;
        const env = Math.exp(-localT * (2.0 + idx * 0.45));
        val += Math.sin(2 * Math.PI * f * localT) * env * 0.24;
        val += Math.sin(2 * Math.PI * (f * 2.76) * localT) * env * 0.06;
      }
    });

    samples[i] = val;
  }

  writeWavFile(path.join(assetsDir, 'chime.wav'), samples, null, sampleRate);
}

/**
 * Wooden Countdown Tick SFX (0.09s)
 */
function createTick(sampleRate = 44100) {
  const durationSec = 0.09;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    const freq = 1050 * Math.exp(-progress * 20.0);
    const env = Math.exp(-progress * 30.0);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.90;
  }

  writeWavFile(path.join(assetsDir, 'tick.wav'), samples, null, sampleRate);
}

console.log('Generating matching background scores & SFX for 37s video...');
composeCuriousMystery(38.0);
composeClockworkTension(38.0);
composePlayfulDiscovery(38.0);
createPop();
createChime();
createTick();

// Encode all generated scores to high quality normalized MP3s via ffmpeg (-14 LUFS standard)
const scores = ['curious_mystery', 'clockwork_tension', 'playful_discovery'];

scores.forEach(name => {
  const wavPath = path.join(assetsDir, `${name}.wav`);
  const mp3Path = path.join(assetsDir, `${name}.mp3`);
  if (fs.existsSync(wavPath)) {
    console.log(`Encoding & normalizing ${name}.wav -> ${name}.mp3...`);
    spawnSync('ffmpeg', ['-y', '-i', wavPath, '-af', 'loudnorm=I=-14:LRA=7:TP=-1.0', '-b:a', '192k', mp3Path], { stdio: 'inherit', shell: true });
  }
});

// Also create puzzle_bgm.mp3 as default alias to curious_mystery.mp3 for backward compatibility
const defWav = path.join(assetsDir, 'curious_mystery.wav');
const defMp3 = path.join(assetsDir, 'puzzle_bgm.mp3');
if (fs.existsSync(defWav)) {
  console.log('Encoding & normalizing puzzle_bgm.mp3 from curious_mystery.wav...');
  spawnSync('ffmpeg', ['-y', '-i', defWav, '-af', 'loudnorm=I=-14:LRA=7:TP=-1.0', '-b:a', '192k', defMp3], { stdio: 'inherit', shell: true });
}

console.log('Done generating and normalizing all matching background scores and audio assets.');

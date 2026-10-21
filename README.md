# 🧩 PuzzleFrame Studio — AI Math Shorts Production Suite

> **Autonomous Faceless Math Reels & Viral Shorts Generator**  
> Produces high-retention 9:16 vertical short-form math puzzles (1080×1920 MP4) with dynamic pacing, synchronized BGM, and instant YouTube/Instagram social media metadata tabs.

---

## 🌟 Key Features

1. **Curated & Dynamic Math Paradox Vault**:
   - 18+ built-in viral math puzzles across Geometry, Arithmetic, Probability, Logic, and Real-World Fallacies (Pizza Area Paradox, Discount Trap, Handshake Problem, Birthday Paradox, 11x Trick, Gauss Sum, etc.).
   - AI Idea Lab for generating fresh paradoxes and riddles on the fly.

2. **Studio Web Interface (`http://localhost:8095`)**:
   - **Template Browser**: Filter by category, difficulty, or surprise pick.
   - **Real-Time Interactive Phone Stage**: Live preview in realistic 9:16 mobile mockup.
   - **Audio Studio Preview**: Synchronized background music and sound effects (Ticking, Tension, Chimes, Pops).
   - **Variable Customizer**: Adjust question hooks, kid-friendly explanations, formula proofs, and social handles (`@Bloxxerman1`, `@Mysteryuntoldd`).

3. **Background MP4 Render Pipeline**:
   - High-throughput headless browser rendering powered by HyperFrames engine.
   - Automated FFmpeg audio multiplexing (AAC stereo + BGM + SFX).
   - Live rendering HUD with elapsed timer and real-time phase logs.

4. **Integrated Social Media & Hashtag Generator**:
   - Every output video comes with a **Social Media Caption & Tags** tab.
   - **🎯 Short Crisp Title**: Punchy, high-CTR hook with 1-click copy.
   - **📝 2-3 Line Description**: Educational breakdown incorporating linked social handles.
   - **🔥 Trending Hashtags**: Curated viral tags (#MathShorts, #ViralMath, etc.).
   - **⚡ Copy Complete Post**: Master button to copy Title + Description + Hashtags in 1 click.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- FFmpeg (accessible in system PATH)

### Installation
```bash
git clone https://github.com/piyushk20/puzzle-video-creator.git
cd puzzle-video-creator
npm install
```

### Launch Studio
```bash
npm start
```
Open **`http://localhost:8095`** in your browser.

---

## 🎬 CLI Rendering Commands

Render directly via command line without the web UI:

```bash
# Render a specific puzzle
npm run render:pizza

# Render 11x multiplication trick
npm run render:eleven

# Render 50% + 50% discount trap
npm run render:discount

# Render all registered puzzles in batch
npm run render:all

# List all available puzzles
npm run list
```

---

## 📂 Project Architecture

```
puzzle-video/
├── assets/                  # BGM tracks, ticking SFX, victory chimes
├── public/                  # Studio Web UI
│   ├── index.html           # Modern glassmorphism studio layout
│   ├── studio.css           # Styling, phone mockup, animations
│   └── studio.js            # Studio interactivity, preview, render polling
├── index.html               # Master HyperFrames 9:16 composition
├── server.js                # Express & HyperFrames render server
├── render.js                # CLI batch render runner
├── generate-audio.js        # Synthetic sound effect generator
├── puzzles.json             # Core puzzle metadata & variables
└── package.json
```

---

## 📱 Social Handles Integrated
- **YouTube**: [@Bloxxerman1](https://www.youtube.com/@Bloxxerman1)
- **Instagram**: [@Mysteryuntoldd](https://www.instagram.com/Mysteryuntoldd)

---

## 📄 License
MIT License

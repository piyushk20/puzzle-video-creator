// PuzzleFrame Studio Frontend Logic

let allPuzzles = [];
let currentPuzzles = [];
let selectedPuzzle = null;
let activeCategory = 'all';
let pollInterval = null;
let renderStartTime = null;

// DOM Elements
const puzzlesGrid = document.getElementById('puzzles-grid');
const categoryFilters = document.getElementById('category-filters');
const btnRollFresh = document.getElementById('btn-roll-fresh');
const btnRollFreshTop = document.getElementById('btn-roll-fresh-top');
const btnInitiateRender = document.getElementById('btn-initiate-render');
const summaryPuzzleTitle = document.getElementById('summary-puzzle-title');

// Customizer Elements
const customizerToggle = document.getElementById('customizer-toggle');
const customizerBody = document.getElementById('customizer-body');
const customizerArrow = document.getElementById('customizer-arrow');
const custHookTitle = document.getElementById('cust-hook-title');
const custHandwrittenHook = document.getElementById('cust-handwritten-hook');
const custCountdownHeading = document.getElementById('cust-countdown-heading');
const custKidHeading = document.getElementById('cust-kid-heading');
const custKidText = document.getElementById('cust-kid-text');
const custYoutubeHandle = document.getElementById('cust-youtube-handle');
const custInstagramHandle = document.getElementById('cust-instagram-handle');
const custChannelHandle = document.getElementById('cust-channel-handle');
const custTestQuestion = document.getElementById('cust-test-question');
const custProofCountText = document.getElementById('cust-proof-count-text');
const custFormulaTitle = document.getElementById('cust-formula-title');
const custRuleTitle = document.getElementById('cust-rule-title');
const custAhaTitle = document.getElementById('cust-aha-title');
const custAhaEmoji = document.getElementById('cust-aha-emoji');
const custBgmTheme = document.getElementById('cust-bgm-theme');

// Stage Elements
const screenPreview = document.getElementById('screen-preview');
const screenHud = document.getElementById('screen-hud');
const screenPlayer = document.getElementById('screen-player');
const previewIframe = document.getElementById('preview-iframe');

// HUD Elements
const hudPercentage = document.getElementById('hud-percentage');
const hudPhase = document.getElementById('hud-phase');
const hudBar = document.getElementById('hud-bar');
const hudFrames = document.getElementById('hud-frames');
const hudTime = document.getElementById('hud-time');
const hudLog = document.getElementById('hud-log');

// Tab Switcher Elements
const tabBtnTemplates = document.getElementById('tab-btn-templates');
const tabBtnIdeas = document.getElementById('tab-btn-ideas');
const tabBtnHistory = document.getElementById('tab-btn-history');
const viewTemplates = document.getElementById('view-templates');
const viewIdeas = document.getElementById('view-ideas');
const viewHistory = document.getElementById('view-history');
const btnGenerateMoreIdeas = document.getElementById('btn-generate-more-ideas');
const btnRefreshHistory = document.getElementById('btn-refresh-history');
const ideasGrid = document.getElementById('ideas-grid');
const historyGrid = document.getElementById('history-grid');
const badgeHistoryCount = document.getElementById('badge-history-count');

// Output Controls
const outputControls = document.getElementById('output-controls');
const btnDownloadMp4 = document.getElementById('btn-download-mp4');
const btnCopyLink = document.getElementById('btn-copy-link');
const btnReplay = document.getElementById('btn-replay');
const finalVideoPlayer = document.getElementById('final-video-player');
const successMetrics = document.getElementById('success-metrics');
const stageSocialTab = document.getElementById('stage-social-tab');

// Social Media Metadata Vault for YouTube Shorts, Instagram Reels & TikTok
const SOCIAL_METADATA_VAULT = {
  pizza_area: {
    crisp_title: "Why Two 8-Inch Pizzas NEVER Equal One 16-Inch! 🍕🤯",
    description_lines: [
      "Think getting two medium pizzas gives you the same food as one large? Math proves you lose half!",
      "Because circle area grows with radius squared (πr²), 1 large 16\" pizza actually has the food of 4 small ones.",
      "Never trade one large for two mediums! Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#MathShorts", "#PizzaParadox", "#ViralMath", "#DidYouKnow", "#BrainTeasers", "#FoodMath", "#MysteryUntold", "#Bloxxerman"]
  },
  eleven_trick: {
    crisp_title: "Multiply ANY 2-Digit Number by 11 in 2 Seconds! ⚡🧠",
    description_lines: [
      "Put down your calculator! Just split the two digits and drop their sum right in the middle.",
      "For example, 35 × 11: 3 + 5 = 8, so place 8 between 3 and 5 to get 385 instantly in your head!",
      "Comment your favorite number trick below and subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#MentalMath", "#MathHacks", "#QuickMath", "#StudyHacks", "#NumberTrick", "#MathShorts", "#Bloxxerman", "#MysteryUntold"]
  },
  discount_trap: {
    crisp_title: "Is 50% Off PLUS 50% Off Actually FREE? 🏷️💸",
    description_lines: [
      "Stores love when shoppers fall for this stacking trap! 50% off cuts $100 down to $50.",
      "The second 50% only applies to that remaining $50—meaning you still pay $25! Discounts multiply, not add.",
      "Share this before your next shopping spree and follow @Mysteryuntoldd & subscribe to @Bloxxerman1!"
    ],
    hashtags: ["#MoneyHacks", "#MathFails", "#ShoppingTraps", "#FinancialLiteracy", "#PercentageTrick", "#MathShorts", "#MysteryUntold"]
  },
  percent_stacked: {
    crisp_title: "Is 50% Off PLUS 50% Off Actually FREE? 🏷️💸",
    description_lines: [
      "Stores love when shoppers fall for this stacking trap! 50% off cuts $100 down to $50.",
      "The second 50% only applies to that remaining $50—meaning you still pay $25! Discounts multiply, not add.",
      "Share this before your next shopping spree and follow @Mysteryuntoldd & subscribe to @Bloxxerman1!"
    ],
    hashtags: ["#MoneyHacks", "#MathFails", "#ShoppingTraps", "#FinancialLiteracy", "#PercentageTrick", "#MathShorts", "#MysteryUntold"]
  },
  squares_grid: {
    crisp_title: "How Many Squares on a Chessboard? (Hint: NOT 64!) ♟️🔲",
    description_lines: [
      "Everyone spots the 64 small squares, but what about the 2×2, 3×3, 4×4, and larger squares hidden in plain sight?",
      "Summing 1² + 2² + 3² + ... + 8² reveals there are actually 204 squares on every single chessboard!",
      "Can your friends spot them all? Tag them below and subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#ChessRiddle", "#PuzzleTime", "#BrainTeaser", "#GeometryTricks", "#MindBlown", "#ChessShorts", "#Bloxxerman"]
  },
  birthday_paradox: {
    crisp_title: "The Birthday Paradox: Why 23 People Share a Birthday! 🎂🎈",
    description_lines: [
      "In a room of just 23 people, there's a 50.7% chance that two share the exact same birthday!",
      "It sounds impossible until you realize you are comparing 253 unique pairs of people, not just yourself.",
      "Try this at your next party and see the magic! Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#Probability", "#BirthdayParadox", "#MindBending", "#StatsNerd", "#ScienceShorts", "#FunFacts", "#MysteryUntold"]
  },
  paper_moon: {
    crisp_title: "Fold a Paper 42 Times and Reach the MOON? 🌕📄",
    description_lines: [
      "Exponential growth breaks human intuition! Folding a regular 0.1mm sheet doubles thickness every fold.",
      "By fold 42, the paper reaches over 439,000 km—stretching all the way past the Moon into space!",
      "Never underestimate the power of powers of two. Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#ExponentialGrowth", "#SpaceFacts", "#MindBlown", "#PhysicsFun", "#ScienceShorts", "#ViralMath", "#DidYouKnow"]
  },
  water_lily: {
    crisp_title: "The Lily Pad Riddle 90% of People Get Wrong! 🪷⏱️",
    description_lines: [
      "A water lily doubles in size every single day and completely covers the lake on Day 48.",
      "On what day was the lake half-covered? Intuition screams Day 24, but the true answer is Day 47!",
      "One day before full is always half when things double. Follow @Mysteryuntoldd & subscribe to @Bloxxerman1!"
    ],
    hashtags: ["#RiddleOfTheDay", "#LogicPuzzle", "#QuickThinking", "#BrainWorkout", "#MathRiddle", "#Shorts", "#MysteryUntold"]
  },
  handshake_problem: {
    crisp_title: "How Many Handshakes in a Room of 10 People? 🤝🔢",
    description_lines: [
      "If 10 people meet and shake hands with everyone else once, how many handshakes happen?",
      "Instead of guessing, use the handshake formula: n × (n - 1) ÷ 2 = 10 × 9 ÷ 2 = 45 handshakes!",
      "Master combinatorics in seconds! Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd for daily math!"
    ],
    hashtags: ["#Combinatorics", "#MathPuzzles", "#SocialMath", "#LogicShorts", "#QuickTricks", "#STEMEducation", "#Bloxxerman"]
  },
  bat_and_ball: {
    crisp_title: "The $1.10 Bat & Ball Trap Harvard Students Missed! ⚾💰",
    description_lines: [
      "A bat and ball cost $1.10 in total, and the bat costs $1.00 MORE than the ball. How much is the ball?",
      "Most say 10 cents, but that makes the total $1.20! The ball actually costs just 5 cents ($1.05 + $0.05).",
      "Did your brain fall for the trap? Be honest in the comments! Follow @Mysteryuntoldd & @Bloxxerman1!"
    ],
    hashtags: ["#CognitiveBias", "#BrainTeasers", "#TrickyQuestions", "#MathTraps", "#HarvardRiddle", "#Shorts", "#MysteryUntold"]
  },
  nine_table_trick: {
    crisp_title: "The Hidden Mirror Symmetry of the 9 Times Table! 🪄9️⃣",
    description_lines: [
      "Notice anything wild about multiplying by 9? The tens digits count up (0 to 9) while ones digits count down (9 to 0).",
      "And every single pair of digits always sums to 9! Math isn't memorization; it's spotting beautiful patterns.",
      "Share this with students and subscribe to @Bloxxerman1 & follow @Mysteryuntoldd!"
    ],
    hashtags: ["#MultiplicationHacks", "#NineTable", "#KidsMath", "#StudyShorts", "#MathPatterns", "#TeacherHacks", "#Bloxxerman"]
  },
  clock_angle: {
    crisp_title: "At 3:15, Do the Clock Hands Overlap? (Answer: NO!) ⏰📐",
    description_lines: [
      "You might think the hands are right on top of each other at 3:15, but look closer at your watch!",
      "While the minute hand is at 15m, the hour hand moved a quarter toward 4—creating a 7.5° gap!",
      "Clocks are constantly moving geometry. Test your friends and subscribe to @Bloxxerman1 & @Mysteryuntoldd!"
    ],
    hashtags: ["#ClockParadox", "#GeometryRiddle", "#AngleChallenge", "#VisualMath", "#BrainTeaser", "#STEMFun", "#MysteryUntold"]
  },
  monty_hall: {
    crisp_title: "Should You ALWAYS Switch Doors on Monty Hall? 🚪🚗",
    description_lines: [
      "3 doors, 1 luxury car, 2 goats. You pick a door, the host opens a goat door and asks if you want to switch.",
      "Switching DOUBLES your probability of winning from 33% to 67%! Information changes odds.",
      "Would you have stayed or switched? Comment below and follow @Mysteryuntoldd & subscribe to @Bloxxerman1!"
    ],
    hashtags: ["#MontyHall", "#ProbabilityParadox", "#GameTheory", "#MindBlown", "#StatsRiddle", "#ViralPuzzles", "#Bloxxerman"]
  },
  rope_earth: {
    crisp_title: "Add 1 Meter to Earth's Equator Rope: What Happens? 🌍🧶",
    description_lines: [
      "Tie a rope snugly around the 40,000 km Earth, add just 1 meter to the rope, and lift it evenly.",
      "Can an apple fit under? Surprisingly, it lifts 16 cm (6 inches) off the ground all the way around!",
      "Because Δr = 1 ÷ 2π whether on Earth or a soccer ball! Subscribe to @Bloxxerman1 & @Mysteryuntoldd!"
    ],
    hashtags: ["#EarthRiddle", "#Circumference", "#GeometryFun", "#PhysicsParadox", "#ScienceFacts", "#LearnEveryday", "#MysteryUntold"]
  },
  square_ending_5: {
    crisp_title: "Square ANY Number Ending in 5 in Under 2 Seconds! ⚡🔢",
    description_lines: [
      "Want to calculate 65² instantly? Multiply 6 by (6 + 1 = 7) = 42, then simply tack '25' on the end: 4,225!",
      "Try 85²: 8 × 9 = 72 → 7,225. Now comment 95² without using a calculator!",
      "Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd for daily speed math tricks!"
    ],
    hashtags: ["#SpeedMath", "#MentalCalculation", "#MathTricks", "#ExamHacks", "#GeniusTrick", "#Shorts", "#Bloxxerman"]
  },
  cube_paint: {
    crisp_title: "Paint a 3×3×3 Cube Blue: How Many Have ZERO Paint? 🧊🎨",
    description_lines: [
      "A wooden cube is painted blue on the outside and cut into 27 small cubes.",
      "The 8 corners have 3 blue sides, 12 edges have 2, 6 faces have 1—leaving just 1 unpainted center core!",
      "The general formula is (N - 2)³. Follow @Mysteryuntoldd & subscribe to @Bloxxerman1 for spatial tests!"
    ],
    hashtags: ["#SpatialReasoning", "#3DPuzzle", "#CubeRiddle", "#IQTest", "#GeometryShorts", "#BrainWorkout", "#MysteryUntold"]
  },
  average_speed: {
    crisp_title: "Drive 60 mph There and 20 mph Back: Average Speed? 🚗⏱️",
    description_lines: [
      "Almost everyone guesses 40 mph, but the true average speed is 30 mph!",
      "Because you spend 3× more time driving the slow 20 mph leg, the harmonic mean pulls the average down.",
      "Share with your road trip buddy and follow @Mysteryuntoldd & subscribe to @Bloxxerman1!"
    ],
    hashtags: ["#PhysicsTrap", "#HarmonicMean", "#SpeedMath", "#RoadTripRiddle", "#AverageSpeed", "#MathShorts", "#Bloxxerman"]
  },
  gauss_trick: {
    crisp_title: "How a 7-Year-Old Added 1 to 100 in 5 Seconds! ✨🔢",
    description_lines: [
      "In 1787, young Carl Friedrich Gauss stunned his teacher by pairing numbers: 1 + 100 = 101, 2 + 99 = 101...",
      "With 50 pairs of 101, the answer is 5,050 in 5 seconds flat! Formula: n × (n + 1) ÷ 2.",
      "Work smarter, not harder! Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd for math history!"
    ],
    hashtags: ["#GaussTrick", "#MathHistory", "#MentalMath", "#SmartThinking", "#MathGenius", "#Shorts", "#MysteryUntold"]
  }
};

function getSocialMetadata(puzzleId, puzzle = null) {
  if (puzzle && puzzle.socialMeta) return puzzle.socialMeta;
  if (puzzleId && SOCIAL_METADATA_VAULT[puzzleId]) {
    const meta = SOCIAL_METADATA_VAULT[puzzleId];
    return {
      title: meta.crisp_title,
      description: meta.description_lines.join("\n"),
      hashtags: meta.hashtags.join(" "),
      hashtag_list: meta.hashtags
    };
  }
  const hook = puzzle ? (puzzle.hook_title || puzzle.handwritten_hook || "Can You Spot The Math Trap?") : "Can You Spot The Math Trap?";
  const rule = puzzle ? (puzzle.kid_explainer_heading || puzzle.rule_title || "The Secret Mathematical Rule Revealed!") : "The Secret Mathematical Rule Revealed!";
  const expl = puzzle ? (puzzle.kid_explainer_text || puzzle.rule_body || "Watch step by step as we break down the proof.") : "Watch step by step as we break down the proof.";
  return {
    title: `${hook} 🤯📐`,
    description: `${rule}\n${expl}\n\n🔔 Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd for daily mind-bending puzzles!`,
    hashtags: "#MathShorts #ViralMath #BrainTeaser #STEM #MysteryUntold #Bloxxerman #LearnOnShorts",
    hashtag_list: ["#MathShorts", "#ViralMath", "#BrainTeaser", "#STEM", "#MysteryUntold", "#Bloxxerman"]
  };
}

function showCopyToast(message) {
  const existing = document.querySelector('.social-copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'social-copy-toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${escapeHtml(message)}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function renderSocialTabHTML(meta) {
  const hashtagList = meta.hashtag_list || (meta.hashtags ? meta.hashtags.split(/\s+/).filter(Boolean) : []);
  return `
    <div class="history-social-tab is-open">
      <div class="social-tab-header">
        <div class="social-tab-title-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Social Media Caption & Tags</span>
          <span class="social-tab-pill">Ready to Post</span>
        </div>
        <button class="btn-toggle-social" type="button" title="Expand / Collapse Post Details">
          <span class="toggle-text">Post Metadata</span>
          <span class="toggle-arrow">▼</span>
        </button>
      </div>

      <div class="social-tab-content">
        <!-- Short Crisp Title -->
        <div class="social-meta-block">
          <div class="social-meta-label-row">
            <span class="social-meta-label">🎯 Short Crisp Title</span>
            <button class="btn-copy-snippet btn-copy-title" data-copy="${escapeHtml(meta.title)}" type="button" title="Copy Title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Title</span>
            </button>
          </div>
          <div class="social-meta-value social-title-text">${escapeHtml(meta.title)}</div>
        </div>

        <!-- 2-3 Line Description -->
        <div class="social-meta-block">
          <div class="social-meta-label-row">
            <span class="social-meta-label">📝 2-3 Line Description</span>
            <button class="btn-copy-snippet btn-copy-desc" data-copy="${escapeHtml(meta.description)}" type="button" title="Copy Description">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Description</span>
            </button>
          </div>
          <div class="social-meta-value social-desc-text">${escapeHtml(meta.description).replace(/\n/g, '<br>')}</div>
        </div>

        <!-- Matching Trending Hashtags -->
        <div class="social-meta-block">
          <div class="social-meta-label-row">
            <span class="social-meta-label">🔥 Trending Hashtags</span>
            <button class="btn-copy-snippet btn-copy-tags" data-copy="${escapeHtml(meta.hashtags)}" type="button" title="Copy Hashtags">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Hashtags</span>
            </button>
          </div>
          <div class="social-hashtags-wrap">
            ${hashtagList.map(tag => `<span class="hashtag-chip">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>

        <!-- Copy Complete Post -->
        <button class="btn-copy-all-social" data-all="${escapeHtml(meta.title + '\n\n' + meta.description + '\n\n' + meta.hashtags)}" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>Copy Complete Post (Title + Description + Hashtags)</span>
        </button>
      </div>
    </div>
  `;
}

function attachSocialTabEvents(container) {
  if (!container) return;
  const tabWrap = container.classList.contains('history-social-tab') || container.classList.contains('stage-social-tab')
    ? container
    : (container.querySelector('.history-social-tab') || container.querySelector('.stage-social-tab'));

  const header = tabWrap ? tabWrap.querySelector('.social-tab-header') : null;
  if (header && !header.dataset.hasListener) {
    header.dataset.hasListener = 'true';
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      tabWrap.classList.toggle('is-open');
    });
  }

  // Copy Title
  const btnTitle = container.querySelector('.btn-copy-title');
  if (btnTitle && !btnTitle.dataset.hasListener) {
    btnTitle.dataset.hasListener = 'true';
    btnTitle.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btnTitle.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        btnTitle.classList.add('is-copied');
        btnTitle.innerHTML = `<span>✓ Copied!</span>`;
        showCopyToast('Short Crisp Title copied to clipboard!');
        setTimeout(() => {
          btnTitle.classList.remove('is-copied');
          btnTitle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy Title</span>`;
        }, 2000);
      });
    });
  }

  // Copy Description
  const btnDesc = container.querySelector('.btn-copy-desc');
  if (btnDesc && !btnDesc.dataset.hasListener) {
    btnDesc.dataset.hasListener = 'true';
    btnDesc.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btnDesc.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        btnDesc.classList.add('is-copied');
        btnDesc.innerHTML = `<span>✓ Copied!</span>`;
        showCopyToast('2-3 Line Description copied to clipboard!');
        setTimeout(() => {
          btnDesc.classList.remove('is-copied');
          btnDesc.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy Description</span>`;
        }, 2000);
      });
    });
  }

  // Copy Hashtags
  const btnTags = container.querySelector('.btn-copy-tags');
  if (btnTags && !btnTags.dataset.hasListener) {
    btnTags.dataset.hasListener = 'true';
    btnTags.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btnTags.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        btnTags.classList.add('is-copied');
        btnTags.innerHTML = `<span>✓ Copied!</span>`;
        showCopyToast('Trending Hashtags copied to clipboard!');
        setTimeout(() => {
          btnTags.classList.remove('is-copied');
          btnTags.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy Hashtags</span>`;
        }, 2000);
      });
    });
  }

  // Copy All
  const btnAll = container.querySelector('.btn-copy-all-social');
  if (btnAll && !btnAll.dataset.hasListener) {
    btnAll.dataset.hasListener = 'true';
    btnAll.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btnAll.dataset.all;
      navigator.clipboard.writeText(text).then(() => {
        btnAll.classList.add('is-copied');
        btnAll.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Complete Post Copied!</span>`;
        showCopyToast('Complete post (Title, Description & Tags) copied! Ready to publish.');
        setTimeout(() => {
          btnAll.classList.remove('is-copied');
          btnAll.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy Complete Post (Title + Description + Hashtags)</span>`;
        }, 2500);
      });
    });
  }
}

// Tab Switching
function switchTab(targetView) {
  [tabBtnTemplates, tabBtnIdeas, tabBtnHistory].forEach(t => t?.classList.remove('active'));
  [viewTemplates, viewIdeas, viewHistory].forEach(v => { if (v) v.style.display = 'none'; });

  if (targetView === 'ideas') {
    tabBtnIdeas.classList.add('active');
    viewIdeas.style.display = 'block';
    loadIdeas();
  } else if (targetView === 'history') {
    tabBtnHistory.classList.add('active');
    viewHistory.style.display = 'block';
    loadHistory();
  } else {
    tabBtnTemplates.classList.add('active');
    viewTemplates.style.display = 'block';
  }
}

tabBtnTemplates.addEventListener('click', () => switchTab('templates'));
tabBtnIdeas.addEventListener('click', () => switchTab('ideas'));
tabBtnHistory.addEventListener('click', () => switchTab('history'));
btnGenerateMoreIdeas.addEventListener('click', () => loadIdeas());
btnRefreshHistory.addEventListener('click', () => loadHistory());

// Fetch and render previous MP4 video outputs
async function loadHistory() {
  try {
    historyGrid.innerHTML = `
      <div class="loading-cards">
        <div class="spinner"></div>
        <span>Loading render history...</span>
      </div>
    `;

    const res = await fetch('/api/renders/history');
    const data = await res.json();

    if (data.success && data.history) {
      badgeHistoryCount.textContent = data.count;
      renderHistoryCards(data.history);
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    historyGrid.innerHTML = `<div style="grid-column: 1/-1; color: #ef4444; padding: 20px; text-align: center;">Could not load render history.</div>`;
  }
}

function renderHistoryCards(items) {
  historyGrid.innerHTML = '';

  if (items.length === 0) {
    historyGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-secondary); text-align: center; padding: 40px;">No rendered videos yet. Click "Initiate Render" to produce your first MP4 reel!</div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.id = `history-card-${item.filename.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const isMaster = item.filename === 'puzzle-output.mp4';
    const meta = item.socialMeta || getSocialMetadata(item.puzzle_id, item);

    card.innerHTML = `
      <div>
        <div class="history-card-header">
          <span class="history-format-tag">1080×1920 MP4</span>
          <span class="history-date">${escapeHtml(item.createdFormatted)}</span>
        </div>
        <div class="history-card-title">${escapeHtml(item.title)}</div>
        <div class="history-meta-row">
          <span>📦 ${item.sizeMB} MB</span>
          <span>·</span>
          <span>⏱️ 37.0s</span>
          <span>·</span>
          <span>🎬 30 FPS</span>
        </div>
        <div class="history-details-pill">
          <span class="history-detail-tag">H.264 Video</span>
          <span class="history-detail-tag">AAC Stereo</span>
          <span class="history-detail-tag">9:16 Shorts/Reels</span>
        </div>
        <div class="history-status-indicator" style="display: none;"></div>
      </div>
      <div class="history-actions">
        <button class="btn-play-history" title="Inspect & Play Video in Phone Mockup">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>Play in Stage</span>
        </button>
        <a class="btn-download-history" href="${item.downloadUrl}" download="${item.filename}" title="Direct High-Speed MP4 Download">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download</span>
        </a>
        ${!isMaster ? `
        <button class="btn-delete-history" title="Delete Render">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
        ` : ''}
      </div>
      ${renderSocialTabHTML(meta)}
    `;

    // Play in stage button
    const btnPlay = card.querySelector('.btn-play-history');
    btnPlay.addEventListener('click', () => {
      if (isPreviewPlaying) togglePreviewPlay();
      studioPreviewAudio.pause();

      // Switch right panel to player mode
      screenPreview.style.display = 'none';
      screenHud.style.display = 'none';
      screenPlayer.style.display = 'block';

      finalVideoPlayer.src = item.url;
      finalVideoPlayer.muted = false;
      finalVideoPlayer.volume = 1.0;
      finalVideoPlayer.load();
      finalVideoPlayer.play().catch(() => {});

      // Setup download button in controls
      btnDownloadMp4.href = item.downloadUrl;
      btnDownloadMp4.setAttribute('download', item.filename);
      successMetrics.textContent = `${item.title} · ${item.sizeMB} MB · 37.0s · 1080×1920 MP4`;
      outputControls.style.display = 'flex';

      // Populate stage output social tab
      if (stageSocialTab) {
        stageSocialTab.innerHTML = renderSocialTabHTML(meta);
        stageSocialTab.style.display = 'block';
        attachSocialTabEvents(stageSocialTab);
      }

      // Highlight playing card
      document.querySelectorAll('.history-card').forEach(c => {
        c.classList.remove('is-playing');
        const ind = c.querySelector('.history-status-indicator');
        if (ind) {
          ind.style.display = 'none';
          ind.innerHTML = '';
        }
      });
      card.classList.add('is-playing');
      const curInd = card.querySelector('.history-status-indicator');
      if (curInd) {
        curInd.style.display = 'block';
        curInd.innerHTML = `<span class="history-playing-indicator">▶ Playing in Phone Stage</span>`;
      }
    });

    // Delete button
    const btnDelete = card.querySelector('.btn-delete-history');
    if (btnDelete) {
      btnDelete.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${item.title} (${item.filename})?`)) {
          try {
            const res = await fetch(`/api/renders/delete/${encodeURIComponent(item.filename)}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
              loadHistory();
            } else {
              alert(data.error || 'Failed to delete file');
            }
          } catch (err) {
            console.error('Delete error:', err);
            alert('Could not delete render file.');
          }
        }
      });
    }

    historyGrid.appendChild(card);
    attachSocialTabEvents(card);
  });
}

// Fetch and render fresh ideas into Idea Lab
async function loadIdeas() {
  try {
    ideasGrid.innerHTML = `
      <div class="loading-cards">
        <div class="spinner"></div>
        <span>Synthesizing fresh creative math paradoxes...</span>
      </div>
    `;

    const res = await fetch('/api/ideas/generate?limit=8');
    const data = await res.json();

    if (data.success && data.ideas.length > 0) {
      renderIdeaCards(data.ideas);
    }
  } catch (err) {
    console.error('Failed to generate ideas:', err);
    ideasGrid.innerHTML = `<div style="grid-column: 1/-1; color: #ef4444; padding: 20px; text-align: center;">Could not generate ideas.</div>`;
  }
}

function renderIdeaCards(ideas) {
  ideasGrid.innerHTML = '';
  ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `
      <div>
        <div class="idea-card-header">
          <span class="emotion-tag">${idea.emotion || 'Curiosity'}</span>
          <span class="diff-tag">${idea.category || 'Math Mystery'}</span>
        </div>
        <div class="idea-card-title">${escapeHtml(idea.hook_title)}</div>
        <div class="idea-insight-box">
          <strong>The Paradox:</strong> ${escapeHtml(idea.rule_title || idea.formula_title)}<br>
          <span style="color: #94a3b8; font-size: 11.5px;">${escapeHtml(idea.proof_count_text || '')}</span>
        </div>
      </div>
      <button class="btn-use-idea">
        <span>🚀 Load Into Studio & Preview</span>
      </button>
    `;

    const btnUse = card.querySelector('.btn-use-idea');
    btnUse.addEventListener('click', (e) => {
      e.stopPropagation();
      // Select this puzzle
      selectPuzzle(idea);
      // Switch back to templates/studio view
      switchTab('templates');
      // Highlight in summary
      summaryPuzzleTitle.textContent = idea.hook_title;
    });

    ideasGrid.appendChild(card);
  });
}

// Fetch and render curated 7-8 puzzles
async function loadPuzzles(isFresh = false) {
  try {
    puzzlesGrid.innerHTML = `
      <div class="loading-cards">
        <div class="spinner"></div>
        <span>${isFresh ? 'Synthesizing fresh puzzle variations...' : 'Loading curated math paradoxes...'}</span>
      </div>
    `;

    const res = await fetch(`/api/puzzles?limit=8&fresh=${isFresh}`);
    const data = await res.json();
    
    if (data.success && data.puzzles.length > 0) {
      currentPuzzles = data.puzzles;
      renderPuzzleCards();
      // Select first puzzle by default
      selectPuzzle(currentPuzzles[0]);
    }
  } catch (err) {
    console.error('Failed to load puzzles:', err);
    puzzlesGrid.innerHTML = `<div style="grid-column: 1/-1; color: #ef4444; padding: 20px; text-align: center;">Failed to load puzzles from server.</div>`;
  }
}

// Category matching helper
function matchCategory(puzzleCategory, filterCategory) {
  if (!filterCategory || filterCategory === 'all') return true;
  const pCat = (puzzleCategory || '').toLowerCase();
  const fCat = filterCategory.toLowerCase();
  
  if (fCat === 'all') return true;
  if (fCat === 'geometry' && (pCat.includes('geometry') || pCat.includes('area') || pCat.includes('spatial') || pCat.includes('circumference'))) return true;
  if (fCat === 'arithmetic' && (pCat.includes('arithmetic') || pCat.includes('multiplication') || pCat.includes('speed') || pCat.includes('sum') || pCat.includes('number'))) return true;
  if (fCat === 'percentages' && (pCat.includes('percent') || pCat.includes('money') || pCat.includes('discount'))) return true;
  if (fCat === 'counting' && (pCat.includes('count') || pCat.includes('cube') || pCat.includes('combination') || pCat.includes('sequence') || pCat.includes('pattern') || pCat.includes('squares'))) return true;
  if (fCat === 'probability' && (pCat.includes('prob') || pCat.includes('paradox') || pCat.includes('birthday') || pCat.includes('monty') || pCat.includes('odds') || pCat.includes('exponential') || pCat.includes('logic'))) return true;
  
  return pCat === fCat || pCat.includes(fCat) || fCat.includes(pCat);
}

// Render cards into grid
function renderPuzzleCards() {
  const filtered = activeCategory === 'all' 
    ? currentPuzzles 
    : currentPuzzles.filter(p => matchCategory(p.category, activeCategory));

  puzzlesGrid.innerHTML = '';

  if (filtered.length === 0) {
    puzzlesGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-secondary); text-align: center; padding: 40px;">No puzzles in this category. Click "Surprise Me" to roll new ones!</div>`;
    return;
  }

  // Auto-select first matching puzzle if current selection is filtered out
  if (!selectedPuzzle || !filtered.some(p => p.puzzle_id === selectedPuzzle.puzzle_id)) {
    selectPuzzle(filtered[0]);
  }

  filtered.forEach(p => {
    const isSelected = selectedPuzzle && selectedPuzzle.puzzle_id === p.puzzle_id;
    const card = document.createElement('div');
    card.className = `puzzle-card ${isSelected ? 'selected' : ''}`;
    card.dataset.id = p.puzzle_id;

    card.innerHTML = `
      <div>
        <div class="card-top-meta">
          <span class="emotion-tag">${p.emotion || 'Curiosity'}</span>
          <span class="diff-tag">${p.difficulty || 'Easy'}</span>
        </div>
        <div class="card-hook-title">${escapeHtml(p.hook_title)}</div>
        <div class="card-items-preview">
          <span class="card-item-chip">${escapeHtml(p.item_1_label || '')}</span>
          <span class="card-item-chip">${escapeHtml(p.item_2_label || '')}</span>
          <span class="card-item-chip">${escapeHtml(p.item_3_label || '')}</span>
          <span class="card-item-chip">${escapeHtml(p.item_4_label || '')}</span>
        </div>
      </div>
      <div class="card-footer-rule">
        <span>💡</span>
        <span>${escapeHtml(p.rule_title || p.formula_title)}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectPuzzle(p);
    });

    puzzlesGrid.appendChild(card);
  });
}

// Select a puzzle and sync with forms and preview
function selectPuzzle(puzzle) {
  selectedPuzzle = puzzle;
  summaryPuzzleTitle.textContent = puzzle.hook_title;

  // Highlight card
  document.querySelectorAll('.puzzle-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === puzzle.puzzle_id);
  });

  // Populate Customizer form
  custHookTitle.value = puzzle.hook_title || '';
  custHandwrittenHook.value = puzzle.handwritten_hook || '';
  custCountdownHeading.value = puzzle.countdown_heading || "Comment your guess before time runs out!";
  custKidHeading.value = puzzle.kid_explainer_heading || "2× Width × 2× Height = 4× Pizza!";
  if (custKidText) custKidText.value = puzzle.kid_explainer_text || "When a circle gets 2 times wider, it ALSO gets 2 times taller: 2 × 2 = 4!";
  if (custYoutubeHandle) custYoutubeHandle.value = puzzle.youtube_handle || "Bloxxerman1";
  if (custInstagramHandle) custInstagramHandle.value = puzzle.instagram_handle || "Mysteryuntoldd";
  if (custChannelHandle) custChannelHandle.value = puzzle.channel_handle || "YouTube: Bloxxerman1 • Instagram: Mysteryuntoldd";
  custTestQuestion.value = puzzle.test_question || '';
  custProofCountText.value = puzzle.proof_count_text || '';
  custFormulaTitle.value = puzzle.formula_title || '';
  custRuleTitle.value = puzzle.rule_title || '';
  custAhaTitle.value = puzzle.aha_title || '';
  custAhaEmoji.value = puzzle.aha_emoji || '';
  if (custBgmTheme) custBgmTheme.value = puzzle.bgm_theme || "curious_mystery";

  // Update preview stage if idle
  if (screenPlayer.style.display === 'none' && screenHud.style.display === 'none') {
    updatePreviewIframe(0.5);
    seekToTime(0.5);
  }
}

// Update the live preview iframe with current customizer values
function updatePreviewIframe(targetTime = null) {
  try {
    const iframeWin = previewIframe.contentWindow;
    const iframeDoc = previewIframe.contentDocument || iframeWin?.document;
    if (!iframeDoc || !selectedPuzzle) return;

    // Update all data-var-text elements dynamically
    iframeDoc.querySelectorAll('[data-var-text]').forEach(el => {
      const key = el.getAttribute('data-var-text');
      if (key && selectedPuzzle[key] !== undefined) {
        el.textContent = selectedPuzzle[key];
      }
    });

    if (iframeWin && typeof iframeWin.setVariables === 'function') {
      iframeWin.setVariables(selectedPuzzle);
    }

    if (targetTime !== null && iframeWin && typeof iframeWin.seekPreview === 'function') {
      iframeWin.seekPreview(targetTime);
    }
  } catch (e) {
    console.warn("Could not sync preview DOM", e);
  }
}

// Interactive Preview Stage Controls & Synchronized Studio Audio
const btnPreviewPlay = document.getElementById('btn-preview-play');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const previewScrubber = document.getElementById('preview-scrubber');
const previewTimeDisplay = document.getElementById('preview-time-display');
const sceneJumpChips = document.querySelectorAll('.scene-jump-chip');
let isPreviewPlaying = false;
let previewPlayTimer = null;

// Dedicated preview audio player for live composition playback in studio
const studioPreviewAudio = new Audio();
studioPreviewAudio.volume = 0.90;
studioPreviewAudio.preload = 'auto';

function syncStudioAudioSource() {
  const theme = selectedPuzzle ? (selectedPuzzle.bgm_theme || 'curious_mystery') : 'curious_mystery';
  const targetSrc = `/assets/${theme}.mp3`;
  if (!studioPreviewAudio.src.endsWith(targetSrc)) {
    studioPreviewAudio.src = targetSrc;
    studioPreviewAudio.load();
  }
}

function formatTransportTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  const d = String(Math.floor((sec % 1) * 10));
  return `${m}:${s}.${d}`;
}

function updateTransportUI(time) {
  if (previewScrubber) previewScrubber.value = time;
  if (previewTimeDisplay) previewTimeDisplay.textContent = formatTransportTime(time);
  
  sceneJumpChips.forEach(chip => {
    const chipTime = parseFloat(chip.dataset.time);
    chip.classList.toggle('active', Math.abs(chipTime - time) < 2.0);
  });
}

function seekToTime(time) {
  try {
    const iframeWin = previewIframe.contentWindow;
    if (iframeWin && typeof iframeWin.seekPreview === 'function') {
      iframeWin.seekPreview(time);
    }
    syncStudioAudioSource();
    studioPreviewAudio.currentTime = Math.max(0, Math.min(time, 37.0));
    updateTransportUI(time);
  } catch (e) {}
}

function togglePreviewPlay() {
  try {
    const iframeWin = previewIframe.contentWindow;
    if (!iframeWin || !iframeWin.tl) return;
    
    if (isPreviewPlaying) {
      if (typeof iframeWin.pausePreview === 'function') {
        iframeWin.pausePreview();
      } else {
        iframeWin.tl.pause();
      }
      studioPreviewAudio.pause();
      isPreviewPlaying = false;
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      if (previewPlayTimer) clearInterval(previewPlayTimer);
    } else {
      syncStudioAudioSource();
      if (iframeWin.tl.time() >= 36.8) {
        seekToTime(0);
      }
      if (typeof iframeWin.playPreview === 'function') {
        iframeWin.playPreview();
      } else {
        iframeWin.tl.play();
      }
      studioPreviewAudio.currentTime = Math.max(0, Math.min(iframeWin.tl.time(), 37.0));
      studioPreviewAudio.play().catch(e => console.log("Studio audio playback:", e));

      isPreviewPlaying = true;
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';

      previewPlayTimer = setInterval(() => {
        try {
          const t = iframeWin.tl.time();
          updateTransportUI(t);
          if (t >= 36.9) {
            togglePreviewPlay(); // pause at end
          }
        } catch (err) {}
      }, 100);
    }
  } catch (e) {
    console.warn("Preview playback error", e);
  }
}

if (btnPreviewPlay) {
  btnPreviewPlay.addEventListener('click', togglePreviewPlay);
}

if (previewScrubber) {
  previewScrubber.addEventListener('input', (e) => {
    if (isPreviewPlaying) togglePreviewPlay();
    seekToTime(parseFloat(e.target.value));
  });
}

sceneJumpChips.forEach(chip => {
  chip.addEventListener('click', () => {
    if (isPreviewPlaying) togglePreviewPlay();
    const t = parseFloat(chip.dataset.time);
    seekToTime(t);
  });
});

// Auto-sync preview when iframe loads
previewIframe.addEventListener('load', () => {
  if (selectedPuzzle) {
    updatePreviewIframe(0.5);
    seekToTime(0.5);
  }
});

// Listen to customizer edits
const customInputs = [
  custHookTitle, custHandwrittenHook, custCountdownHeading, 
  custKidHeading, custKidText, custYoutubeHandle, custInstagramHandle, custChannelHandle,
  custTestQuestion, custProofCountText, custFormulaTitle, 
  custRuleTitle, custAhaTitle, custAhaEmoji, custBgmTheme
];

customInputs.forEach(input => {
  if (!input) return;
  const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
  input.addEventListener(eventName, () => {
    if (!selectedPuzzle) return;
    selectedPuzzle.hook_title = custHookTitle.value;
    selectedPuzzle.handwritten_hook = custHandwrittenHook.value;
    selectedPuzzle.countdown_heading = custCountdownHeading.value;
    selectedPuzzle.kid_explainer_heading = custKidHeading.value;
    selectedPuzzle.kid_explainer_text = custKidText.value;
    if (custYoutubeHandle) selectedPuzzle.youtube_handle = custYoutubeHandle.value;
    if (custInstagramHandle) selectedPuzzle.instagram_handle = custInstagramHandle.value;
    if (custChannelHandle) selectedPuzzle.channel_handle = custChannelHandle.value;
    selectedPuzzle.test_question = custTestQuestion.value;
    selectedPuzzle.proof_count_text = custProofCountText.value;
    selectedPuzzle.formula_title = custFormulaTitle.value;
    selectedPuzzle.rule_title = custRuleTitle.value;
    selectedPuzzle.aha_title = custAhaTitle.value;
    selectedPuzzle.aha_emoji = custAhaEmoji.value;
    if (custBgmTheme) {
      selectedPuzzle.bgm_theme = custBgmTheme.value;
      selectedPuzzle.bgm_src = `assets/${custBgmTheme.value}.mp3`;
    }

    summaryPuzzleTitle.textContent = selectedPuzzle.hook_title;
    updatePreviewIframe();
  });
});

// Category filtering
categoryFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;

  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.category;
  renderPuzzleCards();
});

// Customizer Accordion Toggle
customizerToggle.addEventListener('click', () => {
  const isHidden = customizerBody.style.display === 'none';
  customizerBody.style.display = isHidden ? 'block' : 'none';
  customizerArrow.textContent = isHidden ? '▲' : '▼';
});

// Roll Fresh Puzzles
btnRollFresh.addEventListener('click', () => loadPuzzles(true));
btnRollFreshTop.addEventListener('click', () => loadPuzzles(true));

// Initiate Render Pipeline
btnInitiateRender.addEventListener('click', async () => {
  if (isPreviewPlaying) togglePreviewPlay();
  studioPreviewAudio.pause();

  // Switch Stage to HUD Mode
  screenPreview.style.display = 'none';
  screenPlayer.style.display = 'none';
  screenHud.style.display = 'flex';
  outputControls.style.display = 'none';

  // Reset HUD metrics
  hudPercentage.textContent = '5%';
  hudBar.style.width = '5%';
  hudPhase.textContent = 'Initializing HyperFrames Engine...';
  hudFrames.textContent = '0 / 720';
  hudLog.innerHTML = '<div>[HyperFrames] Launching render process container...</div>';
  renderStartTime = Date.now();

  btnInitiateRender.disabled = true;
  btnInitiateRender.innerHTML = `
    <div class="spinner" style="width: 18px; height: 18px; margin: 0; border-width: 2px;"></div>
    <span>RENDERING REEL IN BACKGROUND...</span>
  `;

  // Start elapsed timer
  const timerInterval = setInterval(() => {
    if (!renderStartTime) return;
    const elapsedSec = Math.floor((Date.now() - renderStartTime) / 1000);
    const m = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const s = String(elapsedSec % 60).padStart(2, '0');
    hudTime.textContent = `${m}:${s}`;
  }, 1000);

  try {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzle: selectedPuzzle })
    });

    const data = await res.json();
    if (!data.success || !data.job) {
      throw new Error(data.error || 'Failed to start render');
    }

    const jobId = data.job.id;

    // Poll status until done
    pollInterval = setInterval(async () => {
      try {
        const sRes = await fetch(`/api/render-status/${jobId}`);
        const sData = await sRes.json();

        if (sData.success && sData.job) {
          const job = sData.job;
          
          // Update HUD
          hudPercentage.textContent = `${job.progress}%`;
          hudBar.style.width = `${job.progress}%`;
          hudPhase.textContent = job.stage || 'Rendering...';

          if (job.stage && job.stage.includes('Capturing Frames:')) {
            const frameMatch = job.stage.match(/Capturing Frames:\s*(\d+)\/(\d+)/);
            if (frameMatch) {
              hudFrames.textContent = `${frameMatch[1]} / ${frameMatch[2]}`;
            }
          }

          // Append latest logs
          if (job.logs && job.logs.length > 0) {
            const recentLogs = job.logs.slice(-4).join('<br>').replace(/\n/g, '<br>');
            hudLog.innerHTML = recentLogs;
            hudLog.scrollTop = hudLog.scrollHeight;
          }

          // Completed
          if (job.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
            onRenderComplete(job);
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
            alert(`Render failed: ${job.error || 'Unknown error'}`);
            resetRenderButton();
          }
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 1000);

  } catch (err) {
    clearInterval(timerInterval);
    alert(`Could not initiate render: ${err.message}`);
    resetRenderButton();
  }
});

// When Render Completes
function onRenderComplete(job) {
  resetRenderButton();

  // Switch Stage to Video Player Mode
  screenHud.style.display = 'none';
  screenPreview.style.display = 'none';
  screenPlayer.style.display = 'block';

  // Set video source
  finalVideoPlayer.src = job.videoUrl;
  finalVideoPlayer.muted = false;
  finalVideoPlayer.volume = 1.0;
  finalVideoPlayer.load();
  finalVideoPlayer.play().catch(() => {});

  // Update Download and Action buttons
  btnDownloadMp4.href = job.downloadUrl;
  btnDownloadMp4.setAttribute('download', `${job.puzzleId || 'math-puzzle'}.mp4`);

  // Update success metrics
  successMetrics.textContent = `${job.durationSec || '60'}s render time · 37.0s video · ${job.fileSizeMB || '3.3'} MB · 1080×1920 MP4`;
  outputControls.style.display = 'flex';

  // Populate stage output social tab
  const meta = job.socialMeta || getSocialMetadata(job.puzzleId, selectedPuzzle);
  if (stageSocialTab) {
    stageSocialTab.innerHTML = renderSocialTabHTML(meta);
    stageSocialTab.style.display = 'block';
    attachSocialTabEvents(stageSocialTab);
  }

  updateHistoryBadge();
}

function resetRenderButton() {
  btnInitiateRender.disabled = false;
  btnInitiateRender.innerHTML = `
    <svg class="bolt-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
    <span>INITIATE RENDER & PRODUCE MP4</span>
  `;
}

// Update History Count Badge
async function updateHistoryBadge() {
  try {
    const res = await fetch('/api/renders/history');
    const data = await res.json();
    if (data.success && badgeHistoryCount) {
      badgeHistoryCount.textContent = data.count;
    }
  } catch (e) {}
}

// Copy Video Link
btnCopyLink.addEventListener('click', () => {
  const url = window.location.origin + btnDownloadMp4.getAttribute('href');
  navigator.clipboard.writeText(url).then(() => {
    alert('Direct video link copied to clipboard!');
  });
});

// Replay Video
btnReplay.addEventListener('click', () => {
  if (finalVideoPlayer) {
    finalVideoPlayer.currentTime = 0;
    finalVideoPlayer.play();
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  loadPuzzles();
  updateHistoryBadge();
});


import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local WinGet FFmpeg path is injected into environment if present
const wingetPath = 'C:\\Users\\HP\\AppData\\Local\\Microsoft\\WinGet\\Links';
if (fs.existsSync(wingetPath) && !process.env.PATH.includes(wingetPath)) {
  process.env.PATH = `${wingetPath};${process.env.PATH}`;
}

const PORT = 8095;
const rendersDir = path.join(__dirname, 'renders');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Read puzzles database
function getPuzzles() {
  const puzzlesPath = path.join(__dirname, 'puzzles.json');
  return JSON.parse(fs.readFileSync(puzzlesPath, 'utf-8')).rows;
}

// Active jobs in memory
const jobs = new Map();

// Database of diverse creative math paradox ideas
const IDEA_VAULT = [
  {
    puzzle_id: "percent_stacked",
    category: "Percentages & Money",
    emotion: "Humour",
    difficulty: "Medium",
    badge_text: "Shopping Math Trap",
    handwritten_hook: "Stores love when you believe this!",
    hook_title: "Is 50% off PLUS an extra 50% off actually FREE?",
    test_badge: "The Stacking Trick",
    test_question: "Take a $100 jacket: First cut 50% = $50",
    proof_count_text: "Now take 50% of $50 = You still pay $25!",
    item_1_label: "Original: $100",
    item_2_label: "1st 50% off = $50",
    item_3_label: "2nd 50% off $50",
    item_4_label: "You Pay: $25!",
    formula_badge: "Multiplicative Discounts",
    formula_title: "0.5 × 0.5 = 0.25 (75% Total Off)",
    card1_title: "Intuition",
    card1_val: "100% Off?",
    card1_sub: "50% + 50% = 100% (False!)",
    card2_title: "Real Price",
    card2_val: "$25",
    card2_sub: "$100 × 0.5 × 0.5 = $25",
    rule_title: "Discounts Multiply, Not Add!",
    rule_body: "The second discount only applies to the remaining balance!",
    aha_emoji: "🏷️💸",
    aha_title: "It's 75% Off, Not Free!",
    aha_subtitle: "Always multiply: 50% off + 50% off leaves 25% of the price!",
    cta_text: "Send to a friend who loves sales! ➜"
  },
  {
    puzzle_id: "clock_angle",
    category: "Geometry & Time",
    emotion: "Curiosity",
    difficulty: "Tricky",
    badge_text: "Clock Optical Illusion",
    handwritten_hook: "Look at your watch closely!",
    hook_title: "At 3:15, are the hour and minute hands exactly overlapping?",
    test_badge: "Moving Hour Hand",
    test_question: "Minute hand is on 3... but where is the hour hand?",
    proof_count_text: "It moved 7.5 DEGREES ahead!",
    item_1_label: "Min Hand: at 3",
    item_2_label: "Hr moves 0.5°/min",
    item_3_label: "15 mins × 0.5°",
    item_4_label: "Gap = 7.5°!",
    formula_badge: "Hour Hand Speed",
    formula_title: "360° ÷ 12 Hours = 30° Per Hour",
    card1_title: "Common Guess",
    card1_val: "0° (Overlapping)",
    card1_sub: "Assuming hour hand stays on 3",
    card2_title: "True Angle",
    card2_val: "7.5° Gap",
    card2_sub: "Hour hand is 1/4 toward 4!",
    rule_title: "The Hour Hand Never Stops!",
    rule_body: "In 15 minutes, the hour hand travels 1/4 of an hour (7.5°)!",
    aha_emoji: "⏰📐",
    aha_title: "There is a 7.5° Gap!",
    aha_subtitle: "They only overlap at approximately 3:16 and 22 seconds!",
    cta_text: "Did you think they overlap? ➜"
  },
  {
    puzzle_id: "monty_hall",
    category: "Probability & Paradox",
    emotion: "Mind-Blowing",
    difficulty: "Hard",
    badge_text: "The Famous TV Paradox",
    handwritten_hook: "Even PhDs argued over this!",
    hook_title: "3 doors, 1 car. Host reveals a goat. Should you SWITCH doors?",
    test_badge: "The Probability Split",
    test_question: "Is it 50/50 now? Or does switching double your odds?",
    proof_count_text: "Switching wins 2 out of 3 times (67%)!",
    item_1_label: "Stay: 1/3 odds",
    item_2_label: "Goat revealed",
    item_3_label: "Other door: 2/3",
    item_4_label: "Switch = 67% win!",
    formula_badge: "Information Shift",
    formula_title: "Your First Choice Had 33% Chance",
    card1_title: "If You Stay",
    card1_val: "33.3% Win",
    card1_sub: "Original blind pick odds",
    card2_title: "If You Switch",
    card2_val: "66.7% Win",
    card2_sub: "Host absorbed the wrong door!",
    rule_title: "Host Removes A Loser!",
    rule_body: "All the 2/3 probability of the other doors concentrates into the remaining door!",
    aha_emoji: "🚪🚗",
    aha_title: "ALWAYS Switch Doors!",
    aha_subtitle: "Switching gives you twice the probability of winning the sports car!",
    cta_text: "Would you have stayed or switched? ➜"
  },
  {
    puzzle_id: "rope_earth",
    category: "Geometry & Circumference",
    emotion: "Wonder",
    difficulty: "Mind-Bending",
    badge_text: "Cosmic String Puzzle",
    handwritten_hook: "Defies all human intuition!",
    hook_title: "Tie a rope around Earth. Add 1 meter. Can an apple fit under?",
    test_badge: "The Circumference Law",
    test_question: "Earth is 40,000 km around! Does 1m make any visible gap?",
    proof_count_text: "The rope lifts by 16 CENTIMETERS (6 inches)!",
    item_1_label: "Earth: 40,000km",
    item_2_label: "Add +1 Meter",
    item_3_label: "Δr = 1 / (2π)",
    item_4_label: "Lift = 15.9 cm!",
    formula_badge: "The Radius Formula",
    formula_title: "C = 2πR ➔ ΔR = ΔC ÷ 2π",
    card1_title: "Radius Added",
    card1_val: "1 ÷ (2 × 3.14)",
    card1_sub: "Notice Earth radius cancels out!",
    card2_title: "Resulting Gap",
    card2_val: "15.9 cm",
    card2_sub: "A cat or ball easily fits under!",
    rule_title: "Earth's Size Doesn't Matter!",
    rule_body: "Adding 1 meter raises the rope by 16cm on Earth, on Jupiter, or on a soccer ball!",
    aha_emoji: "🌍🧶",
    aha_title: "16 cm Gap Around The Earth!",
    aha_subtitle: "Because Δr = 1/2π regardless of the starting radius!",
    cta_text: "Show this to a science teacher! ➜"
  },
  {
    puzzle_id: "square_ending_5",
    category: "Rapid Arithmetic",
    emotion: "Identity",
    difficulty: "Easy",
    badge_text: "Instant Mental Math",
    handwritten_hook: "Calculate 65² in 2 seconds!",
    hook_title: "How to square ANY number ending in 5 in under 3 seconds!",
    test_badge: "The 25 Suffix Rule",
    test_question: "Take 65²: Multiply 6 by (6 + 1 = 7) = 42!",
    proof_count_text: "Tack 25 on the end ➔ 4,225!",
    item_1_label: "Number: 65",
    item_2_label: "First: 6 × 7 = 42",
    item_3_label: "Suffix: 25",
    item_4_label: "Result = 4225!",
    formula_badge: "Algebraic Proof",
    formula_title: "(10n + 5)² = 100n(n + 1) + 25",
    card1_title: "Example 35²",
    card1_val: "1,225",
    card1_sub: "3 × 4 = 12, then 25",
    card2_title: "Example 75²",
    card2_val: "5,625",
    card2_sub: "7 × 8 = 56, then 25",
    rule_title: "Multiply N by (N + 1)!",
    rule_body: "Multiply the tens digit by the next integer and append 25!",
    aha_emoji: "⚡🧠",
    aha_title: "Square in 2 Seconds!",
    aha_subtitle: "Try 85²: 8 × 9 = 72 ➔ 7,225! You're a genius!",
    cta_text: "Comment with 95² without a calculator! ➜"
  },
  {
    puzzle_id: "cube_paint",
    category: "Spatial Reasoning",
    emotion: "Curiosity",
    difficulty: "Medium",
    badge_text: "3D Spatial Riddle",
    handwritten_hook: "Visual test for your brain!",
    hook_title: "A 3×3×3 cube is painted blue and cut into 27 small cubes. 0 painted?",
    test_badge: "Cube Layers",
    test_question: "Corners have 3 blue sides. Edges have 2. Centers have 1...",
    proof_count_text: "Only the 1 center core cube has 0 painted sides!",
    item_1_label: "8 corners (3 sides)",
    item_2_label: "12 edges (2 sides)",
    item_3_label: "6 faces (1 side)",
    item_4_label: "1 core (0 sides)!",
    formula_badge: "Inner Core Volume",
    formula_title: "(N - 2)³ Inner Unpainted Cubes",
    card1_title: "Outer Painted",
    card1_val: "26 Cubes",
    card1_sub: "8 + 12 + 6 = 26",
    card2_title: "Hidden Inner",
    card2_val: "1 Cube",
    card2_sub: "(3 - 2)³ = 1³ = 1",
    rule_title: "Inside Core = (N - 2)³!",
    rule_body: "For a 4×4×4 cube, (4 - 2)³ = 8 cubes have zero paint!",
    aha_emoji: "🧊🎨",
    aha_title: "Only 1 Hidden Cube!",
    aha_subtitle: "Did you mentally visualize the exact center cube?",
    cta_text: "Test your spatial IQ! ➜"
  },
  {
    puzzle_id: "average_speed",
    category: "Speed & Ratios",
    emotion: "Curiosity",
    difficulty: "Tricky",
    badge_text: "Road Trip Physics Trap",
    handwritten_hook: "Almost everyone says 40 mph!",
    hook_title: "Drive 60 mph to town, then 20 mph back. Average speed?",
    test_badge: "Harmonic Mean",
    test_question: "Is average speed just (60 + 20) ÷ 2 = 40 mph?",
    proof_count_text: "Nope! The true average speed is 30 MPH!",
    item_1_label: "60 miles @ 60mph = 1 hr",
    item_2_label: "60 miles @ 20mph = 3 hrs",
    item_3_label: "120 miles total",
    item_4_label: "4 hrs = 30 mph!",
    formula_badge: "Total Distance ÷ Total Time",
    formula_title: "Harmonic Average = 2ab / (a + b)",
    card1_title: "Simple Average",
    card1_val: "40 mph",
    card1_sub: "(60 + 20) / 2 (Wrong!)",
    card2_title: "Real Average",
    card2_val: "30 mph",
    card2_sub: "2 × 60 × 20 / (60 + 20) = 30",
    rule_title: "You Spent 3× Longer Slow!",
    rule_body: "Because you spent 3 hours driving 20mph, the slow speed dominates!",
    aha_emoji: "🚗⏱️",
    aha_title: "Average is 30 mph, Not 40!",
    aha_subtitle: "Time weighting always pulls average speed down toward the slower trip!",
    cta_text: "Share this before your next road trip! ➜"
  },
  {
    puzzle_id: "gauss_trick",
    category: "Rapid Arithmetic",
    emotion: "Wonder",
    difficulty: "Easy",
    badge_text: "Carl Gauss's 1787 Secret",
    handwritten_hook: "A 7-year-old solved this in 5s!",
    hook_title: "Can you add 1 + 2 + 3 + ... all the way to 100 in 5 seconds?",
    test_badge: "Pairing Symmetry",
    test_question: "Pair 1 + 100 = 101. Pair 2 + 99 = 101. Pair 3 + 98 = 101...",
    proof_count_text: "There are 50 pairs of 101 = 5,050!",
    item_1_label: "1 + 100 = 101",
    item_2_label: "2 + 99 = 101",
    item_3_label: "50 such pairs",
    item_4_label: "50 × 101 = 5050!",
    formula_badge: "Gauss Summation",
    formula_title: "Sum = N × (N + 1) ÷ 2",
    card1_title: "Calculation",
    card1_val: "100 × 101 ÷ 2",
    card1_sub: "10,100 ÷ 2",
    card2_title: "Final Sum",
    card2_val: "5,050",
    card2_sub: "Instant arithmetic magic",
    rule_title: "Fold The Numbers In Half!",
    rule_body: "Every complementary pair adds to 101!",
    aha_emoji: "✨🔢",
    aha_title: "Total is Exactly 5,050!",
    aha_subtitle: "Try it to 10: 5 pairs of 11 = 55! Works for any N!",
    cta_text: "Did you know Gauss's story? ➜"
  }
];

// Helper to get fresh random ideas
function generateFreshIdeas(count = 8) {
  const combined = [...IDEA_VAULT, ...getPuzzles()];
  // Deduplicate by puzzle_id
  const uniqueMap = new Map();
  combined.forEach(p => {
    uniqueMap.set(p.puzzle_id, {
      ...p,
      countdown_heading: p.countdown_heading || "What's your answer? Guess before time runs out!",
      kid_explainer_heading: p.kid_explainer_heading || "The Simple Kid-Friendly Trick!",
      kid_explainer_text: p.kid_explainer_text || (p.rule_body || "Break it down simply step by step!"),
      youtube_handle: p.youtube_handle || "Bloxxerman1",
      instagram_handle: p.instagram_handle || "Mysteryuntoldd",
      channel_handle: p.channel_handle || "YouTube: Bloxxerman1 • Instagram: Mysteryuntoldd",
      bgm_theme: p.bgm_theme || "curious_mystery",
      bgm_src: `assets/${p.bgm_theme || "curious_mystery"}.mp3`
    });
  });
  const uniqueList = Array.from(uniqueMap.values());
  const shuffled = uniqueList.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

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

function getPuzzleSocialMetadata(puzzleId, puzzle = null) {
  if (SOCIAL_METADATA_VAULT[puzzleId]) {
    const meta = SOCIAL_METADATA_VAULT[puzzleId];
    return {
      title: meta.crisp_title,
      description: meta.description_lines.join("\n"),
      hashtags: meta.hashtags.join(" "),
      hashtag_list: meta.hashtags
    };
  }
  const hook = puzzle ? (puzzle.hook_title || puzzle.handwritten_hook || "Can You Solve This Viral Math Trap?") : "Can You Solve This Viral Math Trap?";
  const rule = puzzle ? (puzzle.kid_explainer_heading || puzzle.rule_title || "The Secret Mathematical Trick Revealed!") : "The Secret Mathematical Trick Revealed!";
  const expl = puzzle ? (puzzle.kid_explainer_text || puzzle.rule_body || "Watch step by step as we break down the proof.") : "Watch step by step as we break down the proof.";
  return {
    title: `${hook} 🤯📐`,
    description: `${rule}\n${expl}\n\n🔔 Subscribe to @Bloxxerman1 & follow @Mysteryuntoldd for daily mind-bending puzzles!`,
    hashtags: "#MathShorts #ViralMath #BrainTeaser #STEM #MysteryUntold #Bloxxerman #LearnOnShorts",
    hashtag_list: ["#MathShorts", "#ViralMath", "#BrainTeaser", "#STEM", "#MysteryUntold", "#Bloxxerman"]
  };
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Get 7-8 puzzle options (always supports fresh roll)
  if (pathname === '/api/puzzles' && req.method === 'GET') {
    const isFresh = parsedUrl.searchParams.get('fresh') === 'true';
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '8', 10);
    const options = isFresh ? generateFreshIdeas(limit) : getPuzzles().slice(0, limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: options.length, puzzles: options }));
    return;
  }

  // API: Get all puzzles
  if (pathname === '/api/puzzles/all' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, puzzles: getPuzzles() }));
    return;
  }

  // API: Dedicated Idea Generator Tab Endpoint (generates 8 brand-new ideas)
  if (pathname === '/api/ideas/generate' && req.method === 'GET') {
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '8', 10);
    const ideas = generateFreshIdeas(limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: ideas.length, ideas }));
    return;
  }

  // API: Get history of all rendered MP4 outputs
  if (pathname === '/api/renders/history' && req.method === 'GET') {
    const history = [];

    const titleMap = {
      'pizza_area': 'Pizza Area Paradox',
      'eleven_trick': '11x Mental Multiplication',
      'discount_trap': 'Store Discount Trap',
      'squares_grid': 'Chessboard Squares Counter',
      'birthday_paradox': 'The Birthday Paradox',
      'paper_moon': 'Paper Moon Fold',
      'water_lily': 'The Water Lily Pond',
      'handshake_problem': 'The Handshake Problem',
      'bat_and_ball': 'Bat and Ball Riddle',
      'nine_table_trick': 'Symmetry of 9 Trick',
      'percent_stacked': '50% + 50% Off Trap',
      'clock_angle': 'Clock Hands Angle Paradox',
      'monty_hall': 'Monty Hall Door Switch',
      'rope_earth': 'Rope Around Earth',
      'square_ending_5': 'Square Ending in 5 in 2s',
      'cube_paint': '3D Painted Cube Core',
      'average_speed': 'Average Speed Trap',
      'gauss_trick': 'Gauss 1 to 100 Sum'
    };

    // Check root puzzle-output.mp4
    const rootMp4 = path.join(__dirname, 'puzzle-output.mp4');
    if (fs.existsSync(rootMp4)) {
      const stat = fs.statSync(rootMp4);
      history.push({
        id: 'featured_master',
        filename: 'puzzle-output.mp4',
        title: 'Pizza Area Paradox (Featured Reel)',
        puzzle_id: 'pizza_area',
        url: '/puzzle-output.mp4',
        downloadUrl: '/puzzle-output.mp4',
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
        createdAt: stat.mtimeMs,
        createdFormatted: new Date(stat.mtimeMs).toLocaleString(),
        socialMeta: getPuzzleSocialMetadata('pizza_area')
      });
    }

    // Scan renders directory
    if (fs.existsSync(rendersDir)) {
      const files = fs.readdirSync(rendersDir).filter(f => f.endsWith('.mp4'));
      files.forEach(filename => {
        const fullPath = path.join(rendersDir, filename);
        const stat = fs.statSync(fullPath);
        const baseName = filename.replace('.mp4', '');
        const parts = baseName.split('_');
        const puzzleKey = parts.length > 1 ? parts.slice(0, -1).join('_') : baseName;
        const title = titleMap[puzzleKey] || puzzleKey.replace(/_/g, ' ').toUpperCase();

        history.push({
          id: baseName,
          filename,
          title,
          puzzle_id: puzzleKey,
          url: `/renders/${filename}`,
          downloadUrl: `/api/download-file/${filename}`,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
          createdAt: stat.mtimeMs,
          createdFormatted: new Date(stat.mtimeMs).toLocaleString(),
          socialMeta: getPuzzleSocialMetadata(puzzleKey)
        });
      });
    }

    // Sort newest first
    history.sort((a, b) => b.createdAt - a.createdAt);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: history.length, history }));
    return;
  }

  // Serve root puzzle-output.mp4 directly
  if (pathname === '/puzzle-output.mp4' && req.method === 'GET') {
    const rootMp4 = path.join(__dirname, 'puzzle-output.mp4');
    if (fs.existsSync(rootMp4)) {
      const stat = fs.statSync(rootMp4);
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="pizza-area-paradox.mp4"'
      });
      fs.createReadStream(rootMp4).pipe(res);
      return;
    }
  }

  // API: Initiate Render
  if (pathname === '/api/render' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const puzzle = payload.puzzle || getPuzzles()[0];
        
        // Guarantee audio source is accurately mapped to the selected background score theme
        const selectedTheme = puzzle.bgm_theme || 'curious_mystery';
        puzzle.bgm_theme = selectedTheme;
        puzzle.bgm_src = `assets/${selectedTheme}.mp3`;

        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const outputFilename = `${puzzle.puzzle_id || 'puzzle'}_${Date.now()}.mp4`;
        const outputPath = path.join(rendersDir, outputFilename);
        const tempVarFile = path.join(__dirname, `.temp_vars_${jobId}.json`);

        fs.writeFileSync(tempVarFile, JSON.stringify(puzzle, null, 2));

        const jobInfo = {
          id: jobId,
          puzzleId: puzzle.puzzle_id,
          puzzleTitle: puzzle.hook_title,
          status: 'running',
          progress: 5,
          stage: 'Initializing HyperFrames Engine',
          outputFilename,
          outputPath,
          videoUrl: `/renders/${outputFilename}`,
          downloadUrl: `/api/download/${jobId}`,
          logs: [],
          startTime: Date.now(),
          socialMeta: getPuzzleSocialMetadata(puzzle.puzzle_id, puzzle)
        };

        jobs.set(jobId, jobInfo);

        // Spawn HyperFrames render process
        const renderProc = spawn('npx', [
          'hyperframes',
          'render',
          '--variables-file',
          tempVarFile,
          '--output',
          outputPath
        ], {
          cwd: __dirname,
          shell: true,
          env: process.env
        });

        renderProc.stdout.on('data', data => {
          const text = data.toString();
          jobInfo.logs.push(text);

          // Parse progress updates
          const matchProgress = text.match(/@hf-progress\s*({.*})/);
          if (matchProgress) {
            try {
              const pData = JSON.parse(matchProgress[1]);
              if (pData.pct) jobInfo.progress = Math.max(jobInfo.progress, pData.pct);
              if (pData.code) {
                if (pData.code === 'compile') jobInfo.stage = 'Compiling DOM Composition (5%)';
                else if (pData.code === 'start_browsers') jobInfo.stage = 'Calibrating Chrome Workers (25%)';
                else if (pData.code === 'capture') jobInfo.stage = `Capturing Frames: ${pData.done || ''}/${pData.total || 1110} (${pData.pct}%)`;
                else if (pData.code === 'encode') jobInfo.stage = `Encoding H.264 Video: (${pData.pct}%)`;
                else if (pData.code === 'assemble') jobInfo.stage = 'Assembling Final MP4 Container (95%)';
              }
            } catch (err) {}
          }
        });

        renderProc.stderr.on('data', data => {
          jobInfo.logs.push(data.toString());
        });

        renderProc.on('close', code => {
          if (fs.existsSync(tempVarFile)) {
            try { fs.unlinkSync(tempVarFile); } catch (e) {}
          }
          if (code === 0 && fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            jobInfo.status = 'completed';
            jobInfo.progress = 100;
            jobInfo.stage = 'Render Complete & Verified';
            jobInfo.fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            jobInfo.completedTime = Date.now();
            jobInfo.durationSec = ((jobInfo.completedTime - jobInfo.startTime) / 1000).toFixed(1);
          } else {
            jobInfo.status = 'failed';
            jobInfo.error = `Process exited with error code ${code}`;
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, job: jobInfo }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API: Check Render Status
  if (pathname.startsWith('/api/render-status/') && req.method === 'GET') {
    const jobId = pathname.replace('/api/render-status/', '');
    const job = jobs.get(jobId);
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Job not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, job }));
    return;
  }

  // API: Delete rendered video file
  if (pathname.startsWith('/api/renders/delete/') && req.method === 'DELETE') {
    const filename = path.basename(pathname.replace('/api/renders/delete/', ''));
    if (!filename.endsWith('.mp4')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid file format' }));
      return;
    }
    const targetPath = path.join(rendersDir, filename);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Render deleted successfully' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'File not found' }));
    }
    return;
  }

  // API: Direct Attachment Download for named files
  if (pathname.startsWith('/api/download-file/') && req.method === 'GET') {
    const filename = path.basename(pathname.replace('/api/download-file/', ''));
    const filePath = path.join(rendersDir, filename);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Video file not found.');
      return;
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${filename}"`
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (pathname.startsWith('/api/download/') && req.method === 'GET') {
    const jobId = pathname.replace('/api/download/', '');
    const job = jobs.get(jobId);
    if (!job || !fs.existsSync(job.outputPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Video file not found or not ready yet.');
      return;
    }
    const stat = fs.statSync(job.outputPath);
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${job.puzzleId || 'math-puzzle'}.mp4"`
    });
    fs.createReadStream(job.outputPath).pipe(res);
    return;
  }

  // Serve static videos from /renders/ with HTTP Range support for video players
  if (pathname.startsWith('/renders/') && req.method === 'GET') {
    const filename = path.basename(pathname);
    const filePath = path.join(rendersDir, filename);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Video Not Found');
      return;
    }
    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  // Serve the initial demo video if requested
  if (pathname === '/video/default') {
    const defaultVideoPath = path.join(__dirname, 'puzzle-output.mp4');
    if (fs.existsSync(defaultVideoPath)) {
      const stat = fs.statSync(defaultVideoPath);
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(defaultVideoPath).pipe(res);
      return;
    }
  }

  // Serve composition index.html directly for live preview iframe
  if (pathname === '/composition/preview') {
    const indexPath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  // Serve audio/video assets from root assets/ folder
  if (pathname.startsWith('/assets/') || pathname.startsWith('/composition/assets/')) {
    const assetFilename = path.basename(pathname);
    const assetFilePath = path.join(__dirname, 'assets', assetFilename);
    if (fs.existsSync(assetFilePath) && fs.statSync(assetFilePath).isFile()) {
      const ext = path.extname(assetFilePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes' });
      fs.createReadStream(assetFilePath).pipe(res);
      return;
    }
  }

  // Serve static files from public/
  let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================`);
  console.log(`✨ Math Puzzle Studio Server Running on:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});

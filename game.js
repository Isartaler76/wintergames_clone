// Winter Games - Ski Jump Clone
// (c) 2025 - Based on Epyx Winter Games (1985)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const STATES = {
    TITLE_SCREEN: 'title',
    OPENING_CEREMONY: 'ceremony',
    PLAYER_COUNT_SELECT: 'playerCount',
    PLAYER_SETUP: 'playerSetup',
    GAME_INTRO: 'gameIntro',
    SKI_READY: 'skiReady',
    SKI_APPROACH: 'skiApproach',
    SKI_TAKEOFF: 'skiTakeoff',
    SKI_FLIGHT: 'skiFlight',
    SKI_LANDING: 'skiLanding',
    SKI_SCORING: 'skiScoring',
    ROUND_RESULTS: 'roundResults',
    VICTORY_CEREMONY: 'victory'
};

// Game Variables
let gameState = STATES.TITLE_SCREEN;
let players = [];
let currentPlayerIndex = 0;
let currentRound = 1;
let maxRounds = 2;

// Input handling
const keys = {};
let lastSpacePress = 0;
const SPACE_DEBOUNCE = 300;

// Player setup variables
let numPlayers = 1;
let setupPlayerIndex = 0;
let currentNameInput = '';
let currentNationSelect = 0;

const NATIONS = [
    { name: 'USA', colors: ['#0052B4', '#FFFFFF', '#E4002B'] },
    { name: 'GER', colors: ['#000000', '#DD0000', '#FFCE00'] },
    { name: 'AUT', colors: ['#ED2939', '#FFFFFF', '#ED2939'] },
    { name: 'CAN', colors: ['#FF0000', '#FFFFFF', '#FF0000'] },
    { name: 'FRA', colors: ['#002395', '#FFFFFF', '#ED2939'] },
    { name: 'SUI', colors: ['#FF0000', '#FFFFFF', '#FF0000'] },
    { name: 'NOR', colors: ['#EF2B2D', '#FFFFFF', '#002868'] },
    { name: 'JPN', colors: ['#FFFFFF', '#BC002D', '#FFFFFF'] }
];

// Ski Jump variables (extended for authentic gameplay)
let skier = {
    x: 100,
    y: 150,
    velocityX: 0,
    velocityY: 0,
    angle: 0,
    balance: 0,
    leanForwardBack: 0,     // -100 (too far back) to +100 (too far forward)
    kneePosition: 0,         // 0 = optimal, +100 = knees too close
    skisCrossed: 0,          // 0 = parallel (good), +100 = crossed (bad)
    speed: 0,
    distance: 0,
    stylePoints: 100,
    inAir: false,
    landed: false,
    takeoffTime: 0,
    takeoffQuality: 0
};

// Animation variables
let animFrame = 0;
let flameFrame = 0;
let titleBlink = 0;

// Audio Context (Web Audio API for 8-bit sounds)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Helper Functions
function beep(frequency = 440, duration = 100, volume = 0.3) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.value = volume;
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playMelody(notes) {
    notes.forEach((note, index) => {
        setTimeout(() => beep(note.freq, note.duration, note.volume || 0.3), note.delay);
    });
}

function playAnthemMelody() {
    const anthem = [
        { freq: 523, duration: 300, delay: 0, volume: 0.2 },
        { freq: 587, duration: 300, delay: 350, volume: 0.2 },
        { freq: 659, duration: 300, delay: 700, volume: 0.2 },
        { freq: 698, duration: 500, delay: 1050, volume: 0.2 },
        { freq: 659, duration: 300, delay: 1600, volume: 0.2 },
        { freq: 587, duration: 300, delay: 1950, volume: 0.2 },
        { freq: 523, duration: 600, delay: 2300, volume: 0.2 }
    ];
    playMelody(anthem);
}

// Drawing Functions
function clear() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPixelText(text, x, y, color = '#FFF', size = 2) {
    ctx.fillStyle = color;
    ctx.font = `${size * 8}px "Courier New", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
}

function drawCenteredText(text, y, color = '#FFF', size = 2) {
    ctx.fillStyle = color;
    ctx.font = `${size * 8}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y);
}

function drawBox(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawRect(x, y, w, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

// Title Screen
function drawTitleScreen() {
    clear();

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#60a5fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 200);

    // Snow mountains
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(150, 80);
    ctx.lineTo(300, 150);
    ctx.lineTo(0, 150);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(200, 150);
    ctx.lineTo(350, 60);
    ctx.lineTo(500, 150);
    ctx.lineTo(200, 150);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(400, 150);
    ctx.lineTo(550, 90);
    ctx.lineTo(640, 150);
    ctx.lineTo(400, 150);
    ctx.fill();

    // Title
    drawCenteredText('EPYX', 100, '#FF00FF', 2);
    drawCenteredText('PRESENTS', 130, '#00FFFF', 1);

    // Main title with retro style
    ctx.fillStyle = '#FF00FF';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WINTER', canvas.width / 2, 220);
    ctx.fillText('GAMES', canvas.width / 2, 270);

    ctx.fillStyle = '#00FFFF';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('BY ACTION GRAPHICS', canvas.width / 2, 310);

    // Copyright
    drawCenteredText('© 1985 EPYX, Inc.', 350, '#888', 1);

    // Blinking prompt
    titleBlink++;
    if (Math.floor(titleBlink / 30) % 2 === 0) {
        drawCenteredText('PRESS SPACE TO START', 420, '#FFFF00', 2);
    }

    // Olympics rings hint
    const ringColors = ['#0085C7', '#000', '#EE334E', '#FCB131', '#00A651'];
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = ringColors[i];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(220 + i * 40, 380, 15, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Opening Ceremony - Flame Animation
function drawOpeningCeremony() {
    clear();

    // Sky
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, canvas.width, 200);

    // Stadium background
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(i * 80, 50, 60, 100);
    }

    // Ground
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 200, canvas.width, canvas.height - 200);

    // Olympic cauldron
    ctx.fillStyle = '#808080';
    ctx.fillRect(280, 150, 80, 20);
    ctx.fillRect(300, 120, 40, 30);
    ctx.fillRect(310, 100, 20, 20);

    // Animated flame
    flameFrame++;
    const flameHeight = 40 + Math.sin(flameFrame / 5) * 10;
    const flameColors = ['#FF4500', '#FF6347', '#FFD700', '#FFFF00'];

    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = flameColors[i];
        const offset = Math.sin(flameFrame / 3 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(320 + offset, 100);
        ctx.lineTo(310 + offset, 100 - flameHeight + i * 10);
        ctx.lineTo(330 + offset, 100 - flameHeight + i * 10);
        ctx.closePath();
        ctx.fill();
    }

    drawCenteredText('OPENING CEREMONY', 280, '#FFFF00', 3);

    if (flameFrame > 180) {
        drawCenteredText('PRESS SPACE', 420, '#FFF', 2);
    }
}

// Player Count Selection
function drawPlayerCountSelect() {
    clear();

    drawCenteredText('SELECT NUMBER OF PLAYERS', 150, '#00FFFF', 2);

    for (let i = 1; i <= 4; i++) {
        const y = 220 + i * 40;
        const color = (i === numPlayers) ? '#FFFF00' : '#FFFFFF';
        const prefix = (i === numPlayers) ? '> ' : '  ';
        drawCenteredText(prefix + i + ' PLAYER' + (i > 1 ? 'S' : ''), y, color, 2);
    }

    drawCenteredText('USE UP/DOWN ARROWS, SPACE TO SELECT', 420, '#888', 1);
}

// Player Setup Screen
function drawPlayerSetup() {
    clear();

    const player = players[setupPlayerIndex];

    drawCenteredText(`PLAYER ${setupPlayerIndex + 1} SETUP`, 80, '#00FFFF', 2);

    // Name input
    drawPixelText('NAME:', 150, 180, '#FFF', 2);
    drawBox(250, 165, 250, 25, '#222');
    drawPixelText(currentNameInput + '_', 260, 180, '#FFFF00', 2);

    // Nation selection
    drawPixelText('NATION:', 150, 250, '#FFF', 2);

    const nation = NATIONS[currentNationSelect];
    drawPixelText('< ' + nation.name + ' >', 260, 250, '#FFFF00', 2);

    // Flag representation
    for (let i = 0; i < nation.colors.length; i++) {
        ctx.fillStyle = nation.colors[i];
        ctx.fillRect(260 + i * 30, 270, 30, 20);
    }

    drawCenteredText('TYPE NAME, USE LEFT/RIGHT FOR NATION', 380, '#888', 1);
    drawCenteredText('PRESS ENTER WHEN DONE', 410, '#888', 1);
}

// Ski Jump - Mountain Background (C64 Style)
function drawMountainBackground() {
    // Sky with C64 blue gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, '#6C5EB5');  // C64 purple-blue
    gradient.addColorStop(0.5, '#7869C4');
    gradient.addColorStop(1, '#9C8DD5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 180);

    // Pixelated clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const cloudPositions = [
        [80, 30, 40, 8], [150, 45, 35, 7], [280, 25, 50, 9],
        [400, 50, 45, 8], [520, 35, 38, 7]
    ];
    cloudPositions.forEach(([x, y, w, h]) => {
        ctx.fillRect(x, y, w, h);
        ctx.fillRect(x + 5, y - 3, w - 10, h);
        ctx.fillRect(x + 10, y - 5, w - 20, h);
    });

    // Brown/golden mountains (C64 style)
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(-20, 160);
    ctx.lineTo(100, 70);
    ctx.lineTo(200, 120);
    ctx.lineTo(280, 160);
    ctx.lineTo(-20, 160);
    ctx.fill();

    ctx.fillStyle = '#9C825E';
    ctx.beginPath();
    ctx.moveTo(180, 160);
    ctx.lineTo(320, 50);
    ctx.lineTo(480, 130);
    ctx.lineTo(550, 160);
    ctx.lineTo(180, 160);
    ctx.fill();

    ctx.fillStyle = '#A0896F';
    ctx.beginPath();
    ctx.moveTo(400, 160);
    ctx.lineTo(550, 80);
    ctx.lineTo(660, 160);
    ctx.lineTo(400, 160);
    ctx.fill();

    // Snow caps with texture
    ctx.fillStyle = '#FFFFFF';
    // Mountain 1
    ctx.beginPath();
    ctx.moveTo(85, 85);
    ctx.lineTo(100, 70);
    ctx.lineTo(115, 85);
    ctx.lineTo(110, 90);
    ctx.lineTo(90, 90);
    ctx.closePath();
    ctx.fill();

    // Mountain 2
    ctx.beginPath();
    ctx.moveTo(300, 65);
    ctx.lineTo(320, 50);
    ctx.lineTo(340, 65);
    ctx.lineTo(335, 75);
    ctx.lineTo(305, 75);
    ctx.closePath();
    ctx.fill();

    // Mountain 3
    ctx.beginPath();
    ctx.moveTo(535, 95);
    ctx.lineTo(550, 80);
    ctx.lineTo(565, 95);
    ctx.lineTo(560, 105);
    ctx.lineTo(540, 105);
    ctx.closePath();
    ctx.fill();

    // Add some darker shading on mountains
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.moveTo(100, 70);
    ctx.lineTo(150, 100);
    ctx.lineTo(200, 120);
    ctx.lineTo(280, 160);
    ctx.lineTo(200, 160);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(320, 50);
    ctx.lineTo(400, 100);
    ctx.lineTo(480, 130);
    ctx.lineTo(550, 160);
    ctx.lineTo(450, 160);
    ctx.closePath();
    ctx.fill();

    // Green trees at base
    ctx.fillStyle = '#4A7C59';
    for (let i = 0; i < 15; i++) {
        const x = 20 + i * 45;
        const y = 155 + (Math.sin(i) * 5);
        // Tree triangles
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y + 12);
        ctx.lineTo(x + 6, y + 12);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.lineTo(x - 5, y + 16);
        ctx.lineTo(x + 5, y + 16);
        ctx.closePath();
        ctx.fill();
    }
}

// Ski Jump - Approach Phase
function drawSkiApproach() {
    clear();
    drawMountainBackground();

    // Jump tower structure (left side) - like in original
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(15, 80, 50, 180);

    // Tower scaffolding details
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    // Vertical supports
    for (let i = 0; i < 4; i++) {
        const x = 20 + i * 12;
        ctx.beginPath();
        ctx.moveTo(x, 80);
        ctx.lineTo(x, 260);
        ctx.stroke();
    }
    // Horizontal supports
    for (let i = 0; i < 9; i++) {
        const y = 85 + i * 20;
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(65, y);
        ctx.stroke();
    }
    // Diagonal supports
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(50, 140);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(20, 140);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(50, 220);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(20, 220);
    ctx.stroke();

    // Platform at top
    ctx.fillStyle = '#A0826D';
    ctx.fillRect(10, 75, 60, 8);

    // Ski jump ramp (snow covered)
    ctx.fillStyle = '#F0F0F0';
    ctx.beginPath();
    ctx.moveTo(60, 140);
    ctx.lineTo(520, 380);
    ctx.lineTo(520, 400);
    ctx.lineTo(45, 160);
    ctx.closePath();
    ctx.fill();

    // Ramp structure beneath (brown wooden supports)
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(520, 400);
    ctx.lineTo(520, 420);
    ctx.lineTo(45, 180);
    ctx.closePath();
    ctx.fill();

    // Ramp details (horizontal lines for texture)
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(60 + i * 40, 140 + i * 20);
        ctx.lineTo(100 + i * 40, 140 + i * 20);
        ctx.stroke();
    }

    // Support structure lines
    ctx.strokeStyle = '#6B5511';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const baseX = 80 + i * 55;
        const baseY = 160 + i * 30;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX - 10, baseY + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(baseX + 20, baseY);
        ctx.lineTo(baseX + 30, baseY + 30);
        ctx.stroke();
    }

    // Distance marker flag at landing
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(485, 340, 3, 40);
    ctx.fillRect(485, 340, 20, 12);

    // Skier
    const skierX = skier.x;
    const skierY = 140 + (skier.x - 60) * 0.52;

    // Skier body (crouched position)
    ctx.fillStyle = '#0050C0';  // Blue suit
    ctx.fillRect(skierX - 6, skierY - 12, 14, 12);

    // Head with helmet
    ctx.fillStyle = '#FFD0A0';  // Skin tone
    ctx.beginPath();
    ctx.arc(skierX, skierY - 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(skierX, skierY - 17, 6, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Skis (parallel)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(skierX - 4, skierY);
    ctx.lineTo(skierX - 10, skierY + 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(skierX + 4, skierY);
    ctx.lineTo(skierX + 10, skierY + 8);
    ctx.stroke();

    // Poles
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(skierX - 8, skierY - 8);
    ctx.lineTo(skierX - 12, skierY + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(skierX + 8, skierY - 8);
    ctx.lineTo(skierX + 12, skierY + 2);
    ctx.stroke();

    // Black bar at bottom for HUD (like C64 original)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 450, canvas.width, 30);

    // HUD - Player name on left (like original)
    const currentPlayer = players[currentPlayerIndex];
    drawPixelText(currentPlayer.name.toUpperCase(), 10, 468, '#FFFF00', 2);
    drawPixelText(currentPlayer.nation, 10 + currentPlayer.name.length * 16 + 10, 468, '#FFFFFF', 2);

    // HUD - Speed on right (like original)
    const speedText = `${Math.floor(skier.speed).toString().padStart(3, ' ')} KM/H`;
    drawPixelText(speedText, 480, 468, '#FFFFFF', 2);

    if (skier.speed === 0) {
        drawCenteredText('PRESS SPACE TO START!', 250, '#FFFF00', 2);
    } else if (skierX > 420 && skierX < 480) {
        drawCenteredText('PRESS SPACE TO JUMP!', 250, '#FF0000', 2);
    }
}

// Ski Jump - Flight Phase
function drawSkiFlight() {
    clear();

    // Sky with C64 colors
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#6C5EB5');
    gradient.addColorStop(1, '#9C8DD5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 300);

    // Distant mountains
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(200, 120);
    ctx.lineTo(400, 180);
    ctx.lineTo(640, 150);
    ctx.lineTo(640, 300);
    ctx.lineTo(0, 300);
    ctx.closePath();
    ctx.fill();

    // Snow on mountains
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(180, 135);
    ctx.lineTo(200, 120);
    ctx.lineTo(220, 135);
    ctx.fill();

    // Ground/landing area
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 380, canvas.width, 100);

    // Landing slope (angled)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.lineTo(640, 350);
    ctx.lineTo(640, 480);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();

    // Skier in air
    ctx.save();
    ctx.translate(skier.x, skier.y);
    ctx.rotate(skier.angle);

    // Body
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(-8, -5, 25, 8);

    // Head
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-10, -3, 6, 0, Math.PI * 2);
    ctx.fill();

    // Skis
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(35, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, 2);
    ctx.lineTo(35, 2);
    ctx.stroke();

    ctx.restore();

    // HUD - Top left
    const currentPlayer = players[currentPlayerIndex];
    drawPixelText(currentPlayer.name, 10, 25, '#FFFF00', 2);
    drawPixelText(`DIST: ${Math.floor(skier.distance)}m`, 10, 50, '#FFF', 1);
    drawPixelText(`STYLE: ${Math.floor(skier.stylePoints)}`, 10, 70, '#00FFFF', 1);

    // POSTURE DISPLAY - Top right (like original!)
    const postureX = 520;
    const postureY = 20;

    // Posture box background
    ctx.fillStyle = '#000';
    ctx.fillRect(postureX - 5, postureY - 5, 110, 100);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(postureX - 5, postureY - 5, 110, 100);

    // Draw augmented skier showing posture
    ctx.save();
    ctx.translate(postureX + 35, postureY + 50);

    // Apply posture transformations
    const leanAngle = skier.leanForwardBack * 0.0015;
    ctx.rotate(leanAngle);

    // Skier body
    ctx.fillStyle = '#0050C0';
    const bodyWidth = 20 - skier.kneePosition * 0.1;  // Knees affect width
    ctx.fillRect(-10, -8, bodyWidth, 16);

    // Head
    ctx.fillStyle = '#FFD0A0';
    ctx.beginPath();
    ctx.arc(-12, -5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-12, -6, 9, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Arms - close to body when perfect
    const armSpread = Math.abs(skier.leanForwardBack) * 0.15 + Math.abs(skier.kneePosition) * 0.1;
    ctx.strokeStyle = '#0050C0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-8 - armSpread, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-8 - armSpread, -8);
    ctx.stroke();

    // Skis - show if crossed
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    const skiOffset = 3 + skier.skisCrossed * 0.05;

    ctx.beginPath();
    ctx.moveTo(5, -skiOffset);
    ctx.lineTo(30, -skiOffset - skier.skisCrossed * 0.08);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, skiOffset);
    ctx.lineTo(30, skiOffset + skier.skisCrossed * 0.08);
    ctx.stroke();

    ctx.restore();

    // Posture indicators (text warnings)
    let warningY = postureY + 110;
    if (Math.abs(skier.leanForwardBack) > 30) {
        const warning = skier.leanForwardBack > 0 ? 'TOO FAR FORWARD!' : 'TOO FAR BACK!';
        drawPixelText(warning, postureX - 30, warningY, '#FF0000', 1);
        warningY += 15;
    }
    if (skier.kneePosition > 30) {
        drawPixelText('KNEES TOO CLOSE!', postureX - 30, warningY, '#FF0000', 1);
        warningY += 15;
    }
    if (skier.skisCrossed > 30) {
        drawPixelText('SKIS CROSSED!', postureX - 20, warningY, '#FF0000', 1);
    }

    // Control hints at bottom
    drawPixelText('LEFT/RIGHT: Lean  UP/DOWN: Knees/Skis', 150, 465, '#FFFF00', 1);
}

// Ski Jump - Landing Phase
function drawSkiLanding() {
    clear();

    // Sky with C64 colors
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, '#6C5EB5');
    gradient.addColorStop(1, '#9C8DD5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 180);

    // Mountains in background
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(150, 80);
    ctx.lineTo(300, 120);
    ctx.lineTo(450, 90);
    ctx.lineTo(640, 130);
    ctx.lineTo(640, 180);
    ctx.lineTo(0, 180);
    ctx.closePath();
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(135, 92);
    ctx.lineTo(150, 80);
    ctx.lineTo(165, 92);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(435, 100);
    ctx.lineTo(450, 90);
    ctx.lineTo(465, 100);
    ctx.fill();

    // Stadium/Tribüne structure (like in original)
    ctx.fillStyle = '#A0826D';
    ctx.fillRect(0, 180, 640, 40);

    // Tribüne details
    ctx.fillStyle = '#8B6914';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect(i * 32, 185, 28, 35);
    }

    // Railing
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(640, 220);
    ctx.stroke();

    // Flags at stadium (Olympic-style, like in second reference image)
    const flagPositions = [150, 250, 350, 450, 550];
    const flagColors = ['#0085C7', '#EE334E', '#FCB131', '#00A651', '#FFFFFF'];

    flagPositions.forEach((x, i) => {
        // Flagpole
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 140);
        ctx.lineTo(x, 180);
        ctx.stroke();

        // Flag (waving)
        ctx.fillStyle = flagColors[i];
        ctx.beginPath();
        ctx.moveTo(x, 140);
        ctx.lineTo(x + 25, 145);
        ctx.lineTo(x + 25, 155);
        ctx.lineTo(x, 160);
        ctx.closePath();
        ctx.fill();

        // Flag border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Landing area - white snow
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 220, 640, 80);

    // Landing slope lines (to show perspective)
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const y = 230 + i * 8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
    }

    // Distance markers on side
    ctx.fillStyle = '#000';
    ctx.font = '14px "Courier New", monospace';
    for (let i = 70; i <= 110; i += 10) {
        const y = 240 + (i - 70) * 5;
        ctx.fillText(`${i}M`, 580, y);
    }

    // Takeoff platform structure (visible in distance)
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(50, 260, 60, 40);

    // Platform details
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(55 + i * 15, 260);
        ctx.lineTo(55 + i * 15, 300);
        ctx.stroke();
    }

    // Skier on ground
    ctx.fillStyle = '#0050C0';
    ctx.fillRect(skier.x - 5, skier.y - 15, 10, 15);

    ctx.fillStyle = '#FFD0A0';
    ctx.beginPath();
    ctx.arc(skier.x, skier.y - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Black bar at bottom for HUD
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, canvas.width, 180);

    // Results
    const currentPlayer = players[currentPlayerIndex];
    drawCenteredText(`${currentPlayer.name} - ROUND ${currentRound}`, 340, '#FFFF00', 2);
    drawCenteredText(`DISTANCE: ${Math.floor(skier.distance)}m (×3 = ${Math.floor(skier.distance * 3)})`, 380, '#FFFFFF', 2);
    drawCenteredText(`STYLE POINTS: ${skier.stylePoints.toFixed(1)}`, 420, '#00FFFF', 2);

    const totalScore = skier.distance * 3 + skier.stylePoints;
    drawCenteredText(`TOTAL: ${totalScore.toFixed(1)} POINTS`, 450, '#00FF00', 3);

    setTimeout(() => {
        if (gameState === STATES.SKI_LANDING) {
            beep(523, 200);
        }
    }, 500);
}

// Round Results
function drawRoundResults() {
    clear();

    drawCenteredText(`ROUND ${currentRound} RESULTS`, 60, '#00FFFF', 3);

    // Sort players by total score
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

    let y = 140;
    sortedPlayers.forEach((player, index) => {
        const color = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#FFF';
        drawPixelText(`${index + 1}. ${player.name} (${player.nation})`, 100, y, color, 2);
        drawPixelText(`${player.totalScore.toFixed(1)} pts`, 450, y, color, 2);
        y += 40;
    });

    if (currentRound < maxRounds) {
        drawCenteredText('NEXT ROUND...', 420, '#FFFF00', 2);
    } else {
        drawCenteredText('FINAL RESULTS!', 420, '#00FF00', 2);
    }

    drawCenteredText('PRESS SPACE', 450, '#888', 1);
}

// Victory Ceremony
function drawVictoryCeremony() {
    clear();

    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, 300);

    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 300, canvas.width, 180);

    // Sort players
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

    // Podium
    const podiumX = 200;
    const podiumY = 350;

    // 1st place (center, highest)
    if (sortedPlayers[0]) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(podiumX + 80, podiumY - 30, 80, 130);
        drawCenteredText('1', podiumX + 120, podiumY + 50, '#000', 2);

        // Winner
        ctx.fillStyle = sortedPlayers[0].nation === 'USA' ? '#0000FF' : '#FF0000';
        ctx.fillRect(podiumX + 105, podiumY - 60, 30, 30);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(podiumX + 120, podiumY - 70, 10, 0, Math.PI * 2);
        ctx.fill();

        drawCenteredText(sortedPlayers[0].name, podiumX + 120, podiumY - 90, '#FFFF00', 2);
    }

    // 2nd place (left)
    if (sortedPlayers[1]) {
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(podiumX - 10, podiumY, 80, 100);
        drawCenteredText('2', podiumX + 30, podiumY + 50, '#000', 2);

        ctx.fillStyle = sortedPlayers[1].nation === 'USA' ? '#0000FF' : '#FF0000';
        ctx.fillRect(podiumX + 15, podiumY - 30, 30, 30);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(podiumX + 30, podiumY - 40, 10, 0, Math.PI * 2);
        ctx.fill();

        drawPixelText(sortedPlayers[1].name, podiumX - 20, podiumY - 50, '#FFF', 1);
    }

    // 3rd place (right)
    if (sortedPlayers[2]) {
        ctx.fillStyle = '#CD7F32';
        ctx.fillRect(podiumX + 170, podiumY + 20, 80, 80);
        drawCenteredText('3', podiumX + 210, podiumY + 50, '#000', 2);

        ctx.fillStyle = sortedPlayers[2].nation === 'USA' ? '#0000FF' : '#FF0000';
        ctx.fillRect(podiumX + 195, podiumY - 10, 30, 30);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(podiumX + 210, podiumY - 20, 10, 0, Math.PI * 2);
        ctx.fill();

        drawPixelText(sortedPlayers[2].name, podiumX + 160, podiumY - 30, '#FFF', 1);
    }

    // Title
    drawCenteredText('FINAL RESULTS', 80, '#FFD700', 3);

    // Winner announcement
    if (sortedPlayers[0]) {
        drawCenteredText(`WINNER: ${sortedPlayers[0].name} (${sortedPlayers[0].nation})`, 140, '#FFFF00', 2);
        drawCenteredText(`${sortedPlayers[0].totalScore.toFixed(1)} POINTS`, 170, '#00FF00', 2);
    }

    drawCenteredText('PRESS SPACE TO RETURN TO TITLE', 460, '#FFF', 1);
}

// Game Update Functions
function updateSkiApproach() {
    if (skier.speed > 0) {
        skier.speed += 0.5;
        skier.x += skier.speed / 10;

        // Check if past takeoff point
        if (skier.x > 500) {
            // Missed takeoff
            skier.takeoffQuality = 0;
            gameState = STATES.SKI_TAKEOFF;
            beep(200, 300, 0.4);
        }
    }
}

function updateSkiTakeoff() {
    // Transition to flight
    skier.inAir = true;
    skier.velocityX = skier.speed / 5 + skier.takeoffQuality * 2;
    skier.velocityY = -8 - skier.takeoffQuality;
    skier.angle = -0.2;
    skier.x = 300;
    skier.y = 200;
    gameState = STATES.SKI_FLIGHT;
    beep(600, 150);
}

function updateSkiFlight() {
    // Physics
    skier.x += skier.velocityX;
    skier.y += skier.velocityY;
    skier.velocityY += 0.15; // Gravity

    // Update angle based on velocity
    skier.angle = Math.atan2(skier.velocityY, skier.velocityX);

    // Posture degradation (realistic drift)
    // Gradually drift towards imperfect posture
    skier.leanForwardBack += (Math.random() - 0.5) * 3;
    skier.kneePosition += (Math.random() - 0.3) * 2;
    skier.skisCrossed += (Math.random() - 0.4) * 2;

    // Clamp posture values
    skier.leanForwardBack = Math.max(-100, Math.min(100, skier.leanForwardBack));
    skier.kneePosition = Math.max(0, Math.min(100, skier.kneePosition));
    skier.skisCrossed = Math.max(0, Math.min(100, skier.skisCrossed));

    // Calculate total posture error
    const leanError = Math.abs(skier.leanForwardBack);
    const kneeError = Math.abs(skier.kneePosition);
    const skiError = Math.abs(skier.skisCrossed);
    const totalError = leanError + kneeError + skiError;

    // Posture affects style points (like original)
    if (totalError > 100) {
        skier.stylePoints -= 0.5;
    } else if (totalError < 30) {
        skier.stylePoints += 0.1;
    } else {
        skier.stylePoints -= 0.2;
    }

    // Perfect posture bonus (arms close to body = all values near 0)
    if (leanError < 10 && kneeError < 10 && skiError < 10) {
        skier.stylePoints += 0.3;  // Big bonus for perfect form
    }

    // Clamp style points
    skier.stylePoints = Math.max(0, Math.min(100, skier.stylePoints));

    // Calculate distance (good posture = better distance!)
    const postureFactor = Math.max(0, 1 - totalError / 200);
    skier.distance = 60 + (skier.x - 300) / 10 + skier.takeoffQuality * 5 + postureFactor * 8;

    // Check landing
    const groundY = 400 - (skier.x - 300) * 0.15;
    if (skier.y >= groundY && skier.velocityY > 0) {
        skier.y = groundY;
        skier.landed = true;

        // Landing quality affects style (based on current posture)
        if (totalError > 80) {
            skier.stylePoints -= 20;
            beep(300, 400, 0.5);
        } else if (totalError < 20) {
            skier.stylePoints += 15;  // Bonus for clean landing
            beep(700, 200);
        } else {
            beep(500, 200);
        }

        skier.stylePoints = Math.max(0, Math.min(100, skier.stylePoints));

        // Save score - AUTHENTIC FORMULA: distance * 3 + posture!
        const totalScore = skier.distance * 3 + skier.stylePoints;
        players[currentPlayerIndex].scores.push(totalScore);
        players[currentPlayerIndex].totalScore += totalScore;

        gameState = STATES.SKI_LANDING;
        setTimeout(() => {
            nextPlayer();
        }, 3000);
    }
}

function nextPlayer() {
    currentPlayerIndex++;

    if (currentPlayerIndex >= players.length) {
        // Round complete
        currentPlayerIndex = 0;

        if (currentRound < maxRounds) {
            currentRound++;
            gameState = STATES.ROUND_RESULTS;
            beep(523, 200);
            setTimeout(() => {
                if (gameState === STATES.ROUND_RESULTS) {
                    gameState = STATES.SKI_READY;
                }
            }, 4000);
        } else {
            // Game complete
            gameState = STATES.VICTORY_CEREMONY;
            setTimeout(() => playAnthemMelody(), 500);
        }
    } else {
        gameState = STATES.SKI_READY;
    }
}

function resetSkier() {
    skier.x = 100;
    skier.y = 150;
    skier.velocityX = 0;
    skier.velocityY = 0;
    skier.angle = 0;
    skier.balance = 0;
    skier.leanForwardBack = 0;
    skier.kneePosition = 0;
    skier.skisCrossed = 0;
    skier.speed = 0;
    skier.distance = 0;
    skier.stylePoints = 100;
    skier.inAir = false;
    skier.landed = false;
    skier.takeoffQuality = 0;
}

// Main Game Loop
function gameLoop() {
    switch (gameState) {
        case STATES.TITLE_SCREEN:
            drawTitleScreen();
            break;

        case STATES.OPENING_CEREMONY:
            drawOpeningCeremony();
            break;

        case STATES.PLAYER_COUNT_SELECT:
            drawPlayerCountSelect();
            break;

        case STATES.PLAYER_SETUP:
            drawPlayerSetup();
            break;

        case STATES.SKI_READY:
            clear();
            const currentPlayer = players[currentPlayerIndex];
            drawCenteredText(`${currentPlayer.name} (${currentPlayer.nation})`, 180, '#FFFF00', 3);
            drawCenteredText(`ROUND ${currentRound} OF ${maxRounds}`, 240, '#FFF', 2);
            drawCenteredText('GET READY...', 300, '#00FFFF', 2);
            drawCenteredText('PRESS SPACE TO START', 360, '#FFF', 2);
            break;

        case STATES.SKI_APPROACH:
            drawSkiApproach();
            updateSkiApproach();
            break;

        case STATES.SKI_TAKEOFF:
            updateSkiTakeoff();
            break;

        case STATES.SKI_FLIGHT:
            drawSkiFlight();
            updateSkiFlight();
            break;

        case STATES.SKI_LANDING:
            drawSkiLanding();
            break;

        case STATES.ROUND_RESULTS:
            drawRoundResults();
            break;

        case STATES.VICTORY_CEREMONY:
            drawVictoryCeremony();
            break;
    }

    animFrame++;
    requestAnimationFrame(gameLoop);
}

// Input Handlers
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    const now = Date.now();

    // Space bar actions
    if (e.key === ' ' && now - lastSpacePress > SPACE_DEBOUNCE) {
        lastSpacePress = now;
        e.preventDefault();

        switch (gameState) {
            case STATES.TITLE_SCREEN:
                gameState = STATES.OPENING_CEREMONY;
                flameFrame = 0;
                beep(880, 100);
                break;

            case STATES.OPENING_CEREMONY:
                if (flameFrame > 180) {
                    gameState = STATES.PLAYER_COUNT_SELECT;
                    beep(880, 100);
                }
                break;

            case STATES.PLAYER_COUNT_SELECT:
                // Initialize players
                players = [];
                for (let i = 0; i < numPlayers; i++) {
                    players.push({
                        name: '',
                        nation: 'USA',
                        scores: [],
                        totalScore: 0
                    });
                }
                gameState = STATES.PLAYER_SETUP;
                setupPlayerIndex = 0;
                currentNameInput = '';
                currentNationSelect = 0;
                beep(1047, 100);
                break;

            case STATES.SKI_READY:
                resetSkier();
                gameState = STATES.SKI_APPROACH;
                beep(698, 100);
                break;

            case STATES.SKI_APPROACH:
                if (skier.speed === 0) {
                    skier.speed = 20;
                    beep(523, 100);
                } else if (skier.x > 420 && skier.x < 480) {
                    // Good takeoff
                    skier.takeoffQuality = 1 - Math.abs(skier.x - 450) / 30;
                    gameState = STATES.SKI_TAKEOFF;
                    beep(1047, 150);
                }
                break;

            case STATES.ROUND_RESULTS:
                if (currentRound < maxRounds) {
                    gameState = STATES.SKI_READY;
                } else {
                    gameState = STATES.VICTORY_CEREMONY;
                    setTimeout(() => playAnthemMelody(), 500);
                }
                beep(880, 100);
                break;

            case STATES.VICTORY_CEREMONY:
                // Return to title
                gameState = STATES.TITLE_SCREEN;
                currentRound = 1;
                currentPlayerIndex = 0;
                players = [];
                beep(1047, 100);
                break;
        }
    }

    // Arrow keys for player select screen
    if (gameState === STATES.PLAYER_COUNT_SELECT) {
        if (e.key === 'ArrowUp') {
            numPlayers = Math.max(1, numPlayers - 1);
            beep(440, 50);
        } else if (e.key === 'ArrowDown') {
            numPlayers = Math.min(4, numPlayers + 1);
            beep(440, 50);
        }
    }

    // Player setup navigation
    if (gameState === STATES.PLAYER_SETUP) {
        if (e.key === 'ArrowLeft') {
            currentNationSelect = (currentNationSelect - 1 + NATIONS.length) % NATIONS.length;
            beep(440, 50);
        } else if (e.key === 'ArrowRight') {
            currentNationSelect = (currentNationSelect + 1) % NATIONS.length;
            beep(440, 50);
        } else if (e.key === 'Enter') {
            if (currentNameInput.length > 0) {
                players[setupPlayerIndex].name = currentNameInput;
                players[setupPlayerIndex].nation = NATIONS[currentNationSelect].name;

                setupPlayerIndex++;
                if (setupPlayerIndex >= players.length) {
                    // All players set up
                    gameState = STATES.SKI_READY;
                    beep(1047, 150);
                } else {
                    currentNameInput = '';
                    currentNationSelect = 0;
                    beep(880, 100);
                }
            }
        } else if (e.key === 'Backspace') {
            currentNameInput = currentNameInput.slice(0, -1);
            beep(330, 50);
        } else if (e.key.length === 1 && currentNameInput.length < 10) {
            currentNameInput += e.key.toUpperCase();
            beep(523, 50);
        }
    }

    // Flight controls - Authentic Winter Games mechanics!
    if (gameState === STATES.SKI_FLIGHT) {
        if (e.key === 'ArrowLeft') {
            // Correct forward lean (lean back)
            skier.leanForwardBack -= 12;
        } else if (e.key === 'ArrowRight') {
            // Correct backward lean (lean forward)
            skier.leanForwardBack += 12;
        } else if (e.key === 'ArrowUp') {
            // Fix knees (move knees away from body)
            skier.kneePosition -= 12;
        } else if (e.key === 'ArrowDown') {
            // Uncross skis
            skier.skisCrossed -= 12;
        }

        // Clamp all posture values
        skier.leanForwardBack = Math.max(-100, Math.min(100, skier.leanForwardBack));
        skier.kneePosition = Math.max(0, Math.min(100, skier.kneePosition));
        skier.skisCrossed = Math.max(0, Math.min(100, skier.skisCrossed));
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize
console.log('Winter Games - Ski Jump');
console.log('Press SPACE to start!');
beep(523, 100);
setTimeout(() => beep(659, 100), 150);
setTimeout(() => beep(784, 150), 300);

gameLoop();

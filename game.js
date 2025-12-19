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

// Ski Jump variables
let skier = {
    x: 100,
    y: 150,
    velocityX: 0,
    velocityY: 0,
    angle: 0,
    balance: 0,
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

// Ski Jump - Mountain Background
function drawMountainBackground() {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 300);

    // Mountains in background
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(150, 100);
    ctx.lineTo(300, 200);
    ctx.lineTo(0, 200);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(400, 80);
    ctx.lineTo(600, 200);
    ctx.lineTo(200, 200);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(130, 120);
    ctx.lineTo(150, 100);
    ctx.lineTo(170, 120);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(380, 100);
    ctx.lineTo(400, 80);
    ctx.lineTo(420, 100);
    ctx.fill();

    // Trees
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 10; i++) {
        const x = 50 + i * 60;
        const y = 180 + Math.random() * 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 20);
        ctx.lineTo(x + 10, y + 20);
        ctx.closePath();
        ctx.fill();
    }
}

// Ski Jump - Approach Phase
function drawSkiApproach() {
    clear();
    drawMountainBackground();

    // Ski jump ramp
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(500, 380);
    ctx.lineTo(500, 400);
    ctx.lineTo(30, 170);
    ctx.closePath();
    ctx.fill();

    // Ramp details (lines)
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 45, 150 + i * 23);
        ctx.lineTo(70 + i * 45, 150 + i * 23);
        ctx.stroke();
    }

    // Skier
    const skierX = skier.x;
    const skierY = 150 + (skier.x - 50) * 0.51;

    // Simple skier representation
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(skierX - 5, skierY - 15, 10, 15);

    // Head
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(skierX, skierY - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Skis
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(skierX - 8, skierY);
    ctx.lineTo(skierX - 15, skierY + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(skierX + 8, skierY);
    ctx.lineTo(skierX + 15, skierY + 10);
    ctx.stroke();

    // Speed indicator
    drawPixelText(`SPEED: ${Math.floor(skier.speed)} km/h`, 20, 440, '#FFF', 2);

    // Current player
    const currentPlayer = players[currentPlayerIndex];
    drawPixelText(`${currentPlayer.name} (${currentPlayer.nation})`, 20, 30, '#FFFF00', 2);
    drawPixelText(`ROUND ${currentRound}/${maxRounds}`, 500, 30, '#FFFF00', 2);

    if (skier.speed === 0) {
        drawCenteredText('PRESS SPACE TO START!', 250, '#FFFF00', 2);
    } else if (skierX > 420 && skierX < 480) {
        drawCenteredText('PRESS SPACE TO JUMP!', 250, '#FF0000', 2);
    }
}

// Ski Jump - Flight Phase
function drawSkiFlight() {
    clear();

    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground far below
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 400, canvas.width, 80);

    // Landing slope
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.moveTo(0, 450);
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

    // HUD
    const currentPlayer = players[currentPlayerIndex];
    drawPixelText(`${currentPlayer.name}`, 20, 30, '#FFFF00', 2);
    drawPixelText(`DISTANCE: ${Math.floor(skier.distance)}m`, 20, 60, '#FFF', 2);
    drawPixelText(`STYLE: ${Math.floor(skier.stylePoints)}`, 20, 90, '#FFF', 2);

    // Balance indicator
    const balanceBarX = 520;
    const balanceBarY = 30;
    drawRect(balanceBarX - 2, balanceBarY - 2, 104, 24, '#FFF');

    // Balance bar
    const balanceColor = Math.abs(skier.balance) < 30 ? '#00FF00' : '#FF0000';
    const balancePos = 50 + skier.balance * 0.5;
    ctx.fillStyle = balanceColor;
    ctx.fillRect(balanceBarX + balancePos - 2, balanceBarY, 4, 20);

    drawPixelText('BALANCE', balanceBarX - 80, balanceBarY + 15, '#FFF', 1);

    drawCenteredText('USE ARROW KEYS FOR BALANCE', 420, '#FFFF00', 1);
}

// Ski Jump - Landing Phase
function drawSkiLanding() {
    clear();

    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, 200);

    // Ground
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 200, canvas.width, canvas.height - 200);

    // Landing area
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(640, 350);
    ctx.lineTo(640, 480);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();

    // Distance markers
    ctx.fillStyle = '#FF0000';
    ctx.font = '12px "Courier New", monospace';
    for (let i = 60; i <= 120; i += 10) {
        const x = (i - 60) * 10 + 50;
        ctx.fillText(`${i}m`, x, 240);
        ctx.fillRect(x, 245, 2, 10);
    }

    // Skier on ground
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(skier.x - 5, skier.y - 15, 10, 15);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(skier.x, skier.y - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Results
    const currentPlayer = players[currentPlayerIndex];
    drawCenteredText(`${currentPlayer.name} - ROUND ${currentRound}`, 100, '#FFFF00', 2);
    drawCenteredText(`DISTANCE: ${Math.floor(skier.distance)}m`, 200, '#FFF', 3);
    drawCenteredText(`STYLE POINTS: ${skier.stylePoints.toFixed(1)}`, 260, '#FFF', 2);

    const totalScore = skier.distance * 2 + skier.stylePoints;
    drawCenteredText(`TOTAL: ${totalScore.toFixed(1)} points`, 320, '#00FF00', 2);

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

    // Balance affects style points
    if (Math.abs(skier.balance) > 30) {
        skier.stylePoints -= 0.3;
    } else if (Math.abs(skier.balance) < 10) {
        skier.stylePoints += 0.05;
    }

    // Clamp style points
    skier.stylePoints = Math.max(0, Math.min(100, skier.stylePoints));

    // Calculate distance
    skier.distance = 60 + (skier.x - 300) / 10 + skier.takeoffQuality * 5;

    // Check landing
    const groundY = 400 - (skier.x - 300) * 0.15;
    if (skier.y >= groundY && skier.velocityY > 0) {
        skier.y = groundY;
        skier.landed = true;

        // Landing quality affects style
        if (Math.abs(skier.balance) > 40) {
            skier.stylePoints -= 20;
            beep(300, 400, 0.5);
        } else {
            skier.stylePoints += 10;
            beep(700, 200);
        }

        skier.stylePoints = Math.max(0, Math.min(100, skier.stylePoints));

        // Save score
        const totalScore = skier.distance * 2 + skier.stylePoints;
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

    // Flight controls
    if (gameState === STATES.SKI_FLIGHT) {
        if (e.key === 'ArrowLeft') {
            skier.balance -= 8;
        } else if (e.key === 'ArrowRight') {
            skier.balance += 8;
        }

        // Clamp balance
        skier.balance = Math.max(-100, Math.min(100, skier.balance));
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

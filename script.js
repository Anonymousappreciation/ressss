/**
 * ============================================================================
 * OFFICE ESCAPE: THE MYSTERY ROOM - CLIENT GAME ENGINE
 * Complete vanilla JavaScript implementation for the interactive mystery room,
 * 8 specific highlighted objects, Web Audio sound, and top padlock unlocking!
 * ============================================================================
 */

// 1. SOUND MANAGER (Self-contained Web Audio API)
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      g.gain.setValueAtTime(0.15, now + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playUnlock() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 830.61, 987.77].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      g.gain.setValueAtTime(0.18, now + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.35);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const seq = [
      { f: 523.25, t: 0.0 }, { f: 659.25, t: 0.15 },
      { f: 783.99, t: 0.3 }, { f: 1046.5, t: 0.48 }
    ];
    seq.forEach(n => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      g.gain.setValueAtTime(0.2, now + n.t);
      g.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.35);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + 0.35);
    });
  }
}

const sounds = new SoundManager();

// 2. MASTER GAME DATA FOR TEAM A AND TEAM B
const gameData = {
  teamA: {
    name: "Team Alpha (Room A)",
    rooms: {
      1: {
        title: "ROOM 1: DESK FILING DRAWERS",
        hotspot: "Desk Filing Drawers",
        scenario: "Maria notices Marcus struggling with a deadline and volunteers 30 minutes to organize records with him.",
        mainQ: {
          q: "Which workplace value is being demonstrated?",
          choices: ["A. Teamwork", "B. Laziness", "C. Dishonesty", "D. Disrespect"],
          correct: 0
        }
      },
      2: {
        title: "ROOM 2: UPPER SHELF PLANT",
        hotspot: "Upper Shelf Green Plant",
        scenario: "Employee consistently arrives at 8:50 AM for a 9:00 AM shift.",
        mainQ: {
          q: "Which professional conduct standard is shown?",
          choices: ["A. Carelessness", "B. Punctuality", "C. Delay"],
          correct: 1
        }
      },
      3: {
        title: "ROOM 3: DESK BANKER LAMP",
        hotspot: "Amber Reading Desk Lamp",
        scenario: "Employee locks their workstation whenever stepping away to grab coffee.",
        mainQ: {
          q: "Which protocol is being followed?",
          choices: ["A. Information Security", "B. Disregard", "C. Waste"],
          correct: 0
        }
      },
      4: {
        title: "ROOM 4: BASKETBALL ON SHELF",
        hotspot: "Basketball on Shelf",
        scenario: "Two employees communicate respectfully with a handshake: 👥 + 🤝",
        mainQ: {
          q: "Decode the emoji equation into a corporate virtue:",
          choices: ["A. ISOLATION", "B. TEAMWORK", "C. COMPETITION"],
          correct: 1
        }
      },
      5: {
        title: "ROOM 5: OAK STORAGE BARREL",
        hotspot: "Oak Storage Barrel",
        scenario: "Anna, Ben, and Carlo arrived at 8:00 AM, 8:15 AM, and 8:30 AM. Anna arrived 15 mins before Ben; Carlo arrived after Ben.",
        mainQ: {
          q: "Who arrived first and unlocked the office at 8:00 AM?",
          choices: ["A. Anna (8:00 AM)", "B. Ben (8:00 AM)", "C. Carlo (8:00 AM)"],
          correct: 0
        }
      },
      6: {
        title: "ROOM 6: THE SHARED OFFICE KITCHEN",
        hotspot: "Shared Kitchen Fridge",
        scenario: "Four coworkers (Amy, Ben, Cole, and Dan) each left a lunch box in the office fridge. The lunch boxes are lined up on a single shelf from left to right (Positions 1, 2, 3, and 4).\n\nThe Clues:\n1. Dan’s box is at position 4 (the far right).\n2. Amy’s box is directly to the left of Ben’s box.",
        mainQ: {
          q: "The Question: Who owns the lunch box at position 1 (the far left)?",
          choices: ["A. Cole (Correct: Dan is at 4, Amy & Ben are at 2 & 3)", "B. Amy", "C. Ben", "D. Dan"],
          correct: 0
        }
      },
      7: {
        title: "ROOM 7: DESK CHAIR",
        hotspot: "Executive Workspace Chair",
        scenario: "An emergency liquid spill is spotted in the hallway.",
        mainQ: {
          q: "What is your immediate responsibility?",
          choices: ["A. Walk past it", "B. Mark area and notify facilities immediately", "C. Ignore it"],
          correct: 1
        }
      },
      8: {
        title: "ROOM 8: SECURITY LOCKBOX SAFE",
        hotspot: "Security Lockbox Safe",
        scenario: "You are scheduled to attend an important client meeting but face transit delay.",
        mainQ: {
          q: "What is the professional protocol?",
          choices: ["A. Inform supervisor promptly", "B. Sneak in late without word", "C. Cancel without notice"],
          correct: 0
        }
      }
    }
  },

  teamB: {
    name: "Team Bravo (Room B)",
    rooms: {
      1: {
        title: "ROOM 1: DESK FILING DRAWERS",
        hotspot: "Desk Filing Drawers",
        scenario: "David notices a delivery counted 10 items instead of 9 and immediately alerts management to correct the ledger.",
        mainQ: {
          q: "Which workplace value is being demonstrated?",
          choices: ["A. Carelessness", "B. Integrity", "C. Dishonesty"],
          correct: 1
        }
      },
      2: {
        title: "ROOM 2: UPPER SHELF PLANT",
        hotspot: "Upper Shelf Green Plant",
        scenario: "Employee greets clients warmly and listens actively without interrupting.",
        mainQ: {
          q: "Which standard is demonstrated?",
          choices: ["A. Customer Service", "B. Apathy", "C. Delay"],
          correct: 0
        }
      },
      3: {
        title: "ROOM 3: DESK BANKER LAMP",
        hotspot: "Amber Reading Desk Lamp",
        scenario: "Employee double checks calculations before submitting the financial report.",
        mainQ: {
          q: "Which quality is demonstrated?",
          choices: ["A. Haste", "B. Attention to Detail", "C. Neglect"],
          correct: 1
        }
      },
      4: {
        title: "ROOM 4: BASKETBALL ON SHELF",
        hotspot: "Basketball on Shelf",
        scenario: "Justice scale paired with business briefcase: ⚖️ + 💼",
        mainQ: {
          q: "Decode the emoji equation into a corporate virtue:",
          choices: ["A. INTEGRITY", "B. CORRUPTION", "C. PROFIT"],
          correct: 0
        }
      },
      5: {
        title: "ROOM 5: OAK STORAGE BARREL",
        hotspot: "Oak Storage Barrel",
        scenario: "Elena presented 20 mins before David; Sarah spoke after David at 9:00, 9:20, and 9:40.",
        mainQ: {
          q: "Who opened the board meeting at 9:00 AM?",
          choices: ["A. Elena (9:00 AM)", "B. David (9:00 AM)", "C. Sarah (9:00 AM)"],
          correct: 0
        }
      },
      6: {
        title: "ROOM 6: THE SHARED OFFICE KITCHEN",
        hotspot: "Shared Kitchen Fridge",
        scenario: "Four coworkers (Amy, Ben, Cole, and Dan) each left a lunch box in the office fridge. The lunch boxes are lined up on a single shelf from left to right (Positions 1, 2, 3, and 4).\n\nThe Clues:\n1. Dan’s box is at position 4 (the far right).\n2. Amy’s box is directly to the left of Ben’s box.",
        mainQ: {
          q: "The Question: Who owns the lunch box at position 1 (the far left)?",
          choices: ["A. Cole (Correct: Dan is at 4, Amy & Ben are at 2 & 3)", "B. Amy", "C. Ben", "D. Dan"],
          correct: 0
        }
      },
      7: {
        title: "ROOM 7: DESK CHAIR",
        hotspot: "Executive Workspace Chair",
        scenario: "Constructive peer feedback procedure.",
        mainQ: {
          q: "What is the best way to offer constructive peer feedback?",
          choices: ["A. Publicly criticize", "B. Respectful, private & specific suggestions", "C. Anonymous notes"],
          correct: 1
        }
      },
      8: {
        title: "ROOM 8: SECURITY LOCKBOX SAFE",
        hotspot: "Security Lockbox Safe",
        scenario: "Confidentiality of customer data and trade secrets.",
        mainQ: {
          q: "How must client records be treated?",
          choices: ["A. Stored securely and kept confidential", "B. Left on lunch table", "C. Posted online"],
          correct: 0
        }
      }
    }
  }
};

// 3. SPECIFIC ROOM HOTSPOTS (Mapped onto the exact scene picture)
const HOTSPOTS = [
  { id: 'drawer', name: 'Desk Filing Drawers', room: 1, left: 27, top: 72, width: 12, height: 20, shape: 'box', color: 'yellow' },
  { id: 'top-plant', name: 'Upper Shelf Green Plant', room: 2, left: 54, top: 2, width: 12, height: 18, shape: 'circle', color: 'green' },
  { id: 'desk-lamp', name: 'Amber Reading Desk Lamp', room: 3, left: 62, top: 48, width: 9, height: 20, shape: 'box', color: 'blue', hasArrow: true },
  { id: 'basketball', name: 'Basketball on Shelf', room: 4, left: 71, top: 34, width: 8, height: 13, shape: 'circle', color: 'yellow' },
  { id: 'barrel', name: 'Oak Storage Barrel', room: 5, left: 86, top: 61, width: 12, height: 28, shape: 'circle', color: 'yellow' },
  { id: 'ladder', name: 'Library Rolling Ladder', room: 6, left: 35, top: 14, width: 10, height: 44, shape: 'box', color: 'blue' },
  { id: 'chair', name: 'Executive Workspace Chair', room: 7, left: 55, top: 60, width: 10, height: 14, shape: 'box', color: 'yellow' },
  { id: 'safe', name: 'Security Lockbox Safe', room: 8, left: 74, top: 43, width: 8, height: 12, shape: 'box', color: 'yellow' }
];

// 4. GAME STATE
let gameState = {
  team: 'teamA',
  score: 0,
  timeRemaining: 1200, // 20 minutes in seconds
  timerInterval: null,
  challengesCompleted: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false },
  padlocksUnlocked: [false, false, false, false, false, false, false, false],
  activeModalRoom: null
};

// DOM References
const mainView = document.getElementById('main-view');
const timerText = document.getElementById('timer-text');
const scoreText = document.getElementById('score-text');
const teamTag = document.getElementById('team-tag');
const soundBtn = document.getElementById('sound-btn');
const toastBanner = document.getElementById('toast-banner');

// Toast feedback
let toastTimeout = null;
function showToast(msg, type = 'info') {
  if (!toastBanner) return;
  toastBanner.textContent = msg;
  toastBanner.className = `toast-banner ${type}`;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastBanner.className = 'toast-banner hidden';
  }, 4000);
}

// Sound toggle
soundBtn.addEventListener('click', () => {
  const enabled = sounds.toggle();
  soundBtn.textContent = enabled ? '🔊' : '🔇';
  showToast(enabled ? 'Sound Effects Enabled' : 'Sound Muted', 'info');
});

// Timer Engine
function startTimer() {
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(() => {
    if (gameState.timeRemaining > 0) {
      gameState.timeRemaining--;
      const m = Math.floor(gameState.timeRemaining / 60);
      const s = gameState.timeRemaining % 60;
      timerText.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// 5. RENDER MAIN ROOM SCENE (Exact Inspiration Picture Layout)
function renderRoomScene() {
  const unlockedCount = gameState.padlocksUnlocked.filter(Boolean).length;
  scoreText.textContent = gameState.score;
  teamTag.textContent = gameData[gameState.team].name;

  mainView.innerHTML = `
    <div class="room-scene-container">
      <!-- Generated scene background image -->
      <img src="assets/images/mystery_room_office_shelves.jpg" onerror="this.src='https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=1200&q=80'" class="room-bg-img" alt="Escape Room" />

      <!-- TOP HUD OVERLAY -->
      <div class="scene-top-bar">
        <!-- Top Left Avatar -->
        <div class="team-avatar-badge" id="avatar-toggle-btn" title="Click to Switch Team">
          <div class="avatar-circle">
            <span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;">👤</span>
          </div>
          <span class="avatar-title">${gameState.team === 'teamA' ? 'Team A' : 'Team B'}</span>
        </div>

        <!-- Top Center Padlocks Rack -->
        <div class="padlocks-rack">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
            const isUnlocked = gameState.padlocksUnlocked[i - 1];
            const isReady = !isUnlocked && gameState.challengesCompleted[i];
            return `
              <button class="padlock-node ${isReady ? 'ready' : ''}" data-room="${i}" title="Padlock #${i}">
                ${isReady ? '<span class="ready-tag">CLICK TO UNLOCK!</span>' : ''}
                <div class="padlock-icon-svg">
                  <svg viewBox="0 0 40 50" style="width:100%;height:100%;">
                    <path d="${isUnlocked ? 'M 12 20 L 12 10 C 12 5, 28 5, 28 10 L 28 14' : 'M 12 22 L 12 10 C 12 5, 28 5, 28 10 L 28 22'}"
                      fill="none" stroke="${isUnlocked ? '#34d399' : isReady ? '#f59e0b' : '#a8a29e'}" stroke-width="4.5" stroke-linecap="round" />
                    <rect x="6" y="18" width="28" height="28" rx="4" fill="${isUnlocked ? '#065f46' : isReady ? '#78350f' : '#292524'}" stroke="${isUnlocked ? '#10b981' : isReady ? '#f59e0b' : '#78716c'}" stroke-width="2" />
                    <circle cx="20" cy="30" r="2.5" fill="#000" />
                  </svg>
                </div>
                <span class="padlock-label ${isUnlocked ? 'unlocked' : ''}">#${i}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Top Right Golden Master Key -->
        <button class="master-key-cta" id="master-key-btn">
          <div class="master-key-text">
            Click here if you already unlocked 5 padlocks
            <div style="font-size:0.75rem;color:#fde047;">(${unlockedCount}/5 unlocked)</div>
          </div>
          <div class="master-key-icon">🔑</div>
        </button>
      </div>

      <!-- CLICKABLE ROOM HOTSPOTS -->
      ${HOTSPOTS.map(h => {
        const isUnlocked = gameState.padlocksUnlocked[h.room - 1];
        const isSolved = gameState.challengesCompleted[h.room];
        return `
          <div class="room-hotspot ${h.shape} ${h.color}" data-room="${h.room}"
            style="left:${h.left}%; top:${h.top}%; width:${h.width}%; height:${h.height}%;">
            ${h.hasArrow ? '<div class="hotspot-arrow">▲</div>' : ''}
            <div class="hotspot-tooltip">
              ${h.name} ${isUnlocked ? '✓' : isSolved ? '★ Ready to Unlock!' : ''}
            </div>
          </div>
        `;
      }).join('')}

      <!-- BOTTOM LEFT TEAM SWITCHER PODS -->
      <div class="scene-bottom-left">
        <button class="team-pill-btn ${gameState.team === 'teamA' ? 'active' : ''}" id="switch-team-a">
          <span class="team-mini-avatar">A</span> Team A
        </button>
        <button class="team-pill-btn ${gameState.team === 'teamB' ? 'active' : ''}" id="switch-team-b">
          <span class="team-mini-avatar">B</span> Team B
        </button>
      </div>
    </div>
  `;

  // Bind Padlock clicks
  document.querySelectorAll('.padlock-node').forEach(btn => {
    btn.onclick = () => {
      const roomNum = parseInt(btn.dataset.room);
      handlePadlockClick(roomNum);
    };
  });

  // Bind Hotspot clicks (clicking specific object opens challenge!)
  document.querySelectorAll('.room-hotspot').forEach(spot => {
    spot.onclick = () => {
      const roomNum = parseInt(spot.dataset.room);
      openChallengeModal(roomNum);
    };
  });

  // Team Switchers
  document.getElementById('avatar-toggle-btn').onclick = toggleTeam;
  document.getElementById('switch-team-a').onclick = () => setTeam('teamA');
  document.getElementById('switch-team-b').onclick = () => setTeam('teamB');

  // Master Key Click
  document.getElementById('master-key-btn').onclick = attemptMasterKeyEscape;
}

// 6. PADLOCK CLICK ON MAIN ROOM SCREEN
function handlePadlockClick(roomNum) {
  sounds.playClick();
  const isUnlocked = gameState.padlocksUnlocked[roomNum - 1];
  const isSolved = gameState.challengesCompleted[roomNum];
  const roomData = gameData[gameState.team].rooms[roomNum];

  if (isUnlocked) {
    showToast(`Padlock #${roomNum} is already unlocked! 🔓`, 'info');
    return;
  }

  // If player already solved questions from the room object, this unlocks the padlock!
  if (isSolved) {
    sounds.playUnlock();
    gameState.score += 20; // +20 points
    gameState.padlocksUnlocked[roomNum - 1] = true;
    renderRoomScene();
    showToast(`🔓 PADLOCK #${roomNum} UNLOCKED! Shackle opened!`, 'success');

    const totalUnlocked = gameState.padlocksUnlocked.filter(Boolean).length;
    if (totalUnlocked === 8) {
      setTimeout(showVictoryScreen, 1000);
    }
  } else {
    // Padlock is locked: prompt player to click the object in the room!
    sounds.playWrong();
    showToast(`🔒 Padlock #${roomNum} is locked! Click the highlighted ${roomData.hotspot} in the room picture to solve its challenge first.`, 'warn');
  }
}

// 7. OPEN OBJECT CHALLENGE MODAL
function openChallengeModal(roomNum) {
  sounds.playClick();
  gameState.activeModalRoom = roomNum;
  const room = gameData[gameState.team].rooms[roomNum];
  const isSolved = gameState.challengesCompleted[roomNum];
  const isUnlocked = gameState.padlocksUnlocked[roomNum - 1];

  const modalHtml = `
    <div class="challenge-modal-backdrop" id="modal-backdrop">
      <div class="challenge-modal-box">
        <div class="modal-header">
          <div>
            <span style="font-size:0.75rem;color:#f59e0b;font-family:monospace;">OBJECT CLUE #${roomNum}</span>
            <div class="modal-title">${room.title}</div>
          </div>
          <button class="modal-close-btn" id="modal-close-x">✕</button>
        </div>

        ${isSolved && !isUnlocked ? `
          <div class="solved-alert-banner">
            <div class="solved-banner-text">
              🎉 CHALLENGE SOLVED! Return to the room screen to unlock Padlock #${roomNum} on the top shelf!
            </div>
            <button class="return-room-btn" id="return-and-unlock-btn">
              ← BACK TO ROOM TO UNLOCK PADLOCK #${roomNum}
            </button>
          </div>
        ` : ''}

        <div style="background:#0f172a;padding:16px;border-radius:12px;margin-bottom:16px;border:1px solid #1e293b;">
          <h4 style="color:#f59e0b;font-size:0.85rem;margin-bottom:6px;">🔎 WORKPLACE SCENARIO</h4>
          <p style="font-size:0.85rem;line-height:1.5;color:#cbd5e1;">"${room.scenario}"</p>
        </div>

        <div style="margin-bottom:20px;">
          <p style="font-weight:700;font-size:0.9rem;margin-bottom:10px;">${room.mainQ.q}</p>
          <div id="modal-choices">
            ${room.mainQ.choices.map((c, idx) => `
              <button class="choice-btn ${isSolved && idx === room.mainQ.correct ? 'correct' : ''}" data-idx="${idx}">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;">
          <button class="return-room-btn" id="modal-return-room-btn" style="background:#334155;color:#f8fafc;">
            ← Return to Mystery Room
          </button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('modal-backdrop');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  // Bind Choice clicks
  document.querySelectorAll('#modal-choices .choice-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      if (idx === room.mainQ.correct) {
        sounds.playCorrect();
        if (!gameState.challengesCompleted[roomNum]) {
          gameState.challengesCompleted[roomNum] = true;
          gameState.score += 10;
        }
        closeModal();
        openChallengeModal(roomNum); // Refresh with banner
        showToast(`✅ Correct! Challenge solved. Now return to the room to unlock Padlock #${roomNum}!`, 'success');
      } else {
        sounds.playWrong();
        gameState.score = Math.max(0, gameState.score - 2);
        showToast('❌ Incorrect answer. Try again!', 'warn');
      }
    };
  });

  // Bind Return Buttons
  document.getElementById('modal-close-x').onclick = closeModal;
  document.getElementById('modal-return-room-btn').onclick = closeModal;
  const returnUnlockBtn = document.getElementById('return-and-unlock-btn');
  if (returnUnlockBtn) {
    returnUnlockBtn.onclick = () => {
      closeModal();
      showToast(`Click Padlock #${roomNum} in the top row now to open it!`, 'info');
    };
  }
}

function closeModal() {
  const m = document.getElementById('modal-backdrop');
  if (m) m.remove();
  renderRoomScene();
}

// 8. TEAM SWITCHING
function toggleTeam() {
  setTeam(gameState.team === 'teamA' ? 'teamB' : 'teamA');
}

function setTeam(newTeam) {
  sounds.playClick();
  gameState.team = newTeam;
  renderRoomScene();
  showToast(`Switched to ${gameData[newTeam].name}!`, 'info');
}

// 9. MASTER KEY ESCAPE
function attemptMasterKeyEscape() {
  sounds.playClick();
  const unlockedCount = gameState.padlocksUnlocked.filter(Boolean).length;
  if (unlockedCount >= 5) {
    sounds.playVictory();
    showVictoryScreen();
  } else {
    sounds.playWrong();
    showToast(`🔒 The Master Key remains locked! You must unlock at least 5 padlocks first (Currently ${unlockedCount}/5 unlocked).`, 'warn');
  }
}

// 10. VICTORY SCREEN
function showVictoryScreen() {
  sounds.playVictory();
  const m = Math.floor(gameState.timeRemaining / 60);
  const s = gameState.timeRemaining % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  mainView.innerHTML = `
    <div style="text-align:center;padding:50px 20px;max-width:550px;margin:0 auto;background:#1e293b;border-radius:24px;border:1px solid #334155;">
      <div style="font-size:4rem;margin-bottom:12px;">🎉🏆</div>
      <h1 style="font-size:2.2rem;font-weight:900;color:#fff;margin-bottom:12px;">ESCAPE SUCCESSFUL!</h1>
      <p style="color:#cbd5e1;font-size:1rem;line-height:1.6;margin-bottom:24px;">
        You solved the mysteries and unlocked the exit with ${gameData[gameState.team].name}!
      </p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;">
        <div style="background:#0f172a;padding:14px;border-radius:12px;">
          <div style="font-size:0.75rem;color:#94a3b8;">SCORE</div>
          <div style="font-size:1.5rem;font-weight:900;color:#fbbf24;">${gameState.score}</div>
        </div>
        <div style="background:#0f172a;padding:14px;border-radius:12px;">
          <div style="font-size:0.75rem;color:#94a3b8;">TIME LEFT</div>
          <div style="font-size:1.5rem;font-weight:900;color:#34d399;">${timeStr}</div>
        </div>
        <div style="background:#0f172a;padding:14px;border-radius:12px;">
          <div style="font-size:0.75rem;color:#94a3b8;">PADLOCKS</div>
          <div style="font-size:1.5rem;font-weight:900;color:#60a5fa;">${gameState.padlocksUnlocked.filter(Boolean).length}/8 🔓</div>
        </div>
      </div>

      <button id="vic-replay-btn" style="padding:14px 32px;background:#f59e0b;color:#0f172a;font-weight:900;font-size:1rem;border-radius:12px;border:none;cursor:pointer;">
        🔄 PLAY AGAIN
      </button>
    </div>
  `;

  document.getElementById('vic-replay-btn').onclick = () => {
    gameState.score = 0;
    gameState.timeRemaining = 1200;
    gameState.challengesCompleted = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
    gameState.padlocksUnlocked = [false, false, false, false, false, false, false, false];
    renderRoomScene();
  };
}

// Initial start
startTimer();
renderRoomScene();

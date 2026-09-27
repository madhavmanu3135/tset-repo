/**
 * REPLAN — Adaptive Student Planning & Resilience Gamification
 * Core Application Engine
 */

(function () {
  'use strict';

  // =========================================================================
  // DEFAULT DATA & STATE
  // =========================================================================
  const STORAGE_KEY = 'replan_app_state_v1';

  const DEFAULT_STATE = {
    user: {
      name: 'Prajodh',
      avatar: 'P',
      totalXp: 640,
      soundEnabled: true,
    },
    today: {
      date: new Date().toISOString().split('T')[0],
      capacity: 'normal', // 'normal' | 'tight' | 'rough'
      xpEarned: 0,
      focusMins: 0,
      focusSessions: 0,
      activeFilter: 'all',
    },
    streak: {
      days: 14,
      onPlanDays: 9,
      adaptedDays: 5,
      history: [
        { day: 'Mon', date: 'Sep 14', status: 'green', label: 'On Plan' },
        { day: 'Tue', date: 'Sep 15', status: 'green', label: 'On Plan' },
        { day: 'Wed', date: 'Sep 16', status: 'purple', label: 'Adapted (Shrunk)' },
        { day: 'Thu', date: 'Sep 17', status: 'green', label: 'On Plan' },
        { day: 'Fri', date: 'Sep 18', status: 'orange', label: 'Rough Day Shield' },
        { day: 'Sat', date: 'Sep 19', status: 'green', label: 'On Plan' },
        { day: 'Sun', date: 'Sep 20', status: 'green', label: 'On Plan' },
        { day: 'Mon', date: 'Sep 21', status: 'purple', label: 'Adapted (Moved)' },
        { day: 'Tue', date: 'Sep 22', status: 'green', label: 'On Plan' },
        { day: 'Wed', date: 'Sep 23', status: 'green', label: 'On Plan' },
        { day: 'Thu', date: 'Sep 24', status: 'purple', label: 'Adapted (Swapped)' },
        { day: 'Fri', date: 'Sep 25', status: 'green', label: 'On Plan' },
        { day: 'Sat', date: 'Sep 26', status: 'purple', label: 'Adapted (Shrunk)' },
        { day: 'Sun', date: 'Today', status: 'today', label: 'In Progress' },
      ],
    },
    goals: [
      {
        id: 'g-unreal',
        title: 'Master Unreal Engine Cinematics',
        category: 'skill',
        normalTarget: '3 sessions / week (~20m each)',
        minTarget: '1 micro-session (10 min)',
        currentProgress: 2,
        targetSessions: 3,
      },
      {
        id: 'g-dsa',
        title: 'Algorithms & Data Structures Mastery',
        category: 'academic',
        normalTarget: '4 problem sets / week',
        minTarget: '1 review session (15 min)',
        currentProgress: 3,
        targetSessions: 4,
      },
      {
        id: 'g-thesis',
        title: 'Senior Capstone Project Architecture',
        category: 'project',
        normalTarget: '3 research blocks / week',
        minTarget: '1 quick documentation pass (10 min)',
        currentProgress: 1,
        targetSessions: 3,
      },
      {
        id: 'g-health',
        title: 'Posture & Ergonomic Stretching',
        category: 'wellness',
        normalTarget: '5 light stretches / week',
        minTarget: '2 quick posture resets / week',
        currentProgress: 4,
        targetSessions: 5,
      },
    ],
    quests: [
      {
        id: 'q-1',
        title: 'Unreal Engine: Lighting Rig & Shadow Pass',
        goalId: 'g-unreal',
        category: 'skill',
        duration: 20,
        xp: 25,
        status: 'pending', // 'pending' | 'completed' | 'adapted'
        priority: 'high',
        adaptedDetails: null,
      },
      {
        id: 'q-2',
        title: 'DSA: Solve 1 Graph Traversal (DFS/BFS) problem',
        goalId: 'g-dsa',
        category: 'academic',
        duration: 20,
        xp: 25,
        status: 'pending',
        priority: 'medium',
        adaptedDetails: null,
      },
      {
        id: 'q-3',
        title: 'Ergonomic Mobility & Wrist Stretches',
        goalId: 'g-health',
        category: 'wellness',
        duration: 15,
        xp: 15,
        status: 'pending',
        priority: 'low',
        adaptedDetails: null,
      },
    ],
    adaptLog: [
      {
        id: 'ad-1',
        date: 'Sep 26, 2026',
        questTitle: 'Unreal Engine: Skeletal Mesh Import',
        reason: 'Coursework / Exam Crunch',
        fit: 'shrink',
        fitLabel: 'Shrunk to 5-min micro inspection',
        bonusXp: 15,
      },
      {
        id: 'ad-2',
        date: 'Sep 24, 2026',
        questTitle: 'DSA: Dynamic Programming Tabulation',
        reason: 'Mental Block / Low Energy',
        fit: 'swap',
        fitLabel: 'Swapped for watching 1 video explanation',
        bonusXp: 15,
      },
      {
        id: 'ad-3',
        date: 'Sep 21, 2026',
        questTitle: 'Capstone Architecture Diagram',
        reason: 'Lab / Schedule Conflict',
        fit: 'move',
        fitLabel: 'Moved to Tuesday morning without penalty',
        bonusXp: 15,
      },
      {
        id: 'ad-4',
        date: 'Sep 18, 2026',
        questTitle: 'Full DSA Mock Test (60m)',
        reason: 'Health or Exhaustion',
        fit: 'shrink',
        fitLabel: 'Rough Day Shield activated (+15 XP)',
        bonusXp: 15,
      },
      {
        id: 'ad-5',
        date: 'Sep 16, 2026',
        questTitle: 'Unreal Materials Shader Graph',
        reason: 'Ran Out of Time',
        fit: 'shrink',
        fitLabel: 'Shrunk to 5-min review of material nodes',
        bonusXp: 15,
      },
    ],
    badges: [
      {
        id: 'b-first-adapt',
        name: 'First Adaptation',
        desc: 'Adapted your plan honestly without abandoning momentum.',
        icon: '🌱',
        unlocked: true,
        date: 'Sep 16, 2026',
      },
      {
        id: 'b-streak-7',
        name: 'Streak Guardian',
        desc: 'Sustained 7 unbroken days using honest flexibility.',
        icon: '🔥',
        unlocked: true,
        date: 'Sep 20, 2026',
      },
      {
        id: 'b-streak-14',
        name: 'Unshakable 14',
        desc: '14 days of preserved momentum. 0 guilt, 100% resilience.',
        icon: '🛡️',
        unlocked: true,
        date: 'Sep 27, 2026',
      },
      {
        id: 'b-micro-3',
        name: 'Micro-Master',
        desc: 'Shrunk high-friction tasks to 5-min actions 3 times.',
        icon: '🤏',
        unlocked: true,
        date: 'Sep 26, 2026',
      },
      {
        id: 'b-shield-bearer',
        name: 'Shield Bearer',
        desc: 'Activated Rough Day Shield mode during extreme fatigue.',
        icon: '⚔️',
        unlocked: false,
        date: null,
      },
      {
        id: 'b-focus-60',
        name: 'Deep Focus Alchemist',
        desc: 'Logged 60+ minutes in the dedicated focus timer.',
        icon: '⏱️',
        unlocked: false,
        date: null,
      },
      {
        id: 'b-goal-cadence',
        name: 'Shock Absorber',
        desc: 'Defined Minimum Viable Week targets for 4 active goals.',
        icon: '🎯',
        unlocked: true,
        date: 'Sep 25, 2026',
      },
      {
        id: 'b-overcomer-5',
        name: 'Adaptive Virtuoso',
        desc: 'Turned 5 schedule disruptions into Resilience XP.',
        icon: '💎',
        unlocked: true,
        date: 'Sep 26, 2026',
      },
    ],
  };

  // Level Progression Configuration
  const LEVEL_TIERS = [
    { level: 1, title: 'Explorer', minXp: 0, maxXp: 100 },
    { level: 2, title: 'Pathfinder', minXp: 100, maxXp: 200 },
    { level: 3, title: 'Habit Forger', minXp: 200, maxXp: 320 },
    { level: 4, title: 'Momentum Keeper', minXp: 320, maxXp: 460 },
    { level: 5, title: 'Resilient Scholar', minXp: 460, maxXp: 600 },
    { level: 6, title: 'Adaptive Master', minXp: 600, maxXp: 1000 },
    { level: 7, title: 'Focus Alchemist', minXp: 1000, maxXp: 1500 },
    { level: 8, title: 'Momentum Architect', minXp: 1500, maxXp: 2100 },
    { level: 9, title: 'Iron Will', minXp: 2100, maxXp: 2800 },
    { level: 10, title: 'Unshakable', minXp: 2800, maxXp: 4000 },
  ];

  // Active App State
  let state = loadState();

  // Active Modal Context
  let activeModalQuestId = null;
  let selectedReasonText = null;
  let selectedFitOption = null;
  let selectedCapacityChoice = null;
  let newGoalCategory = 'skill';

  // Timer Context
  let timerDurationSecs = 20 * 60;
  let timerRemainingSecs = 20 * 60;
  let timerInterval = null;
  let timerIsRunning = false;
  let timerTargetQuestId = null;

  // Web Audio Context for Chimes & Ambient Noise
  let audioCtx = null;
  let ambientSource = null;
  let ambientGain = null;

  // =========================================================================
  // PERSISTENCE HELPERS
  // =========================================================================
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all required fields exist
        return {
          ...DEFAULT_STATE,
          ...parsed,
          user: { ...DEFAULT_STATE.user, ...parsed.user },
          today: { ...DEFAULT_STATE.today, ...parsed.today },
          streak: { ...DEFAULT_STATE.streak, ...parsed.streak },
        };
      }
    } catch (e) {
      console.warn('Could not load stored state, using default:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state:', e);
    }
  }

  // =========================================================================
  // LEVEL & XP CALCULATIONS
  // =========================================================================
  function getLevelInfo(totalXp) {
    let currentTier = LEVEL_TIERS[0];
    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      if (totalXp >= LEVEL_TIERS[i].minXp) {
        currentTier = LEVEL_TIERS[i];
      } else {
        break;
      }
    }

    const tierRange = currentTier.maxXp - currentTier.minXp;
    const progressInTier = Math.max(0, totalXp - currentTier.minXp);
    const xpToNext = Math.max(0, currentTier.maxXp - totalXp);
    const percentage = Math.min(100, Math.round((progressInTier / tierRange) * 100));

    return {
      level: currentTier.level,
      title: currentTier.title,
      progressInTier,
      tierRange,
      percentage,
      xpToNext,
      isMaxLevel: currentTier.level === 10,
    };
  }

  function addXp(amount, sourceEvent = '') {
    const prevLevelInfo = getLevelInfo(state.user.totalXp);
    state.user.totalXp += amount;
    state.today.xpEarned += amount;
    const newLevelInfo = getLevelInfo(state.user.totalXp);

    saveState();
    updateUI();

    // Check for level up
    if (newLevelInfo.level > prevLevelInfo.level) {
      showLevelUpCelebration(newLevelInfo.level, newLevelInfo.title);
    }

    // Check badges
    checkBadges();

    return newLevelInfo;
  }

  // =========================================================================
  // SOUND EFFECTS (WEB AUDIO API SYNTHESIZER)
  // =========================================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.25, gainLevel = 0.15, startTime = 0) {
    if (!state.user.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      // Audio might be restricted by browser policy
    }
  }

  function playCompleteSound() {
    // Joyful ascending arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    playTone(523.25, 'sine', 0.15, 0.12, 0.0);
    playTone(659.25, 'sine', 0.18, 0.14, 0.08);
    playTone(783.99, 'sine', 0.22, 0.16, 0.16);
    playTone(1046.5, 'sine', 0.4, 0.18, 0.24);
  }

  function playAdaptSound() {
    // Gentle resilient chord: A4 (440Hz), C5 (523Hz), E5 (659Hz) with smooth shimmer
    playTone(440.0, 'triangle', 0.25, 0.15, 0.0);
    playTone(523.25, 'sine', 0.3, 0.16, 0.06);
    playTone(659.25, 'sine', 0.35, 0.18, 0.14);
    playTone(880.0, 'sine', 0.5, 0.15, 0.22);
  }

  function playTimerBell() {
    // Deep meditation bell sound
    playTone(528, 'sine', 1.8, 0.25, 0.0);
    playTone(1056, 'sine', 1.2, 0.1, 0.02);
  }

  function playLevelUpSound() {
    // Fanfare chords
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      playTone(freq, 'triangle', 0.4, 0.18, idx * 0.09);
    });
  }

  function toggleSound() {
    state.user.soundEnabled = !state.user.soundEnabled;
    saveState();
    const icon = document.getElementById('soundIcon');
    if (icon) {
      icon.textContent = state.user.soundEnabled ? '🔊' : '🔇';
    }
    showToast(state.user.soundEnabled ? 'Audio effects enabled' : 'Audio effects muted', '🎵');
  }

  function toggleAmbientNoise() {
    const chk = document.getElementById('ambientSoundToggle');
    if (!chk) return;
    const shouldPlay = chk.checked;

    if (shouldPlay) {
      startAmbientNoise();
    } else {
      stopAmbientNoise();
    }
  }

  function startAmbientNoise() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ambientSource) stopAmbientNoise();

      // Synthesize pink/warm ambient noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      }

      ambientSource = ctx.createBufferSource();
      ambientSource.buffer = buffer;
      ambientSource.loop = true;

      // Filter to keep it soft and warm
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(0.01, ctx.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);

      ambientSource.connect(filter);
      filter.connect(ambientGain);
      ambientGain.connect(ctx.destination);

      ambientSource.start(0);
      showToast('Soft focus noise started', '🎧');
    } catch (e) {
      console.warn('Ambient noise error:', e);
    }
  }

  function stopAmbientNoise() {
    try {
      if (ambientGain && audioCtx) {
        ambientGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (ambientSource) {
          ambientSource.stop();
          ambientSource.disconnect();
          ambientSource = null;
        }
      }, 550);
    } catch (e) {
      // Ignored
    }
  }

  // =========================================================================
  // CONFETTI PARTICLES
  // =========================================================================
  let confettiAnimationId = null;
  const confettiParticles = [];

  function triggerConfetti(originX = 0.5, originY = 0.4, count = 70) {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      confettiParticles.push({
        x: canvas.width * originX,
        y: canvas.height * originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        gravity: 0.18 + Math.random() * 0.12,
        opacity: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    if (!confettiAnimationId) {
      animateConfetti(canvas, ctx);
    }
  }

  function animateConfetti(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.life++;

      const progress = p.life / p.maxLife;
      p.opacity = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.life >= p.maxLife || p.y > canvas.height + 20) {
        confettiParticles.splice(i, 1);
      }
    }

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(() => animateConfetti(canvas, ctx));
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimationId = null;
    }
  }

  // =========================================================================
  // FLOATING XP NOTIFICATION
  // =========================================================================
  function spawnFloatingXp(event, text = '+25 XP') {
    const el = document.createElement('div');
    el.className = 'xp-popup-float';
    el.textContent = text;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (event && event.clientX) {
      x = event.clientX;
      y = event.clientY;
    } else if (event && event.target) {
      const rect = event.target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    }

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1300);
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  let toastTimer = null;
  function showToast(message, icon = '✨') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    const iconEl = document.getElementById('toastIcon');

    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // SCREEN SWITCHING
  // =========================================================================
  function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    screens.forEach((scr) => scr.classList.remove('active'));
    navItems.forEach((btn) => btn.classList.remove('active'));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) targetScreen.classList.add('active');

    const activeNav = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update screen title in header
    const screenTitles = {
      today: "Today's Quests",
      goals: 'Goals & Habit Shock Absorbers',
      adapt: 'Resilience & Adapt Log',
      timer: 'Deep Focus Timer',
      progress: 'Badges & Skill Progression',
    };
    const titleEl = document.getElementById('screenTitle');
    if (titleEl && screenTitles[screenId]) {
      titleEl.textContent = screenTitles[screenId];
    }

    // Close mobile sidebar if open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // If opening timer, ensure selector is in sync
    if (screenId === 'timer') {
      populateTimerQuestSelect();
    }
  }

  function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
  }

  // =========================================================================
  // QUEST RENDERING & MANAGEMENT
  // =========================================================================
  function getCategoryEmoji(cat) {
    switch (cat) {
      case 'skill':
        return '🛠️';
      case 'academic':
        return '📚';
      case 'project':
        return '🚀';
      case 'wellness':
        return '🧘';
      default:
        return '⚡';
    }
  }

  function renderQuests() {
    const list = document.getElementById('questList');
    if (!list) return;

    let filtered = state.quests;

    // Filter by category
    if (state.today.activeFilter !== 'all') {
      filtered = filtered.filter((q) => q.category === state.today.activeFilter);
    }

    // Capacity-based visibility
    if (state.today.capacity === 'rough') {
      // Rough day: focus on highest priority / first quest, others shielded
      filtered = filtered.slice(0, 1);
    } else if (state.today.capacity === 'tight') {
      filtered = filtered.slice(0, 2);
    }

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty-quest-state" style="text-align:center; padding: 36px 20px; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-lg);">
          <div style="font-size: 36px; margin-bottom: 8px;">🎉</div>
          <h4 style="font-size: 16px; font-weight: 800; color: #fff;">All clear for today!</h4>
          <p style="font-size: 13px; color: var(--ink-secondary); margin-top: 4px;">
            You have addressed all planned actions. Your resilience streak is safe.
          </p>
          <button class="btn btn-primary" style="margin-top: 14px;" onclick="openAddQuestModal()">+ Add Another Quest</button>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered
      .map((q) => {
        const isDone = q.status === 'completed';
        const isAdapted = q.status === 'adapted';
        const catEmoji = getCategoryEmoji(q.category);

        let statusClass = '';
        if (isDone) statusClass = 'completed';
        if (isAdapted) statusClass = 'adapted';

        let badgeHtml = '';
        if (isAdapted) {
          const fitLabel = q.adaptedDetails ? q.adaptedDetails.fit.toUpperCase() : 'ADAPTED';
          badgeHtml = `<span class="quest-tag adapted-tag">⇄ ${fitLabel} (+15 XP)</span>`;
        }

        let actionsHtml = '';
        if (isDone) {
          actionsHtml = `
            <div class="completed-check-badge">
              <span>✓ Completed (+${q.xp} XP)</span>
            </div>
          `;
        } else if (isAdapted) {
          actionsHtml = `
            <div class="completed-check-badge" style="color: #c4b5fd; background: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.3);">
              <span>🛡️ Momentum Kept</span>
            </div>
            <button class="btn-complete-quest" onclick="completeQuest('${q.id}', event)">Done with Adjusted Step</button>
          `;
        } else {
          actionsHtml = `
            <button class="btn-timer-trigger" title="Focus with Timer" onclick="startFocusOnQuest('${q.id}')">
              <span>⏱️</span>
            </button>
            <button class="btn-adapt-quest" title="Adjust without guilt" onclick="openAdaptModal('${q.id}')">
              <span>Plan Changed?</span>
            </button>
            <button class="btn-complete-quest" onclick="completeQuest('${q.id}', event)">
              <span>Complete (+${q.xp} XP)</span>
            </button>
          `;
        }

        const goal = state.goals.find((g) => g.id === q.goalId);
        const goalTitle = goal ? goal.title : 'Personal Quest';

        return `
          <div class="quest-item ${statusClass}" id="quest-item-${q.id}">
            <div class="quest-left">
              <div class="quest-category-icon ${q.category}">
                ${catEmoji}
              </div>
              <div class="quest-body">
                <div class="quest-title-row">
                  <span class="quest-title">${escapeHtml(q.title)}</span>
                  ${badgeHtml}
                </div>
                <div class="quest-meta">
                  <span>${escapeHtml(goalTitle)}</span>
                  <span>•</span>
                  <span>⏱️ ${q.duration} min</span>
                  <span>•</span>
                  <span class="quest-xp-reward">+${q.xp} XP</span>
                </div>
              </div>
            </div>
            <div class="quest-actions">
              ${actionsHtml}
            </div>
          </div>
        `;
      })
      .join('');
  }

  function completeQuest(questId, event) {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) return;

    quest.status = 'completed';
    const xpAwarded = quest.xp;

    // Increment goal progress if linked
    if (quest.goalId) {
      const goal = state.goals.find((g) => g.id === quest.goalId);
      if (goal && goal.currentProgress < goal.targetSessions) {
        goal.currentProgress++;
      }
    }

    addXp(xpAwarded);
    playCompleteSound();
    triggerConfetti(0.5, 0.45, 55);
    spawnFloatingXp(event, `+${xpAwarded} XP`);
    showToast(`Great work! "${quest.title}" completed (+${xpAwarded} XP)`, '🎉');

    saveState();
    updateUI();
  }

  function startFocusOnQuest(questId) {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) return;

    timerTargetQuestId = questId;
    setTimerDuration(quest.duration);
    switchScreen('timer');
    const select = document.getElementById('timerQuestSelect');
    if (select) select.value = questId;
    showToast(`Timer primed for: ${quest.title}`, '⏱️');
  }

  function filterQuests(filter) {
    state.today.activeFilter = filter;
    const allBtn = document.getElementById('filterAllBtn');
    const skillBtn = document.getElementById('filterSkillBtn');
    const acadBtn = document.getElementById('filterAcadBtn');

    if (allBtn) allBtn.classList.toggle('active', filter === 'all');
    if (skillBtn) skillBtn.classList.toggle('active', filter === 'skill');
    if (acadBtn) acadBtn.classList.toggle('active', filter === 'academic');

    renderQuests();
  }

  // =========================================================================
  // ADAPT / PLAN CHANGED MODAL & FLOW
  // =========================================================================
  function openAdaptModal(questId) {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) return;

    activeModalQuestId = questId;
    selectedReasonText = null;
    selectedFitOption = null;

    const modalTitle = document.getElementById('adaptModalQuestTitle');
    if (modalTitle) {
      modalTitle.textContent = `"${quest.title}" doesn't fit today?`;
    }

    // Reset pill selections
    document.querySelectorAll('#reasonsGrid .reason-pill').forEach((btn) => {
      btn.classList.remove('selected');
    });
    document.querySelectorAll('#adaptChoicesGrid .adapt-choice-card').forEach((card) => {
      card.classList.remove('selected');
    });

    const confirmBtn = document.getElementById('confirmAdaptBtn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Apply Adaptation & Earn +15 XP';
    }

    const modal = document.getElementById('adaptModal');
    if (modal) modal.classList.add('show');
  }

  function closeAdaptModal() {
    const modal = document.getElementById('adaptModal');
    if (modal) modal.classList.remove('show');
    activeModalQuestId = null;
  }

  function selectReason(btnEl) {
    document.querySelectorAll('#reasonsGrid .reason-pill').forEach((btn) => {
      btn.classList.remove('selected');
    });
    btnEl.classList.add('selected');
    selectedReasonText = btnEl.getAttribute('data-reason');
    checkAdaptReady();
  }

  function selectFit(choiceEl) {
    document.querySelectorAll('#adaptChoicesGrid .adapt-choice-card').forEach((card) => {
      card.classList.remove('selected');
    });
    choiceEl.classList.add('selected');
    selectedFitOption = choiceEl.getAttribute('data-fit');
    checkAdaptReady();
  }

  function checkAdaptReady() {
    const confirmBtn = document.getElementById('confirmAdaptBtn');
    if (!confirmBtn) return;
    confirmBtn.disabled = !(selectedReasonText && selectedFitOption);
  }

  function confirmAdaptSelection() {
    if (!activeModalQuestId || !selectedReasonText || !selectedFitOption) return;

    const quest = state.quests.find((q) => q.id === activeModalQuestId);
    if (!quest) return;

    const bonusXp = 15;
    let fitDescription = '';

    if (selectedFitOption === 'shrink') {
      quest.title = `(Micro 5m) ${quest.title}`;
      quest.duration = 5;
      quest.xp = 15;
      quest.status = 'adapted';
      fitDescription = 'Shrunk to 5-min micro-version';
    } else if (selectedFitOption === 'move') {
      quest.status = 'adapted';
      fitDescription = 'Moved to tomorrow with zero guilt';
    } else if (selectedFitOption === 'swap') {
      quest.title = `(Lighter Step) ${quest.title} (5m overview review)`;
      quest.duration = 5;
      quest.xp = 15;
      quest.status = 'adapted';
      fitDescription = 'Swapped for low-friction reading/video';
    }

    quest.adaptedDetails = {
      reason: selectedReasonText,
      fit: selectedFitOption,
      bonusXp: bonusXp,
      date: new Date().toLocaleDateString(),
    };

    // Log in Adapt History
    state.adaptLog.unshift({
      id: 'ad-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      questTitle: quest.title,
      reason: selectedReasonText,
      fit: selectedFitOption,
      fitLabel: fitDescription,
      bonusXp: bonusXp,
    });

    // Update streak adapted count
    state.streak.adaptedDays++;

    // Mark today's timeline node as adapted
    const todayNode = state.streak.history[state.streak.history.length - 1];
    if (todayNode) {
      todayNode.status = 'purple';
      todayNode.label = 'Adapted (+15 XP)';
    }

    addXp(bonusXp);
    playAdaptSound();
    triggerConfetti(0.5, 0.45, 45);
    showToast(`Momentum saved! ${fitDescription} (+15 Resilience XP)`, '🛡️');

    closeAdaptModal();
    saveState();
    updateUI();
  }

  // =========================================================================
  // WORKLOAD CAPACITY MODAL & FLOW
  // =========================================================================
  function openCapacityModal() {
    selectedCapacityChoice = state.today.capacity;
    document.querySelectorAll('.capacity-option-card').forEach((card) => {
      const cap = card.getAttribute('data-cap');
      card.classList.toggle('selected', cap === selectedCapacityChoice);
    });

    const confirmBtn = document.getElementById('confirmCapacityBtn');
    if (confirmBtn) confirmBtn.disabled = false;

    const modal = document.getElementById('capacityModal');
    if (modal) modal.classList.add('show');
  }

  function closeCapacityModal() {
    const modal = document.getElementById('capacityModal');
    if (modal) modal.classList.remove('show');
  }

  function selectCapacityOption(cap) {
    selectedCapacityChoice = cap;
    document.querySelectorAll('.capacity-option-card').forEach((card) => {
      card.classList.toggle('selected', card.getAttribute('data-cap') === cap);
    });
    const confirmBtn = document.getElementById('confirmCapacityBtn');
    if (confirmBtn) confirmBtn.disabled = false;
  }

  function confirmCapacitySelection() {
    if (!selectedCapacityChoice) return;
    state.today.capacity = selectedCapacityChoice;

    if (state.today.capacity === 'rough') {
      showToast('Rough Day Shield activated! Workload scaled to 1 micro-task.', '🛡️');
      const todayNode = state.streak.history[state.streak.history.length - 1];
      if (todayNode) {
        todayNode.status = 'orange';
        todayNode.label = 'Rough Day Protected';
      }
    } else if (state.today.capacity === 'tight') {
      showToast('Workload sized down for tight schedule (top 2 priorities).', '⏳');
    } else {
      showToast('Standard full schedule restored.', '⚡');
    }

    closeCapacityModal();
    saveState();
    updateUI();
  }

  // =========================================================================
  // GOAL MANAGEMENT & MODAL
  // =========================================================================
  function openAddGoalModal() {
    const titleInput = document.getElementById('goalTitleInput');
    if (titleInput) titleInput.value = '';
    newGoalCategory = 'skill';
    document.querySelectorAll('.category-chips-row .category-chip').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === 'skill');
    });

    const modal = document.getElementById('goalModal');
    if (modal) modal.classList.add('show');
  }

  function closeGoalModal() {
    const modal = document.getElementById('goalModal');
    if (modal) modal.classList.remove('show');
  }

  function selectGoalCategory(btnEl) {
    document.querySelectorAll('.category-chips-row .category-chip').forEach((btn) => {
      btn.classList.remove('active');
    });
    btnEl.classList.add('active');
    newGoalCategory = btnEl.getAttribute('data-cat') || 'skill';
  }

  function submitCreateGoal() {
    const titleInput = document.getElementById('goalTitleInput');
    const normalSelect = document.getElementById('goalNormalTarget');
    const minSelect = document.getElementById('goalMinTarget');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      showToast('Please enter a goal title', '⚠️');
      return;
    }

    const newGoal = {
      id: 'g-' + Date.now(),
      title,
      category: newGoalCategory,
      normalTarget: normalSelect ? normalSelect.value : '3 sessions / week',
      minTarget: minSelect ? minSelect.value : '1 micro-session (10 min)',
      currentProgress: 0,
      targetSessions: 3,
    };

    state.goals.push(newGoal);
    addXp(30);
    playCompleteSound();
    showToast(`Goal created with resilient floor! (+30 XP)`, '🎯');

    closeGoalModal();
    saveState();
    updateUI();
  }

  function renderGoals() {
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;

    grid.innerHTML = state.goals
      .map((g) => {
        const catEmoji = getCategoryEmoji(g.category);
        const percent = Math.min(100, Math.round((g.currentProgress / g.targetSessions) * 100));

        return `
          <div class="goal-card">
            <div class="goal-header">
              <div class="goal-title-group">
                <span class="goal-category-tag">${catEmoji} ${g.category}</span>
                <h4 class="goal-title">${escapeHtml(g.title)}</h4>
              </div>
              <span class="badge-pill green">${g.currentProgress}/${g.targetSessions} Done</span>
            </div>

            <div class="goal-cadence-box">
              <div class="cadence-row">
                <span class="cadence-label">Normal Week:</span>
                <span class="cadence-val">${escapeHtml(g.normalTarget)}</span>
              </div>
              <div class="cadence-row">
                <span class="cadence-label">Minimum Viable Week (Floor):</span>
                <span class="cadence-val floor">🛡️ ${escapeHtml(g.minTarget)}</span>
              </div>
            </div>

            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>

            <div class="goal-rail">
              <span style="color: var(--ink-secondary); font-size: 11.5px;">Shock absorber active</span>
              <button class="inline-link" onclick="quickAddQuestForGoal('${g.id}')">+ Add Quest for Today</button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function quickAddQuestForGoal(goalId) {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) return;

    openAddQuestModal();
    const select = document.getElementById('questGoalSelect');
    if (select) select.value = goalId;
    const titleInput = document.getElementById('questTitleInput');
    if (titleInput) titleInput.value = `${goal.title}: Focus Sprint`;
  }

  // =========================================================================
  // ADD QUEST MODAL
  // =========================================================================
  function openAddQuestModal() {
    const titleInput = document.getElementById('questTitleInput');
    if (titleInput) titleInput.value = '';

    const select = document.getElementById('questGoalSelect');
    if (select) {
      select.innerHTML = state.goals
        .map((g) => `<option value="${g.id}">${escapeHtml(g.title)}</option>`)
        .join('');
    }

    const modal = document.getElementById('addQuestModal');
    if (modal) modal.classList.add('show');
  }

  function closeAddQuestModal() {
    const modal = document.getElementById('addQuestModal');
    if (modal) modal.classList.remove('show');
  }

  function submitAddQuest() {
    const titleInput = document.getElementById('questTitleInput');
    const goalSelect = document.getElementById('questGoalSelect');
    const minsSelect = document.getElementById('questMinutesSelect');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      showToast('Please enter a quest title', '⚠️');
      return;
    }

    const duration = minsSelect ? parseInt(minsSelect.value, 10) : 20;
    const xpValues = { 10: 15, 15: 20, 20: 25, 30: 35, 45: 50 };
    const xp = xpValues[duration] || 25;

    const goalId = goalSelect ? goalSelect.value : null;
    const goal = state.goals.find((g) => g.id === goalId);
    const category = goal ? goal.category : 'skill';

    const newQuest = {
      id: 'q-' + Date.now(),
      title,
      goalId,
      category,
      duration,
      xp,
      status: 'pending',
      priority: 'medium',
      adaptedDetails: null,
    };

    state.quests.push(newQuest);
    showToast(`Quest "${title}" added!`, '⚡');

    closeAddQuestModal();
    saveState();
    updateUI();
  }

  // =========================================================================
  // ADAPT LOG SCREEN RENDERING
  // =========================================================================
  function renderAdaptLog() {
    const list = document.getElementById('adaptHistoryList');
    if (!list) return;

    if (state.adaptLog.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--ink-secondary);">
          No adaptations logged yet. When life gets crazy, click "Plan Changed" on any quest to log your first guilt-free adaptation!
        </div>
      `;
      return;
    }

    list.innerHTML = state.adaptLog
      .map((entry) => {
        let fitIcon = '🤏';
        if (entry.fit === 'move') fitIcon = '📅';
        if (entry.fit === 'swap') fitIcon = '🔄';

        return `
          <div class="adapt-entry-card">
            <div class="adapt-entry-left">
              <div class="adapt-icon-tag">${fitIcon}</div>
              <div>
                <div class="adapt-entry-title">${escapeHtml(entry.questTitle)}</div>
                <div class="adapt-entry-meta">
                  <strong>${escapeHtml(entry.fitLabel || entry.fit)}</strong> • ${escapeHtml(entry.reason)} • ${entry.date}
                </div>
              </div>
            </div>
            <div class="adapt-xp-earned">+${entry.bonusXp} Resilience XP</div>
          </div>
        `;
      })
      .join('');

    // Summary numbers
    const totalSavedEl = document.getElementById('adaptTotalSaved');
    const bonusXpEl = document.getElementById('adaptBonusXpTotal');
    const shrunkEl = document.getElementById('adaptShrunkCount');
    const movedEl = document.getElementById('adaptMovedCount');
    const swappedEl = document.getElementById('adaptSwappedCount');

    const totalAdaptations = state.adaptLog.length;
    const bonusXpTotal = state.adaptLog.reduce((acc, curr) => acc + (curr.bonusXp || 15), 0);
    const shrunkCount = state.adaptLog.filter((x) => x.fit === 'shrink').length;
    const movedCount = state.adaptLog.filter((x) => x.fit === 'move').length;
    const swappedCount = state.adaptLog.filter((x) => x.fit === 'swap').length;

    if (totalSavedEl) totalSavedEl.textContent = totalAdaptations;
    if (bonusXpEl) bonusXpEl.textContent = `+${bonusXpTotal}`;
    if (shrunkEl) shrunkEl.textContent = `${shrunkCount} times`;
    if (movedEl) movedEl.textContent = `${movedCount} times`;
    if (swappedEl) swappedEl.textContent = `${swappedCount} times`;
  }

  // =========================================================================
  // CONSISTENCY TRACK / STREAK TIMELINE
  // =========================================================================
  function renderTimeline() {
    const track = document.getElementById('streakTimelineTrack');
    if (!track) return;

    track.innerHTML = state.streak.history
      .map((node) => {
        let statusClass = node.status; // 'green' | 'purple' | 'orange' | 'today'
        let checkmark = '✓';
        if (node.status === 'purple') checkmark = '⇄';
        if (node.status === 'orange') checkmark = '🛡️';
        if (node.status === 'today') checkmark = '•';

        return `
          <div class="streak-day-node" title="${node.date}: ${node.label}">
            <div class="streak-node-dot ${statusClass}">${checkmark}</div>
            <span class="streak-day-label">${node.day}</span>
          </div>
        `;
      })
      .join('');
  }

  // =========================================================================
  // FOCUS TIMER SCREEN
  // =========================================================================
  function populateTimerQuestSelect() {
    const select = document.getElementById('timerQuestSelect');
    if (!select) return;

    const options = state.quests
      .map((q) => {
        const isSelected = q.id === timerTargetQuestId ? 'selected' : '';
        return `<option value="${q.id}" ${isSelected}>${escapeHtml(q.title)} (${q.duration}m)</option>`;
      })
      .join('');

    select.innerHTML =
      options || `<option value="">General Deep Focus Session</option>`;
  }

  function syncTimerTarget() {
    const select = document.getElementById('timerQuestSelect');
    if (!select) return;
    timerTargetQuestId = select.value;
    const quest = state.quests.find((q) => q.id === timerTargetQuestId);
    if (quest && !timerIsRunning) {
      setTimerDuration(quest.duration);
    }
  }

  function setTimerDuration(mins) {
    if (timerIsRunning) return; // Prevent changing while ticking

    timerDurationSecs = mins * 60;
    timerRemainingSecs = timerDurationSecs;

    // Update preset chips
    document.querySelectorAll('.timer-presets .preset-chip').forEach((chip) => {
      const match = chip.textContent.includes(`${mins} min`);
      chip.classList.toggle('active', match);
    });

    updateTimerDisplay();
  }

  function toggleTimer() {
    if (timerIsRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    timerIsRunning = true;
    const icon = document.getElementById('timerPlayIcon');
    const text = document.getElementById('timerPlayText');
    const status = document.getElementById('timerStatusLabel');

    if (icon) icon.textContent = '⏸';
    if (text) text.textContent = 'Pause Focus';
    if (status) status.textContent = 'Focus sprint in progress...';

    const circle = document.getElementById('timerCircleProgress');
    if (circle) circle.style.stroke = 'var(--accent-cyan)';

    timerInterval = setInterval(() => {
      if (timerRemainingSecs > 0) {
        timerRemainingSecs--;
        updateTimerDisplay();
      } else {
        finishTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    timerIsRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;

    const icon = document.getElementById('timerPlayIcon');
    const text = document.getElementById('timerPlayText');
    const status = document.getElementById('timerStatusLabel');

    if (icon) icon.textContent = '▶';
    if (text) text.textContent = 'Resume Focus';
    if (status) status.textContent = 'Session paused';

    const circle = document.getElementById('timerCircleProgress');
    if (circle) circle.style.stroke = 'var(--accent-orange)';
  }

  function resetTimer() {
    pauseTimer();
    timerRemainingSecs = timerDurationSecs;
    const text = document.getElementById('timerPlayText');
    const status = document.getElementById('timerStatusLabel');
    if (text) text.textContent = 'Start Focus';
    if (status) status.textContent = 'Ready to begin';

    const circle = document.getElementById('timerCircleProgress');
    if (circle) circle.style.stroke = 'var(--primary)';

    updateTimerDisplay();
  }

  function finishTimer() {
    pauseTimer();
    playTimerBell();
    triggerConfetti(0.5, 0.45, 60);

    const minutesFocused = Math.round(timerDurationSecs / 60);
    const xpAwarded = Math.max(10, Math.round(minutesFocused * 1.5));

    state.today.focusMins += minutesFocused;
    state.today.focusSessions += 1;

    addXp(xpAwarded);

    // If tied to an active quest, ask to mark completed
    if (timerTargetQuestId) {
      const quest = state.quests.find((q) => q.id === timerTargetQuestId);
      if (quest && quest.status !== 'completed') {
        quest.status = 'completed';
        showToast(`Focus session done! "${quest.title}" completed (+${xpAwarded + quest.xp} XP)`, '⏱️');
      } else {
        showToast(`Focus sprint completed! (+${xpAwarded} XP)`, '⏱️');
      }
    } else {
      showToast(`Focus sprint completed! (+${xpAwarded} XP)`, '⏱️');
    }

    const status = document.getElementById('timerStatusLabel');
    if (status) status.textContent = 'Sprint completed! Amazing focus.';

    saveState();
    updateUI();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerRemainingSecs / 60);
    const secs = timerRemainingSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const digits = document.getElementById('timerDigits');
    if (digits) digits.textContent = formatted;

    // Circular SVG Progress
    // Circumference of r=120 is 2 * PI * 120 = 753.982
    const circumference = 753.98;
    const fraction = timerRemainingSecs / timerDurationSecs;
    const offset = circumference * (1 - fraction);

    const circle = document.getElementById('timerCircleProgress');
    if (circle) {
      circle.style.strokeDashoffset = offset;
    }
  }

  // =========================================================================
  // BADGES & MILESTONES
  // =========================================================================
  function checkBadges() {
    let newlyUnlocked = false;

    state.badges.forEach((b) => {
      if (b.unlocked) return;

      if (b.id === 'b-shield-bearer' && state.today.capacity === 'rough') {
        b.unlocked = true;
        b.date = new Date().toLocaleDateString();
        newlyUnlocked = true;
      }
      if (b.id === 'b-focus-60' && state.today.focusMins >= 60) {
        b.unlocked = true;
        b.date = new Date().toLocaleDateString();
        newlyUnlocked = true;
      }
      if (b.id === 'b-overcomer-5' && state.adaptLog.length >= 5) {
        b.unlocked = true;
        b.date = new Date().toLocaleDateString();
        newlyUnlocked = true;
      }
    });

    if (newlyUnlocked) {
      saveState();
      playLevelUpSound();
      showToast('New Milestone Trophy Unlocked! Check Badges screen.', '🏆');
    }
  }

  function renderBadges() {
    const grid = document.getElementById('badgesGrid');
    const counter = document.getElementById('unlockedBadgesCount');
    if (!grid) return;

    const unlockedCount = state.badges.filter((b) => b.unlocked).length;
    if (counter) counter.textContent = `${unlockedCount} / ${state.badges.length} Unlocked`;

    grid.innerHTML = state.badges
      .map((b) => {
        const isUnlocked = b.unlocked;
        const statusClass = isUnlocked ? 'unlocked' : 'locked';
        const statusTag = isUnlocked ? `Unlocked ${b.date || ''}` : 'In Progress';

        return `
          <div class="badge-card ${statusClass}">
            <div class="badge-icon-box">
              <span>${b.icon}</span>
            </div>
            <div class="badge-name">${escapeHtml(b.name)}</div>
            <p class="badge-desc">${escapeHtml(b.desc)}</p>
            <span class="badge-status-tag">${statusTag}</span>
          </div>
        `;
      })
      .join('');
  }

  // =========================================================================
  // LEVEL UP MODAL CELEBRATION
  // =========================================================================
  function showLevelUpCelebration(level, title) {
    const modal = document.getElementById('levelUpModal');
    const levelNumEl = document.getElementById('modalNewLevel');
    const levelTitleEl = document.getElementById('modalNewLevelTitle');

    if (levelNumEl) levelNumEl.textContent = level;
    if (levelTitleEl) levelTitleEl.textContent = title;

    if (modal) modal.classList.add('show');
    playLevelUpSound();
    triggerConfetti(0.5, 0.4, 90);
  }

  function closeLevelUpModal() {
    const modal = document.getElementById('levelUpModal');
    if (modal) modal.classList.remove('show');
  }

  // =========================================================================
  // SIDEBAR, TOPBAR, AND KPI SYNC
  // =========================================================================
  function updateUI() {
    const lvlInfo = getLevelInfo(state.user.totalXp);

    // Sidebar Level Card
    const sbLevelNum = document.getElementById('sbLevelNum');
    const sbLevelTitle = document.getElementById('sbLevelTitle');
    const sbXpCount = document.getElementById('sbXpCount');
    const sbXpBar = document.getElementById('sbXpBar');
    const sbXpToNext = document.getElementById('sbXpToNext');

    if (sbLevelNum) sbLevelNum.textContent = lvlInfo.level;
    if (sbLevelTitle) sbLevelTitle.textContent = lvlInfo.title;
    if (sbXpCount) sbXpCount.textContent = `${state.user.totalXp} / ${lvlInfo.isMaxLevel ? state.user.totalXp : lvlInfo.tierRange + lvlInfo.progressInTier} XP`;
    if (sbXpBar) sbXpBar.style.width = `${lvlInfo.percentage}%`;
    if (sbXpToNext) sbXpToNext.textContent = lvlInfo.isMaxLevel ? 'Max level reached!' : `${lvlInfo.xpToNext} XP to Level ${lvlInfo.level + 1}`;

    // Sidebar Streak Card
    const sbStreakDays = document.getElementById('sbStreakDays');
    const sbOnPlanDays = document.getElementById('sbOnPlanDays');
    const sbAdaptedDays = document.getElementById('sbAdaptedDays');

    if (sbStreakDays) sbStreakDays.textContent = `${state.streak.days} Days`;
    if (sbOnPlanDays) sbOnPlanDays.textContent = state.streak.onPlanDays;
    if (sbAdaptedDays) sbAdaptedDays.textContent = state.streak.adaptedDays;

    // Today Pending Count
    const pendingCount = state.quests.filter((q) => q.status === 'pending').length;
    const todayBadge = document.getElementById('todayPendingCount');
    if (todayBadge) todayBadge.textContent = pendingCount;

    // Adapt Total Pill
    const adaptTotalPill = document.getElementById('adaptTotalPill');
    if (adaptTotalPill) adaptTotalPill.textContent = `+${state.adaptLog.length * 15} XP`;

    // Topbar
    const topCapacityText = document.getElementById('topCapacityText');
    const capacityDot = document.getElementById('capacityDot');
    const topXpToday = document.getElementById('topXpToday');

    const capLabels = { normal: 'Normal Day', tight: 'Tight Day', rough: 'Rough Day (Shield)' };
    if (topCapacityText) topCapacityText.textContent = capLabels[state.today.capacity] || 'Normal Day';
    if (capacityDot) {
      capacityDot.className = 'capacity-dot';
      if (state.today.capacity === 'rough') capacityDot.style.background = 'var(--accent-orange)';
      else if (state.today.capacity === 'tight') capacityDot.style.background = 'var(--accent-cyan)';
      else capacityDot.style.background = 'var(--accent-green)';
    }
    if (topXpToday) topXpToday.textContent = `+${state.today.xpEarned} XP`;

    // Hero section
    const heroLevelNum = document.getElementById('heroLevelNum');
    if (heroLevelNum) heroLevelNum.textContent = lvlInfo.level;

    // KPI Cards
    const kpiXpToday = document.getElementById('kpiXpToday');
    const kpiStreakDays = document.getElementById('kpiStreakDays');
    const kpiCapacity = document.getElementById('kpiCapacity');
    const kpiFocusMins = document.getElementById('kpiFocusMins');
    const kpiFocusSessions = document.getElementById('kpiFocusSessions');
    const kpiXpPotential = document.getElementById('kpiXpPotential');

    if (kpiXpToday) kpiXpToday.innerHTML = `${state.today.xpEarned} <span class="stat-unit">XP</span>`;
    if (kpiStreakDays) kpiStreakDays.innerHTML = `${state.streak.days} <span class="stat-unit">Days</span>`;
    if (kpiCapacity) kpiCapacity.textContent = capLabels[state.today.capacity];
    if (kpiFocusMins) kpiFocusMins.innerHTML = `${state.today.focusMins} <span class="stat-unit">min</span>`;
    if (kpiFocusSessions) kpiFocusSessions.textContent = `${state.today.focusSessions} sessions completed`;

    const remainingPotential = state.quests
      .filter((q) => q.status === 'pending')
      .reduce((acc, q) => acc + q.xp, 0);
    if (kpiXpPotential) {
      kpiXpPotential.textContent = `${pendingCount} quests left · up to ${remainingPotential} XP`;
    }

    // Plan note
    const planNote = document.getElementById('planNote');
    if (planNote) {
      if (state.today.capacity === 'rough') {
        planNote.textContent = 'Shield Mode Active: 1 single micro check-in protects your streak!';
      } else if (state.today.capacity === 'tight') {
        planNote.textContent = 'Tight Schedule Mode: Focused on top 2 priorities only.';
      } else {
        planNote.textContent = `Sized for a normal day (${state.quests.length} quests · ~55 min)`;
      }
    }

    // Progress Screen
    const progLvlNum = document.getElementById('progLvlNum');
    const progLvlTitle = document.getElementById('progLvlTitle');
    const progTotalXp = document.getElementById('progTotalXp');
    const progXpToNext = document.getElementById('progXpToNext');
    const progLvlBar = document.getElementById('progLvlBar');

    if (progLvlNum) progLvlNum.textContent = lvlInfo.level;
    if (progLvlTitle) progLvlTitle.textContent = lvlInfo.title;
    if (progTotalXp) progTotalXp.textContent = state.user.totalXp;
    if (progXpToNext) progXpToNext.textContent = lvlInfo.isMaxLevel ? 'Max Level' : `${lvlInfo.xpToNext} XP`;
    if (progLvlBar) progLvlBar.style.width = `${lvlInfo.percentage}%`;

    // Render screen sub-components
    renderQuests();
    renderTimeline();
    renderGoals();
    renderAdaptLog();
    renderBadges();
  }

  // =========================================================================
  // DATA BACKUP & RESTORE
  // =========================================================================
  function exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `replan_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Data exported successfully!', '💾');
  }

  function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.user && imported.quests) {
          state = imported;
          saveState();
          updateUI();
          showToast('Data restored successfully!', '✅');
        } else {
          showToast('Invalid backup file format', '❌');
        }
      } catch (err) {
        showToast('Error parsing JSON backup', '❌');
      }
    };
    reader.readAsText(file);
  }

  function openResetModal() {
    if (confirm('Reset Replan to default sample demonstration state? This will restore sample data.')) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      updateUI();
      showToast('Reset to demo sample state', '↺');
    }
  }

  // Helper escape function
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Set today's date label in topbar
  function updateTopbarDate() {
    const el = document.getElementById('topbarDate');
    const greetingEl = document.getElementById('todayGreeting');
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    if (el) el.textContent = now.toLocaleDateString('en-US', options);

    if (greetingEl) {
      const hour = now.getHours();
      let greeting = 'Good evening';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 18) greeting = 'Good afternoon';
      greetingEl.textContent = `${greeting}, ${state.user.name}`;
    }
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    updateTopbarDate();
    updateUI();
    setTimerDuration(20);

    // Sync sound button icon
    const icon = document.getElementById('soundIcon');
    if (icon) icon.textContent = state.user.soundEnabled ? '🔊' : '🔇';

    // Handle ESC key to close open modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCapacityModal();
        closeAdaptModal();
        closeGoalModal();
        closeAddQuestModal();
        closeLevelUpModal();
      }
    });

    // Handle backdrop click to close modals
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('show');
        }
      });
    });
  });

  // =========================================================================
  // EXPORT TO GLOBAL SCOPE FOR INLINE HTML HANDLERS
  // =========================================================================
  window.switchScreen = switchScreen;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.completeQuest = completeQuest;
  window.startFocusOnQuest = startFocusOnQuest;
  window.filterQuests = filterQuests;
  window.openAdaptModal = openAdaptModal;
  window.closeAdaptModal = closeAdaptModal;
  window.selectReason = selectReason;
  window.selectFit = selectFit;
  window.confirmAdaptSelection = confirmAdaptSelection;
  window.openCapacityModal = openCapacityModal;
  window.closeCapacityModal = closeCapacityModal;
  window.selectCapacityOption = selectCapacityOption;
  window.confirmCapacitySelection = confirmCapacitySelection;
  window.openAddGoalModal = openAddGoalModal;
  window.closeGoalModal = closeGoalModal;
  window.selectGoalCategory = selectGoalCategory;
  window.submitCreateGoal = submitCreateGoal;
  window.quickAddQuestForGoal = quickAddQuestForGoal;
  window.openAddQuestModal = openAddQuestModal;
  window.closeAddQuestModal = closeAddQuestModal;
  window.submitAddQuest = submitAddQuest;
  window.closeLevelUpModal = closeLevelUpModal;
  window.syncTimerTarget = syncTimerTarget;
  window.setTimerDuration = setTimerDuration;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
  window.toggleAmbientNoise = toggleAmbientNoise;
  window.toggleSound = toggleSound;
  window.exportData = exportData;
  window.importData = importData;
  window.openResetModal = openResetModal;
})();

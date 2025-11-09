document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const personContainer = document.getElementById('person-container') as HTMLElement;
    const personEmoji = document.getElementById('person-emoji') as HTMLElement;
    const personLabel = document.getElementById('person-label') as HTMLElement;
    const airportImg = document.getElementById('airport-img') as HTMLElement;
    const airportContainer = document.getElementById('airport-container') as HTMLElement;
    const airportLabel = document.getElementById('airport-label') as HTMLElement;
    const awayAirportPlaceholder = document.getElementById('away-airport-placeholder') as HTMLButtonElement;
    const passportOfficeContainer = document.getElementById('passport-office-container') as HTMLElement;
    const restaurantContainer = document.getElementById('restaurant-container') as HTMLButtonElement;
    const giftShopContainer = document.getElementById('gift-shop-container') as HTMLButtonElement;
    const mfGroupContainer = document.getElementById('mf-group-container') as HTMLElement;
    const luggageContainer = document.getElementById('luggage-container') as HTMLElement;
    const settingsContainer = document.getElementById('settings-container') as HTMLElement;
    const officerMessage = document.getElementById('officer-message') as HTMLElement;
    const passportDialog = document.getElementById('passport-dialog') as HTMLElement;
    const settingsDialog = document.getElementById('settings-dialog') as HTMLElement;
    const applyPassportBtn = document.getElementById('apply-passport-btn') as HTMLButtonElement;
    const successMessage = document.getElementById('success-message') as HTMLElement;
    const successText = document.getElementById('success-text') as HTMLElement;
    const scoreEl = document.getElementById('score') as HTMLElement;
    const flightsDialog = document.getElementById('flights-dialog') as HTMLElement;
    const flightsContainer = document.getElementById('flights-container') as HTMLElement;
    const flightTooltip = document.getElementById('flight-tooltip') as HTMLElement;
    const planeAnimationDialog = document.getElementById('plane-animation') as HTMLElement;
    const passportCelebration = document.getElementById('passport-celebration') as HTMLElement;
    const visaAnimationDialog = document.getElementById('visa-animation') as HTMLElement;
    const visaStickerEmoji = document.getElementById('visa-sticker-emoji') as HTMLElement;
    const cityImageContainer = document.getElementById('city-image-container') as HTMLElement;
    const cityImage = document.getElementById('city-image') as HTMLImageElement;
    const restaurantViewContainer = document.getElementById('restaurant-view-container') as HTMLElement;
    const restaurantImage = document.getElementById('restaurant-image') as HTMLImageElement;
    const captionContainer = document.getElementById('caption-container') as HTMLElement;
    const cityTitle = document.getElementById('city-title') as HTMLElement;
    const cityEmojis = document.getElementById('city-emojis') as HTMLElement;
    const visitedCitiesList = document.getElementById('visited-cities-list') as HTMLElement;
    const visitedList = document.getElementById('visited-list') as HTMLUListElement;
    const giftShopDialog = document.getElementById('gift-shop-dialog') as HTMLElement;
    const giftShopItemsContainer = document.getElementById('gift-shop-items-container') as HTMLElement;
    const exitGiftShopBtn = document.getElementById('exit-gift-shop-btn') as HTMLButtonElement;
    const souvenirsContainer = document.getElementById('souvenirs-container') as HTMLElement;
    const souvenirsList = document.getElementById('souvenirs-list') as HTMLElement;
    
    // Restaurant & Minigame Elements
    const restaurantDialog = document.getElementById('restaurant-dialog') as HTMLElement;
    const minigameDialog = document.getElementById('minigame-dialog') as HTMLElement;
    const staffDialog = document.getElementById('staff-dialog') as HTMLElement;
    const workShiftBtn = document.getElementById('work-shift-btn') as HTMLButtonElement;
    const manageStaffBtn = document.getElementById('manage-staff-btn') as HTMLButtonElement;
    const memoryMatchBtn = document.getElementById('memory-match-btn') as HTMLButtonElement;
    const gemSwapBtn = document.getElementById('gem-swap-btn') as HTMLButtonElement;
    const friesContainer = document.getElementById('fries-container') as HTMLElement;
    const bagDropzone = document.getElementById('bag-dropzone') as HTMLElement;
    const minigameTitle = document.getElementById('minigame-title') as HTMLElement;
    const staffStatus = document.getElementById('staff-status') as HTMLElement;
    const hireWorkerBtn = document.getElementById('hire-worker-btn') as HTMLButtonElement;
    const promoteWorkerBtn = document.getElementById('promote-worker-btn') as HTMLButtonElement;
    const workerAnimationContainer = document.getElementById('worker-animation-container') as HTMLElement;
    const workerAnimationRow = document.getElementById('worker-animation-row') as HTMLElement;
    
    // New Minigame Elements
    const memoryGameDialog = document.getElementById('memory-game-dialog') as HTMLElement;
    const memoryGameGrid = document.getElementById('memory-game-grid') as HTMLElement;
    const gemSwapDialog = document.getElementById('gem-swap-dialog') as HTMLElement;
    const gemSwapGrid = document.getElementById('gem-swap-grid') as HTMLElement;
    
    // Settings Elements
    const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
    const sfxMuteBtn = document.getElementById('sfx-mute-btn') as HTMLButtonElement;
    const musicMuteBtn = document.getElementById('music-mute-btn') as HTMLButtonElement;
    const settingsOkBtn = document.getElementById('settings-ok-btn') as HTMLButtonElement;

    // Multiplayer and Chat Elements
    const otherPlayersContainer = document.getElementById('other-players-container') as HTMLElement;
    const chatContainer = document.getElementById('chat-container') as HTMLElement;
    const chatHistory = document.getElementById('chat-history') as HTMLElement;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const chatSendBtn = document.getElementById('chat-send-btn') as HTMLButtonElement;
    const selfChatBubble = document.getElementById('self-chat-bubble') as HTMLElement;


    // --- Audio Engine ---
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    function playSound(type: 'move' | 'earn' | 'success' | 'takeoff' | 'error' | 'click' | 'passport-get' | 'stamp' | 'pop' | 'welcome' | 'ding-dong' | 'card-flip') {
        if (isSfxMuted) return;
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        
        if (type === 'pop') {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, now);
            osc.frequency.setValueAtTime(800, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'earn') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.15, now);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now); // A5 note
            osc.frequency.setValueAtTime(1046.50, now + 0.05); // C6 note
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'click') {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, now);
            osc.frequency.setValueAtTime(200, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'stamp') {
             const osc = audioCtx.createOscillator();
             osc.type = 'triangle';
             gainNode.gain.setValueAtTime(0.3, now);
             osc.frequency.setValueAtTime(150, now);
             osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
             gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
             osc.connect(gainNode);
             osc.start(now);
             osc.stop(now + 0.2);
        } else if (type === 'passport-get' || type === 'welcome') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.2, now);
            osc.type = 'sine';
            const notes = type === 'welcome' ? [523, 784, 1046] : [523, 659, 784, 1046];
            notes.forEach((freq, i) => {
                 osc.frequency.setValueAtTime(freq, now + i * 0.1);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + (notes.length * 0.1 + 0.1));
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + (notes.length * 0.1 + 0.1));
        } else if (type === 'success') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.15, now);
            osc.type = 'sine';
            const notes = [440, 554, 659];
            notes.forEach((freq, i) => {
                osc.frequency.setValueAtTime(freq, now + i * 0.15);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + (notes.length * 0.15 + 0.2));
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + (notes.length * 0.15 + 0.2));
        } else if(type === 'ding-dong') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.2, now);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.setValueAtTime(900, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'takeoff') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.2, now);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 1.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 1.5);
        } else if (type === 'error') {
             const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.1, now);
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'card-flip') {
            const osc = audioCtx.createOscillator();
            osc.type = 'triangle';
            gainNode.gain.setValueAtTime(0.1, now);
            osc.frequency.setValueAtTime(1200, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    }
    
    // --- Advanced Audio Engine (Unchanged) ---
    interface CitySound { notes: string[]; durations: number | number[]; oscType: string; filter: { type: string; cutoff: number; Q: number; }; adsr: { attack: number; decay: number; sustain: number; release: number; }; amp: number; vibrato?: { depth: number; rate: number; }; percussion?: { noiseTime: number; noiseGain: number; }; }
    const citySoundData: Record<string, CitySound> = { "Istanbul": { notes: ["D4","Eb4","F#4","G4","A4","F#4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1200, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.35, release:0.3 }, amp: 0.12, vibrato: { depth:6, rate:5 } }, "Paris": { notes: ["G4","B4","D5","B4"], durations: 0.6, oscType: "triangle", filter: { type:"bandpass", cutoff:900, Q:1.4 }, adsr: { attack:0.02, decay:0.08, sustain:0.7, release:0.2 }, amp: 0.14, vibrato: { depth:2.5, rate:5 } }, "Kyoto": { notes: ["D4","E4","G4","A4","C5"], durations: 0.6, oscType: "sine", filter: { type:"lowpass", cutoff:1800, Q:0.8 }, adsr: { attack:0.01, decay:0.15, sustain:0.4, release:0.4 }, amp: 0.11, vibrato: { depth:4, rate:4 } }, "Sydney": { notes: ["A2"], durations: 3.0, oscType: "square", filter: { type:"lowpass", cutoff:500, Q:1.0 }, adsr: { attack:0.05, decay:0.2, sustain:0.8, release:0.8 }, amp: 0.12, percussion: { noiseTime:0.6, noiseGain:0.08 } }, "Barcelona": { notes: ["E4","F4","G4","B4","E5"], durations: 0.35, oscType: "sawtooth", filter: { type:"lowpass", cutoff:2200, Q:0.9 }, adsr: { attack:0.002, decay:0.08, sustain:0.3, release:0.25 }, amp: 0.13, vibrato: { depth:5, rate:6 } }, "London": { notes: ["C4","E4","G4","C5"], durations: 0.45, oscType: "triangle", filter: { type:"bandpass", cutoff:900, Q:1.8 }, adsr: { attack:0.01, decay:0.08, sustain:0.5, release:0.2 }, amp: 0.15 }, "New York": { notes: ["Bb3","D4","F4","Ab4","Bb4"], durations: 0.35, oscType: "sawtooth", filter: { type:"bandpass", cutoff:900, Q:1.5 }, adsr: { attack:0.01, decay:0.07, sustain:0.45, release:0.18 }, amp: 0.14, vibrato: { depth:7, rate:5 } }, "Bangkok": { notes: ["E4","F#4","G#4","B4","C#5"], durations: 0.45, oscType: "square", filter: { type:"lowpass", cutoff:3600, Q:0.7 }, adsr: { attack:0.002, decay:0.06, sustain:0.25, release:0.22 }, amp: 0.12 }, "Cape Town": { notes: ["C4","D4","E4","G4","A4","G4"], durations: 0.45, oscType: "sine", filter: { type:"lowpass", cutoff:1800, Q:0.5 }, adsr: { attack:0.002, decay:0.06, sustain:0.3, release:0.18 }, amp: 0.11 }, "Budapest": { notes: ["A3","C#4","D4","E4","G#4","A4"], durations: 0.4, oscType: "sawtooth", filter: { type:"lowpass", cutoff:2100, Q:1.0 }, adsr: { attack:0.01, decay:0.08, sustain:0.4, release:0.25 }, amp: 0.13 }, "Cairo": { notes: ["D4","E4","F#4","G4","A4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1200, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.35, release:0.3 }, amp: 0.12, vibrato: { depth:6, rate:5 } }, "Jeddah": { notes: ["C4","D4","E4","F4","G4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1100, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.33, release:0.28 }, amp: 0.12, vibrato: { depth:5, rate:5 } }, "Karachi": { notes: ["C4","Db4","E4","F4","G4","Ab4","B4","C5"], durations: 0.38, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1400, Q:1.1 }, adsr: { attack:0.005, decay:0.1, sustain:0.3, release:0.25 }, amp: 0.12, vibrato: { depth:6, rate:5.5 } }, "Toronto": { notes: ["G3", "C4", "C4", "D4", "E4"], durations: [0.7, 0.3, 0.4, 0.7, 0.7], oscType: "triangle", filter: { type:"lowpass", cutoff:1800, Q:1.0 }, adsr: { attack:0.02, decay:0.1, sustain:0.7, release:0.4 }, amp: 0.15 } };
    function noteToFreq(note: string): number | null { const noteRegex = /^([A-Ga-g])([#b]?)(-?\d+)$/; const m = note.match(noteRegex); if (!m) return null; let [, letter, accidental, octave] = m; letter = letter.toUpperCase(); const semitoneMap: {[key: string]: number} = { 'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11 }; let semis = semitoneMap[letter]; if (accidental === '#') semis += 1; if (accidental === 'b') semis -= 1; const midi = (parseInt(octave,10) + 1) * 12 + semis; const freq = 440 * Math.pow(2, (midi - 69)/12); return +freq.toFixed(3); }
    function applyADSR(param: AudioParam, startTime: number, attack: number, decay: number, sustainLevel: number, release: number, duration: number) { const t0 = startTime; param.cancelScheduledValues(t0); param.setValueAtTime(0.0001, t0); param.exponentialRampToValueAtTime(1.0, t0 + attack); param.exponentialRampToValueAtTime(Math.max(0.0001, sustainLevel), t0 + attack + decay); const releaseStart = t0 + duration; param.setValueAtTime(Math.max(0.0001, sustainLevel), releaseStart); param.exponentialRampToValueAtTime(0.0001, releaseStart + release); }
    function playCitySound(cityName: keyof typeof citySoundData) { 
        if (isMusicMuted) return;
        const data = citySoundData[cityName]; if (!data) return; if (audioCtx.state === 'suspended') audioCtx.resume(); const start = audioCtx.currentTime + 0.05; const master = audioCtx.createGain(); master.gain.value = data.amp; master.connect(audioCtx.destination); let vibOsc: OscillatorNode | null = null, vibGain: GainNode | null = null; if (data.vibrato) { vibOsc = audioCtx.createOscillator(); vibOsc.type = "sine"; vibOsc.frequency.value = data.vibrato.rate; vibGain = audioCtx.createGain(); vibGain.gain.value = data.vibrato.depth; vibOsc.connect(vibGain); vibOsc.start(start); } if (data.percussion) { const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 1.0, audioCtx.sampleRate); const arr = noiseBuf.getChannelData(0); for (let i=0; i<arr.length; i++) arr[i] = (Math.random()*2-1) * Math.exp(-i/(audioCtx.sampleRate*0.25)); const src = audioCtx.createBufferSource(); src.buffer = noiseBuf; const g = audioCtx.createGain(); g.gain.value = data.percussion.noiseGain; src.connect(g); g.connect(master); src.start(start + data.percussion.noiseTime); } let time = start; data.notes.forEach((note, idx) => { const hz = noteToFreq(note); if (!hz) return; const dur = Array.isArray(data.durations) ? data.durations[idx] ?? data.durations[0] : data.durations; const osc = audioCtx.createOscillator(); osc.type = data.oscType as OscillatorType || "sine"; osc.frequency.value = hz; if (vibGain) vibGain.connect(osc.frequency); const filter = audioCtx.createBiquadFilter(); filter.type = data.filter.type as BiquadFilterType || "lowpass"; filter.frequency.value = data.filter.cutoff; filter.Q.value = data.filter.Q || 1.0; const gainNode = audioCtx.createGain(); gainNode.gain.value = 0.0001; osc.connect(filter); filter.connect(gainNode); gainNode.connect(master); applyADSR(gainNode.gain, time, data.adsr.attack, data.adsr.decay, data.adsr.sustain, data.adsr.release, dur); osc.start(time); osc.stop(time + dur + data.adsr.release + 0.02); time += dur; }); }

    // --- Game State ---
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let hasPassport = false;
    let score = 0;
    let currentLocation = 'Toronto';
    let currentMovePromise: Function | null = null;
    let isInteracting = false; // Prevents multiple interactions at once
    let isLuggageFollowing = false;
    let isFacingRight = false; // Emoji faces left by default
    let playerName = 'Person';
    let isSfxMuted = false;
    let isMusicMuted = false;
    let animationPromiseResolver: Function | null = null;
    let draggedItem: HTMLElement | null = null;
    const visitedCities = new Set<string>();
    const collectedSouvenirs = new Map<string, { name: string; emoji: string; cost: number }>();
    const unlockedRecipes = new Map<string, { name: string; emoji: string; cost: number }>();
    let hasWorker = false;
    let workerLevel = 0;
    let workerIntervalId: number | null = null;
    let hasPlayedMinigame = false;
    let haveMinigamesBeenUnlocked = false;
    
    // --- Multiplayer State ---
    interface OtherPlayer {
        id: string;
        name: string;
        emoji: string;
        x: number;
        y: number;
        targetX: number;
        targetY: number;
        zone: string;
        city: string;
        isFacingRight: boolean;
        element: HTMLElement;
        emojiElement: HTMLElement;
        labelElement: HTMLElement;
        bubbleElement: HTMLElement;
        color: string;
    }

    const selfId = crypto.randomUUID();
    const otherPlayers = new Map<string, OtherPlayer>();
    let lastChatTimestamp = 0;

    // --- Data ---
    const flightData = [
        { city: 'Istanbul', airline: 'Turkish Airlines', cost: 750, airport: 'IST', time: 10.5, lang: 'tr-TR', welcomeMessage: 'İstanbul\'a hoşgeldiniz!', nativePhrase: 'Çok güzel!', fact: 'Did you know? Istanbul is the only city that straddles two continents, Europe and Asia.', fact2: 'Local Tip: For a true taste of the city, try a "simit" (a circular bread with sesame seeds) from a street vendor.', visa: '🇹🇷', fontFamily: "'Meie Script', cursive", flagColors: ['#E30A17', '#FFFFFF'], emojis: ['🇹🇷', '🕌', '🧿', '☕️', '🥙', '🐈', '⛵', '📿'], cityImage: 'https://images.unsplash.com/photo-1636537511494-c3e558e0702b?auto=format&fit=crop&w=1932&q=80', airportImage: 'https://images.unsplash.com/photo-1576530519306-68a3b392f46f?auto=format&fit=crop&w=1950&q=80', restaurantImage: 'https://i.ibb.co/VYYjjP8g/istanbulcafe.jpg', souvenirs: [{ name: 'Turkish Delight', emoji: '🍬', cost: 25 }, { name: 'Evil Eye Charm', emoji: '🧿', cost: 40 }], recipe: { name: 'Kebab Recipe', emoji: '🥙', cost: 400 } },
        { city: 'Paris', airline: 'Air France', cost: 650, airport: 'CDG', time: 7.5, lang: 'fr-FR', welcomeMessage: 'Bienvenue à Paris!', nativePhrase: 'Oh là là!', fact: 'Did you know? The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron.', fact2: 'Local Tip: Skip the tourist traps! Find a local "boulangerie" for a fresh sandwich. It\'s cheaper and more authentic.', visa: '🇫🇷', fontFamily: "'Parisienne', cursive", flagColors: ['#0055A4', '#FFFFFF', '#EF4135'], emojis: ['🇫🇷', '🥐', '🍷', '🎨', '🗼', '🧀', '🧑‍🎨', '👗', '🥖'], cityImage: 'https://images.unsplash.com/photo-1499621574732-72324384dfbc?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://images.unsplash.com/photo-1672310708154-771583101dbb?auto=format&fit=crop&w=1974&q=80', restaurantImage: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Mini Eiffel Tower', emoji: '🗼', cost: 50 }, { name: 'Beret', emoji: '👒', cost: 75 }], recipe: { name: 'Croissant Recipe', emoji: '🥐', cost: 350 } },
        { city: 'Kyoto', airline: 'Japan Airlines', cost: 1350, airport: 'KIX', time: 14.0, lang: 'ja-JP', welcomeMessage: '京都へようこそ！', nativePhrase: 'Subarashii.', fact: 'Did you know? Kyoto has over 1,600 Buddhist temples and 400 Shinto shrines.', fact2: 'Local Tip: When visiting Gion, you might spot a real Geiko (Geisha). Remember to be respectful and not block their path.', visa: '🇯🇵', fontFamily: "'Yuji Syuku', serif", flagColors: ['#FFFFFF', '#BC002D'], emojis: ['🇯🇵', '🌸', '🏯', '🍣', '🍵', '🎋', '⛩️', '👘', '🦊'], cityImage: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1579027889354-95a28102a033?auto=format&fit=crop&w=1932&q=80', restaurantImage: 'https://images.pexels.com/photos/2290075/pexels-photo-2290075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Folding Fan', emoji: '🪭', cost: 60 }, { name: 'Omamori Charm', emoji: '🧧', cost: 45 }], recipe: { name: 'Sushi Recipe', emoji: '🍣', cost: 700 } },
        { city: 'Sydney', airline: 'Qantas', cost: 1550, airport: 'SYD', time: 22.0, lang: 'en-AU', welcomeMessage: 'G\'day mate, welcome to Sydney!', nativePhrase: 'No worries, mate.', fact: 'Did you know? The Sydney Opera House design was inspired by the peeling of an orange.', fact2: 'Local Tip: Take the ferry from Circular Quay to Manly for stunning harbor views that rival any expensive tour.', visa: '🇦🇺', fontFamily: "'Poppins', sans-serif", flagColors: ['#00008B', '#FFFFFF', '#FF0000'], emojis: ['🇦🇺', '🐨', '🦘', '🏄‍♂️', '🌉', '☀️', '🚤', '🍖', '🏖️'], cityImage: 'https://images.unsplash.com/photo-1524293581273-7926b78a82ce?auto=format&fit=crop&w=2070&q=80', airportImage: 'https://images.unsplash.com/photo-1542347522-95e24451b1b0?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1598501257922-3c82b1373559?auto=format&fit=crop&w=1974&q=80', souvenirs: [{ name: 'Boomerang', emoji: '🪃', cost: 55 }, { name: 'Koala Plushie', emoji: '🐨', cost: 80 }], recipe: { name: 'Meat Pie Recipe', emoji: '🥧', cost: 800 } },
        { city: 'Barcelona', airline: 'Iberia', cost: 700, airport: 'BCN', time: 8.0, lang: 'es-ES', welcomeMessage: '¡Bienvenido a Barcelona!', nativePhrase: '¡Qué guay!', fact: 'Did you know? Barcelona\'s famous Sagrada Família has been under construction for over 140 years.', fact2: 'Local Tip: Enjoy "tapas" like a local by bar-hopping in the El Born or Gràcia neighborhoods, not on La Rambla.', visa: '🇪🇸', fontFamily: "'Lobster', cursive", flagColors: ['#AA151B', '#F1BF00'], emojis: ['🇪🇸', '💃', '⚽️', '🥘', '🦎', '🏛️', '🍤', '🎶', ' Gaudí '], cityImage: 'https://images.unsplash.com/photo-1587789202069-f5729a835339?auto=format&fit=crop&w=2070&q=80', airportImage: 'https://i.ibb.co/356j3tp0/barcelonaairport.jpg', restaurantImage: 'https://i.ibb.co/pBBq1vK4/barcelonarestaurnat.jpg', souvenirs: [{ name: 'Mosaic Lizard', emoji: '🦎', cost: 65 }, { name: 'Paella Pan', emoji: '🥘', cost: 90 }], recipe: { name: 'Paella Recipe', emoji: '🥘', cost: 450 } },
        { city: 'London', airline: 'British Airways', cost: 680, airport: 'LHR', time: 7.0, lang: 'en-GB', welcomeMessage: 'Welcome to London, cheers!', nativePhrase: 'Lovely jubbly!', fact: 'Did you know? The London Underground is the oldest underground railway network in the world, known as "the Tube".', fact2: 'Local Tip: Many of London\'s best museums, like the British Museum and the National Gallery, are completely free to enter!', visa: '🇬🇧', fontFamily: "'Playfair Display', serif", flagColors: ['#012169', '#FFFFFF', '#C8102E'], emojis: ['🇬🇧', '👑', '💂‍♂️', '☕️', '🚌', '🏛️', '☔', '🎭', '☎️'], cityImage: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/LHR_Terminal_5_departures.jpg', restaurantImage: 'https://images.unsplash.com/photo-1600375685293-84736939965d?auto=format&fit=crop&w=1974&q=80', souvenirs: [{ name: 'Double Decker Bus', emoji: '🚌', cost: 60 }, { name: 'Royal Guard Hat', emoji: '💂‍♂️', cost: 90 }], recipe: { name: 'Fish & Chips Recipe', emoji: '🐟', cost: 380 } },
        { city: 'New York', airline: 'Delta Airlines', cost: 250, airport: 'JFK', time: 1.8, lang: 'en-US', welcomeMessage: 'Welcome to the Big Apple!', nativePhrase: "How you doin'?", fact: 'Did you know? The first pizzeria in the United States was opened in New York City in 1905.', fact2: 'Local Tip: Walk across the Brooklyn Bridge from Brooklyn towards Manhattan for an unforgettable skyline view.', visa: '🇺🇸', fontFamily: "'Oswald', sans-serif", flagColors: ['#B22234', '#FFFFFF', '#3C3B6E'], emojis: ['🇺🇸', '🗽', '🚕', '🍎', '🏙️', '🍕', '🥨', '🎭', '🎷'], cityImage: 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=2074&q=80', airportImage: 'https://i.ibb.co/4RKjNLVD/newyorkairport.jpg', restaurantImage: 'https://i.ibb.co/CK76J5QG/newyorkrestaurant.jpg', souvenirs: [{ name: 'I ❤️ NY Shirt', emoji: '👕', cost: 40 }, { name: 'Statue of Liberty', emoji: '🗽', cost: 80 }], recipe: { name: 'Pizza Recipe', emoji: '🍕', cost: 250 } },
        { city: 'Bangkok', airline: 'Thai Airways', cost: 1100, airport: 'BKK', time: 21.0, lang: 'th-TH', welcomeMessage: 'ยินดีต้อนรับสู่กรุงเทพ!', nativePhrase: 'Sawasdee krap.', fact: 'Did you know? Bangkok\'s full ceremonial name is one of the longest city names in the world.', fact2: 'Local Tip: A ride on a Chao Phraya Express Boat is a cheap and scenic way to see the city and avoid the traffic.', visa: '🇹🇭', fontFamily: "'Sriracha', cursive", flagColors: ['#A51931', '#FFFFFF', '#2E428B'], emojis: ['🇹🇭', '🐘', '🥭', '🛶', '🙏', '🛺', '🌶️', 'ക്ഷേത്ര', '🍜'], cityImage: 'https://images.unsplash.com/photo-1539093382943-2c1b9ea9901e?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://images.unsplash.com/photo-1560026339-136336b15a03?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Tuk-Tuk Model', emoji: '🛺', cost: 50 }, { name: 'Elephant Pants', emoji: '🐘', cost: 65 }], recipe: { name: 'Curry Recipe', emoji: '🍛', cost: 600 } },
        { city: 'Cape Town', airline: 'South African Airways', cost: 1300, airport: 'CPT', time: 22.5, lang: 'en-ZA', welcomeMessage: 'Welcome to Cape Town!', nativePhrase: 'Howzit!', fact: 'Did you know? Cape Town is home to the incredibly rich Cape Floral Kingdom, a World Heritage site.', fact2: 'Local Tip: For the best sunset, skip the crowds on Table Mountain and hike to the top of Lion\'s Head or Signal Hill.', visa: '🇿🇦', fontFamily: "'Ubuntu', sans-serif", flagColors: ['#007A4D', '#FFB612', '#000000'], emojis: ['🇿🇦', '🐧', '🦁', '🍇', '⛰️', '🌺', '🐋', '🎨', '🥁'], cityImage: 'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1629837941212-909774a38e65?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1623945722345-9ab4a7134262?auto=format&fit=crop&w=1964&q=80', souvenirs: [{ name: 'Vuvuzela', emoji: '🎺', cost: 35 }, { name: 'Beaded Animal', emoji: '🦒', cost: 70 }], recipe: { name: 'Biltong Recipe', emoji: '🥩', cost: 680 } },
        { city: 'Budapest', airline: 'Lufthansa', cost: 850, airport: 'BUD', time: 10.5, lang: 'hu-HU', welcomeMessage: 'Üdvözöljük Budapesten!', nativePhrase: 'Egészségedre!', fact: 'Did you know? Budapest is known as the "City of Spas" with over 120 thermal springs.', fact2: 'Local Tip: Don\'t miss the unique atmosphere of the "ruin bars" in the old Jewish Quarter, built in abandoned buildings.', visa: '🇭🇺', fontFamily: "'Cinzel', serif", flagColors: ['#CD2A3E', '#FFFFFF', '#436F4D'], emojis: ['🇭🇺', '🏰', '🌶️', '♨️', '🎻', '🌉', '🥘', '🍷', '큐브'], cityImage: 'https://images.pexels.com/photos/4674317/pexels-photo-4674317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1601842971550-b74a3f379637?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Paprika Spice', emoji: '🌶️', cost: 30 }, { name: 'Rubik\'s Cube', emoji: '🧊', cost: 50 }], recipe: { name: 'Goulash Recipe', emoji: '🍲', cost: 500 } },
        { city: 'Cairo', airline: 'EgyptAir', cost: 950, airport: 'CAI', time: 11.5, lang: 'ar-EG', welcomeMessage: 'أهلاً بك في القاهرة!', nativePhrase: 'Yalla bina!', fact: 'Did you know? Cairo is home to the Great Pyramids of Giza, the only one of the Seven Wonders of the Ancient World still standing.', fact2: 'Local Tip: When shopping in the Khan el-Khalili bazaar, friendly bargaining is expected and part of the fun!', visa: '🇪🇬', fontFamily: "'Almendra', serif", flagColors: ['#CE1126', '#FFFFFF', '#000000'], emojis: ['🇪🇬', '🐪', '📜', '🏺', '🏜️', '🔺', '🐱', '⛵', '🪶'], cityImage: 'https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-16781222431522-834f8a855173?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/1058272/pexels-photo-1058272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Pyramid Statue', emoji: '🔺', cost: 85 }, { name: 'Papyrus Scroll', emoji: '📜', cost: 60 }], recipe: { name: 'Falafel Recipe', emoji: '🧆', cost: 550 } },
        { city: 'Jeddah', airline: 'Saudia', cost: 1250, airport: 'JED', time: 14.5, lang: 'ar-SA', welcomeMessage: 'أهلاً بك في جدة!', nativePhrase: "Masha'Allah.", fact: 'Did you know? Jeddah is known as the "Gateway to the Two Holy Mosques" for its proximity to Mecca and Medina.', fact2: 'Local Tip: Stroll along the Corniche at sunset to see the spectacular King Fahd\'s Fountain, one of the tallest in the world.', visa: '🇸🇦', fontFamily: "'Amiri', serif", flagColors: ['#006C35', '#FFFFFF'], emojis: ['🇸🇦', '🌴', '🌊', '🕌', '☕', '🏜️', ' DATES ', '🕋'], cityImage: 'https://images.unsplash.com/photo-1614559892277-2c5055b550a2?auto=format&fit=crop&w=1932&q=80', airportImage: 'https://images.unsplash.com/photo-1674043224326-8a50cf4afd39?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1633215091873-a64016a505b8?auto=format&fit=crop&w=1964&q=80', souvenirs: [{ name: 'Prayer Beads', emoji: '📿', cost: 40 }, { name: 'Dates', emoji: '🌴', cost: 30 }], recipe: { name: 'Kabsa Recipe', emoji: '🍛', cost: 650 } },
        { city: 'Karachi', airline: 'PIA', cost: 1150, airport: 'KHI', time: 16.0, lang: 'ur-PK', welcomeMessage: 'کراچی میں خوش آمدید!', nativePhrase: 'Jee, bilkul.', fact: 'Did you know? Karachi is Pakistan\'s largest city and is known as the "City of Lights" for its vibrant nightlife.', fact2: 'Local Tip: Don\'t miss a chance to try a Bun Kebab, a classic Karachi street food, from a vendor at Burns Road Food Street.', visa: '🇵🇰', fontFamily: "'Noto Nastaliq Urdu', serif", flagColors: ['#006600', '#FFFFFF'], emojis: ['🇵🇰', '🕌', '🌊', '🐐', '🏏', '🛺', '☕', '⭐', '🌙'], cityImage: 'https://i.ibb.co/p6JnBPJd/4-W8o-Sd-QXQENtrmdc-Lu-Gu-w0q-Fh-Rc4-FBa-EG31-MKk-Eit0.webp', airportImage: 'https://i.ibb.co/tMWn5R3R/karachiairport.jpg', restaurantImage: 'https://i.ibb.co/8L0cS2YZ/karachirestaurant.jpg', souvenirs: [{ name: 'Ajrak Shawl', emoji: '🧣', cost: 75 }, { name: 'Truck Art Model', emoji: '🚚', cost: 95 }], recipe: { name: 'Biryani Recipe', emoji: '🍛', cost: 620 } }
    ];

    const recipeNarration: Record<string, string> = {
        'Paris': "Ah, zee croissant! So flaky, so buttery, it is like a little piece of heaven, non?",
        'Kyoto': "Behold, sushi! Such harmony, such precision. A taste of wabi-sabi.",
        'Sydney': "Right, a meat pie! Chuck this little beauty in your gob, mate. Fair dinkum!",
        'Barcelona': "¡Paella! The taste of the sun, the sea, the fiesta! ¡Olé!",
        'London': "Right then, fish and chips! A proper classic, innit? Smashing!",
        'New York': "Hey, I'm cookin' here! A New York slice. Fuggedaboutit.",
        'Istanbul': "Kebab, my friend! The king of street food. Come, eat!",
        'Bangkok': "Thai curry! So spicy, so fragrant... Aroi mak mak!",
        'Cape Town': "Biltong! It's not just dried meat, bru. It's a way of life. Lekker!",
        'Budapest': "Goulash, the heart of Hungary! A warm hug in a bowl.",
        'Cairo': "Falafel! The food of the pharaohs... maybe. Yalla!",
        'Jeddah': "Kabsa. The scent of hospitality... a treasure of the desert.",
        'Karachi': "Biryani! This is not just food, it is an emotion! Wah, bhai, wah!"
    };

    const availableFoods: { name: string; emoji: string; reward: number; }[] = [
        { name: 'Fries', emoji: '🍟', reward: 200 }
    ];

    // --- Multiplayer & Networking ---
    function getCurrentZone(): string {
        return currentLocation === 'Toronto' ? 'arrival' : currentLocation;
    }

    function normaliseCity(city?: string, zone?: string): string {
        if (typeof city === 'string' && city.trim()) {
            return city.trim().slice(0, 64);
        }
        if (zone === 'arrival') {
            return 'Toronto';
        }
        if (typeof zone === 'string' && zone.trim()) {
            return zone.trim().slice(0, 64);
        }
        return 'Toronto';
    }

    function hashString(value: string): number {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
        }
        return hash;
    }

    function colorForPlayer(id: string): string {
        if (id === selfId) return 'yellow';
        const hue = Math.abs(hashString(id)) % 360;
        return `hsl(${hue}, 80%, 70%)`;
    }

    async function sendPostRequest(endpoint: string, body: object) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(`Failed to POST to ${endpoint}:`, error);
        }
    }
    
    async function pollAndUpdateState() {
        // Send our own state first
        await sendPostRequest('/update', {
            id: selfId,
            name: playerName,
            emoji: personEmoji.textContent,
            x,
            y,
            zone: getCurrentZone(),
            city: currentLocation,
            direction: isFacingRight ? 'right' : 'left',
        });

        // Then, get the global state
        try {
            const response = await fetch('/chatlog.txt');
            if (!response.ok) {
                throw new Error(`Failed to fetch state: ${response.statusText}`);
            }
            const data = await response.json();

            // Process players
            const receivedPlayerIds = new Set();
            if (Array.isArray(data.players)) {
                data.players.forEach((p: any) => {
                    if (!p || typeof p.id !== 'string' || p.id === selfId) return;
                    receivedPlayerIds.add(p.id);
                    updateOtherPlayerFromState(p);
                });
            }

            // Remove players who are no longer in the state
            for (const id of otherPlayers.keys()) {
                if (!receivedPlayerIds.has(id)) {
                    removeOtherPlayer(id);
                }
            }

            // Process chat
            if (Array.isArray(data.chat)) {
                const newMessages = data.chat.filter((c: any) => typeof c.timestamp === 'number' && c.timestamp > lastChatTimestamp);
                newMessages.forEach((entry: any) => {
                    lastChatTimestamp = Math.max(lastChatTimestamp, entry.timestamp);
                    const senderId = typeof entry.playerId === 'string' ? entry.playerId : 'unknown';
                    if (senderId === selfId) return;
                    if (entry.city && entry.city !== currentLocation) return;
                    if (typeof entry.message !== 'string' || !entry.message.trim()) return;
                    const senderName = typeof entry.name === 'string' && entry.name.trim() ? entry.name : 'Traveler';
                    addChatMessage(senderName, entry.message, colorForPlayer(senderId));
                    showChatBubble(senderId, entry.message);
                });
            }

        } catch (error) {
            console.error('Failed to poll server state:', error);
        }
    }

    function createOtherPlayerElement(state: { id: string; name?: string; emoji?: string; zone?: string; city?: string; x?: number; y?: number; direction?: string; }): OtherPlayer {
        const container = document.createElement('div');
        container.className = 'other-player';
        container.innerHTML = `
            <div class="other-player-emoji">${state.emoji ?? '🧍'}</div>
            <div class="other-player-label">${state.name ?? 'Traveler'}</div>
            <div class="chat-bubble hidden"></div>
        `;

        const emojiEl = container.querySelector('.other-player-emoji') as HTMLElement;
        const labelEl = container.querySelector('.other-player-label') as HTMLElement;
        const bubbleEl = container.querySelector('.chat-bubble') as HTMLElement;

        const color = colorForPlayer(state.id);
        labelEl.style.color = color;

        const zone = typeof state.zone === 'string' ? state.zone : 'arrival';
        const city = normaliseCity(state.city, zone);

        const player: OtherPlayer = {
            id: state.id,
            name: state.name ?? 'Traveler',
            emoji: state.emoji ?? '🧍',
            x: state.x ?? x,
            y: state.y ?? y,
            targetX: state.x ?? x,
            targetY: state.y ?? y,
            zone,
            city,
            isFacingRight: state.direction === 'right',
            element: container,
            emojiElement: emojiEl,
            labelElement: labelEl,
            bubbleElement: bubbleEl,
            color,
        };

        if (player.isFacingRight) {
            emojiEl.style.transform = 'scaleX(-1)';
        }

        otherPlayersContainer.appendChild(container);
        otherPlayers.set(player.id, player);
        updateOtherPlayerVisibility(player);
        return player;
    }

    function updateOtherPlayerVisibility(player: OtherPlayer) {
        const shouldShow = player.zone === getCurrentZone() && player.city === currentLocation;
        player.element.classList.toggle('hidden', !shouldShow);
        if (!shouldShow) {
            player.bubbleElement.classList.remove('visible');
            player.bubbleElement.classList.add('hidden');
        }
    }

    function removeOtherPlayer(id: string) {
        const existing = otherPlayers.get(id);
        if (!existing) return;
        existing.element.remove();
        otherPlayers.delete(id);
    }

    function showChatBubble(playerId: string, message: string) {
        const player = otherPlayers.get(playerId);
        if (!player || player.zone !== getCurrentZone() || player.city !== currentLocation) return;

        player.bubbleElement.textContent = message;
        player.bubbleElement.classList.remove('hidden');
        player.bubbleElement.classList.add('visible');

        setTimeout(() => {
            player.bubbleElement.classList.remove('visible');
        }, 4000);

        setTimeout(() => {
            player.bubbleElement.classList.add('hidden');
        }, 4500);
    }

    function showSelfChatBubble(message: string) {
        if (!selfChatBubble) return;

        selfChatBubble.textContent = message;
        selfChatBubble.classList.remove('hidden');
        selfChatBubble.classList.add('visible');

        setTimeout(() => {
            selfChatBubble.classList.remove('visible');
        }, 4000);

        setTimeout(() => {
            selfChatBubble.classList.add('hidden');
        }, 4500);
    }

    function hideSelfChatBubble() {
        if (!selfChatBubble) return;
        selfChatBubble.classList.remove('visible');
        selfChatBubble.classList.add('hidden');
    }

    function updateOtherPlayerFromState(state: { id: string; name?: string; emoji?: string; x?: number; y?: number; zone?: string; city?: string; direction?: string; }) {
        if (!state.id || state.id === selfId) return;

        let existing = otherPlayers.get(state.id);
        if (!existing) {
            existing = createOtherPlayerElement(state);
        }

        if(state.name && state.name !== existing.name) {
            existing.name = state.name;
            existing.labelElement.textContent = existing.name;
        }

        if (state.emoji && state.emoji !== existing.emoji) {
            existing.emoji = state.emoji;
            existing.emojiElement.textContent = existing.emoji;
        }

        if (typeof state.x === 'number') existing.targetX = state.x;
        if (typeof state.y === 'number') existing.targetY = state.y;
        
        if (typeof state.zone === 'string' && state.zone !== existing.zone) {
            existing.zone = state.zone;
        }

        existing.city = normaliseCity(state.city, existing.zone);
        updateOtherPlayerVisibility(existing);

        if (state.direction === 'right' && !existing.isFacingRight) {
            existing.isFacingRight = true;
            existing.emojiElement.style.transform = 'scaleX(-1)';
        } else if (state.direction === 'left' && existing.isFacingRight) {
            existing.isFacingRight = false;
            existing.emojiElement.style.transform = 'scaleX(1)';
        }
    }


    // --- Utility Functions ---
    function speak(text: string, lang = 'en-US'): Promise<void> {
        return new Promise((resolve) => {
            if (isSfxMuted || typeof SpeechSynthesisUtterance === "undefined" || typeof speechSynthesis === "undefined") { resolve(); return; }
            const doSpeak = () => {
                if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = 1.3; // Speak faster
                const voices = speechSynthesis.getVoices();
                const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
                if (voice) utterance.voice = voice;
                utterance.onend = () => resolve();
                utterance.onerror = (e: SpeechSynthesisErrorEvent) => { console.error(`SpeechSynthesis Error: ${e.error}`, e); resolve(); };
                setTimeout(() => { speechSynthesis.speak(utterance); }, 50);
            };
            if (speechSynthesis.getVoices().length > 0) doSpeak(); else speechSynthesis.onvoiceschanged = doSpeak;
        });
    }
    
    async function handleInsufficientFunds() {
        playSound('error');
        await speak("Out of money! Go put some fries in the bag.");
    }

    function typeMessage(text: string, element: HTMLElement, typeDelay: number, displayDuration: number): Promise<void> {
        return new Promise(resolve => {
            element.innerHTML = '';
            let i = 0;
            const intervalId = window.setInterval(() => {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                } else {
                    clearInterval(intervalId);
                    setTimeout(() => { resolve(); }, displayDuration);
                }
            }, typeDelay);
        });
    }

    function showEarningToast(amount: number) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = `+$${amount} 💰`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2900); // A bit less than animation duration
    }
    
    function updateMinigameUnlockStatus() {
        const memoryUnlockCount = 2;
        const gemSwapUnlockCount = 5;

        // Memory Match
        if (visitedCities.size >= memoryUnlockCount) {
            memoryMatchBtn.disabled = false;
            memoryMatchBtn.textContent = 'Memory Match';
            if (!haveMinigamesBeenUnlocked) {
                playSound('ding-dong');
                haveMinigamesBeenUnlocked = true;
            }
        } else {
            memoryMatchBtn.disabled = true;
            memoryMatchBtn.textContent = memoryMatchBtn.dataset.unlockText || 'Locked';
        }
        
        // Gem Swap
        if (visitedCities.size >= gemSwapUnlockCount) {
            gemSwapBtn.disabled = false;
            gemSwapBtn.textContent = 'Gem Swap';
        } else {
            gemSwapBtn.disabled = true;
            gemSwapBtn.textContent = gemSwapBtn.dataset.unlockText || 'Locked';
        }
    }

    function updateButtonStates() {
        applyPassportBtn.disabled = score < 200;
        
        flightData.forEach(flight => {
            const btn = document.getElementById(`flight-btn-${flight.city}`) as HTMLButtonElement | null;
            if (btn) {
                if (score >= flight.cost) {
                    btn.classList.add('affordable');
                    btn.classList.remove('unaffordable');
                } else {
                    btn.classList.add('unaffordable');
                    btn.classList.remove('affordable');
                }
            }
        });

        if (!giftShopDialog.classList.contains('hidden')) {
            const flight = flightData.find(f => f.city === currentLocation);
            if (flight) {
                // Souvenirs
                if (flight.souvenirs) {
                    flight.souvenirs.forEach(item => {
                        const btn = document.getElementById(`souvenir-btn-${item.name.replace(/\s+/g, '-')}`) as HTMLButtonElement | null;
                        if (btn) {
                            const hasItem = collectedSouvenirs.has(item.name);
                            btn.disabled = hasItem || score < item.cost;
                            if (hasItem && !btn.querySelector('.visited-checkmark')) btn.innerHTML += ' <span class="visited-checkmark">✅</span>';
                        }
                    });
                }
                // Recipe
                const recipeBtn = document.getElementById(`recipe-btn-${flight.recipe.name.replace(/\s+/g, '-')}`) as HTMLButtonElement | null;
                if (recipeBtn) {
                    const hasRecipe = unlockedRecipes.has(flight.city);
                    recipeBtn.disabled = hasRecipe || score < flight.recipe.cost;
                    if (hasRecipe && !recipeBtn.querySelector('.visited-checkmark')) recipeBtn.innerHTML += ' <span class="visited-checkmark">✅</span>';
                }
            }
        }
        
        // Staff buttons
        hireWorkerBtn.disabled = score < 1000 || hasWorker;
        const promotionCost = 1000 * (workerLevel + 1);
        promoteWorkerBtn.disabled = score < promotionCost || !hasWorker;
        
        updateMinigameUnlockStatus();
    }

    function updateScore(amount: number) {
        score += amount;
        scoreEl.textContent = `$${score}`;
        updateButtonStates();
    }

    // --- Movement & Game Loop ---
    function moveTo(targetElement: HTMLElement) {
        return new Promise<void>(resolve => {
            const rect = targetElement.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
            currentMovePromise = resolve;
        });
    }

    function gameLoop() {
        // Main player movement
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            x += dx * 0.08;
            y += dy * 0.08;
            
            if (dx > 1 && !isFacingRight) {
                isFacingRight = true;
                personEmoji.style.transform = 'scaleX(-1)';
            } else if (dx < -1 && isFacingRight) {
                isFacingRight = false;
                personEmoji.style.transform = 'scaleX(1)';
            }
        } else if (currentMovePromise) {
            currentMovePromise();
            currentMovePromise = null;
        }
        
        personContainer.style.left = `${x}px`;
        personContainer.style.top = `${y}px`;

        // Other players movement (server-driven)
        otherPlayers.forEach(player => {
            const pdx = player.targetX - player.x;
            const pdy = player.targetY - player.y;
            const pDist = Math.sqrt(pdx*pdx + pdy*pdy);
            
            if (pDist > 1) {
                player.x += pdx * 0.08;
                player.y += pdy * 0.08;
            } else {
                player.x = player.targetX;
                player.y = player.targetY;
            }

            player.element.style.left = `${player.x}px`;
            player.element.style.top = `${player.y}px`;
        });


        if (isLuggageFollowing) {
            luggageContainer.style.left = `${x - 25}px`;
            luggageContainer.style.top = `${y + 10}px`;
            luggageContainer.style.zIndex = '4';
        }

        requestAnimationFrame(gameLoop);
    }

    // --- Chat Logic ---
    function addChatMessage(sender: string, message: string, color = 'white') {
        const p = document.createElement('p');
        p.innerHTML = `<strong style="color: ${color};">${sender}:</strong> ${message}`;
        chatHistory.appendChild(p);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    async function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addChatMessage(playerName, message, colorForPlayer(selfId));
            showSelfChatBubble(message);
            lastChatTimestamp = Date.now();
            await sendPostRequest('/chat', {
                id: selfId,
                name: playerName,
                message: message,
                city: currentLocation,
                zone: getCurrentZone(),
                timestamp: lastChatTimestamp,
            });
            chatInput.value = '';
        }
    }


    // --- UI Logic ---
    function showCityView(flight: (typeof flightData)[0]) {
        passportOfficeContainer.classList.add('hidden');
        airportContainer.classList.add('hidden');
        mfGroupContainer.classList.add('hidden');
        document.getElementById('home-bottom-left-controls')?.classList.add('hidden');
        
        cityImageContainer.classList.remove('hidden');
        restaurantContainer.classList.remove('hidden');
        giftShopContainer.classList.remove('hidden');
        awayAirportPlaceholder.classList.remove('hidden');
        cityTitle.classList.remove('hidden');
        cityEmojis.style.display = 'flex';
        
        currentLocation = flight.city;
        cityImage.src = flight.cityImage;
        awayAirportPlaceholder.innerHTML = `✈️ Return to Toronto`;
        awayAirportPlaceholder.style.backgroundImage = `url(${flight.airportImage})`;
        
        cityTitle.textContent = flight.city;
        cityTitle.style.fontFamily = flight.fontFamily;
        const gradient = `linear-gradient(45deg, ${flight.flagColors.join(', ')})`;
        cityTitle.style.setProperty('--flag-gradient', gradient);

        cityEmojis.innerHTML = flight.emojis.map(e => `<span>${e}</span>`).join('');
        otherPlayers.forEach(updateOtherPlayerVisibility);
        hideSelfChatBubble();
    }

    function showHomeView() {
        cityImageContainer.classList.add('hidden');
        restaurantContainer.classList.add('hidden');
        giftShopContainer.classList.add('hidden');
        awayAirportPlaceholder.classList.add('hidden');
        cityTitle.classList.add('hidden');
        cityEmojis.style.display = 'none';

        passportOfficeContainer.classList.remove('hidden');
        airportContainer.classList.remove('hidden');
        mfGroupContainer.classList.remove('hidden');
        document.getElementById('home-bottom-left-controls')?.classList.remove('hidden');
        
        // Reset luggage position to its CSS default
        luggageContainer.style.left = '';
        luggageContainer.style.top = '';
        luggageContainer.style.zIndex = '2';

        currentLocation = 'Toronto';
        captionContainer.innerHTML = '';
        otherPlayers.forEach(updateOtherPlayerVisibility);
        hideSelfChatBubble();
    }

    function playPassportCelebration() {
        passportCelebration.classList.add('active');
        const containerRect = passportCelebration.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * (containerRect.width / 2);
            sparkle.style.left = `${containerRect.width / 2 + Math.cos(angle) * radius}px`;
            sparkle.style.top = `${containerRect.height / 2 + Math.sin(angle) * radius}px`;
            const travelDist = 100 + Math.random() * 100;
            sparkle.style.setProperty('--tx', `${Math.cos(angle) * travelDist}px`);
            sparkle.style.setProperty('--ty', `${Math.sin(angle) * travelDist}px`);
            passportCelebration.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
        
        playSound('passport-get');
        setTimeout(() => passportCelebration.classList.remove('active'), 2500);
    }
    
    function playGenericCelebration(containerId: string, message: string) {
        const celebrationContainer = document.getElementById(containerId) as HTMLElement;
        if (!celebrationContainer) return;

        celebrationContainer.innerHTML = `<div class="celebration-text">${message}</div>`;
        celebrationContainer.classList.remove('hidden');

        for (let i = 0; i < 50; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 50;
            firework.style.left = `calc(50% + ${Math.cos(angle) * radius}px)`;
            firework.style.top = `calc(50% + ${Math.sin(angle) * radius}px)`;
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;

            const travelDist = 150 + Math.random() * 200;
            firework.style.setProperty('--tx', `${Math.cos(angle) * travelDist}px`);
            firework.style.setProperty('--ty', `${Math.sin(angle) * travelDist}px`);
            firework.style.animationDelay = `${Math.random() * 0.5}s`;
            
            celebrationContainer.appendChild(firework);
        }
        
        playSound('success');

        return new Promise<void>(resolve => {
             setTimeout(() => {
                celebrationContainer.classList.add('hidden');
                celebrationContainer.innerHTML = '';
                resolve();
            }, 4000);
        });
    }

    async function playNarrationSequence(flight: (typeof flightData)[0]) {
        try {
            await speak(`Welcome aboard flight ${flight.airline} to ${flight.city}. The flight time will be ${flight.time} hours.`, 'en-US');
            if (currentLocation !== flight.city) return;
            await new Promise(res => setTimeout(res, 200));
            playCitySound(flight.city as keyof typeof citySoundData);

            await typeMessage(flight.welcomeMessage, captionContainer, 50, 4000); if (currentLocation !== flight.city) return;
            await speak(flight.welcomeMessage, flight.lang); if (currentLocation !== flight.city) return;
            await typeMessage(flight.nativePhrase, captionContainer, 50, 3000); if (currentLocation !== flight.city) return;
            await speak(flight.nativePhrase, flight.lang); if (currentLocation !== flight.city) return;
            await typeMessage(flight.fact, captionContainer, 50, 7000); if (currentLocation !== flight.city) return;
            await speak(flight.fact, flight.lang); if (currentLocation !== flight.city) return;
            await typeMessage(flight.fact2, captionContainer, 50, 7000); if (currentLocation !== flight.city) return;
            await speak(flight.fact2, flight.lang);
        } catch (error) { console.error("Error during travel sequence:", error); } 
        finally { if (currentLocation === flight.city) captionContainer.innerHTML = ''; }
    }

    function createSkippableAnimation(duration: number, dialog: HTMLElement): Promise<void> {
        return new Promise<void>(resolve => {
            animationPromiseResolver = resolve;
            const timeoutId = setTimeout(() => resolve(), duration);

            const skip = () => {
                clearTimeout(timeoutId);
                resolve();
            };
            dialog.addEventListener('click', skip, { once: true });
        }).finally(() => {
            animationPromiseResolver = null;
            dialog.removeEventListener('click', () => {}); // Clean up listener
        });
    }

    async function travelTo(flight: (typeof flightData)[0]) {
        isInteracting = true;
        updateScore(-flight.cost);
        flightsDialog.classList.add('hidden');
        
        document.body.classList.add('away');
        document.body.style.backgroundColor = '#000';
        
        await moveTo(luggageContainer);
        isLuggageFollowing = true;
        await moveTo(airportImg);
        isLuggageFollowing = false;

        const planeEmoji = planeAnimationDialog.querySelector('#plane-emoji-anim') as HTMLElement;
        planeAnimationDialog.classList.remove('hidden');
        playSound('takeoff');
        
        const animationPromise = createSkippableAnimation(3000, planeAnimationDialog);
        
        planeEmoji.textContent = '🛫';
        setTimeout(() => { if(animationPromiseResolver) planeEmoji.textContent = '✈️'; }, 500);
        setTimeout(() => { if(animationPromiseResolver) planeEmoji.textContent = '🛬'; }, 2500);
        
        await animationPromise;
        
        planeAnimationDialog.classList.add('hidden');
        planeEmoji.textContent = '✈️'; // Reset for next time
        
        visaStickerEmoji.textContent = flight.visa;
        visaAnimationDialog.classList.remove('hidden');
        playSound('stamp');
        await createSkippableAnimation(2000, visaAnimationDialog);
        visaAnimationDialog.classList.add('hidden');

        showCityView(flight);

        if (!visitedCities.has(flight.city)) {
            visitedCities.add(flight.city);
            const li = document.createElement('li');
            li.textContent = flight.city;
            visitedList.appendChild(li);
        }

        if (visitedCities.size > 0) visitedCitiesList.classList.remove('hidden');
        updateMinigameUnlockStatus();
        
        isInteracting = false;
        playNarrationSequence(flight);
    }
    
    async function playHomeNarration() {
        try {
            await speak(`Welcome back to Toronto.`);
            if (currentLocation !== 'Toronto') return;
            await new Promise(res => setTimeout(res, 200));
            playCitySound('Toronto');
            await typeMessage('Welcome home!', captionContainer, 50, 4000);
        } catch (error) { console.error("Error during return home sequence:", error); }
        finally { if (currentLocation === 'Toronto') captionContainer.innerHTML = ''; }
    }

    async function returnHome() {
        isInteracting = true;
        
        document.body.classList.remove('away');
        document.body.style.backgroundColor = '#111';

        await moveTo(awayAirportPlaceholder);
        
        const planeEmoji = planeAnimationDialog.querySelector('#plane-emoji-anim') as HTMLElement;
        planeAnimationDialog.classList.remove('hidden');
        playSound('takeoff');
        
        const animationPromise = createSkippableAnimation(3000, planeAnimationDialog);
        
        planeEmoji.textContent = '🛫';
        setTimeout(() => { if(animationPromiseResolver) planeEmoji.textContent = '✈️'; }, 500);
        setTimeout(() => { if(animationPromiseResolver) planeEmoji.textContent = '🛬'; }, 2500);
        
        await animationPromise;

        planeAnimationDialog.classList.add('hidden');
        planeEmoji.textContent = '✈️'; // Reset
        
        showHomeView();
        isInteracting = false;
        playHomeNarration();
    }

    // --- Minigame, Restaurant & Worker Logic ---
    function updateAvailableFoods() {
        availableFoods.length = 1; // Reset but keep fries
        unlockedRecipes.forEach(recipe => {
             availableFoods.push({
                name: recipe.name.replace(' Recipe', ''),
                emoji: recipe.emoji,
                reward: 200 + Math.round(recipe.cost / 10)
            });
        });
    }

    function createFoodItem() {
        if (availableFoods.length === 0) return;
        const foodData = availableFoods[Math.floor(Math.random() * availableFoods.length)];
        
        const food = document.createElement('div');
        food.className = 'fry';
        food.dataset.reward = foodData.reward.toString();
        food.draggable = true;
        
        const emoji = document.createElement('span');
        emoji.textContent = foodData.emoji;
        
        const label = document.createElement('span');
        label.className = 'food-label';
        label.textContent = foodData.name;
        
        food.appendChild(emoji);
        food.appendChild(label);

        food.addEventListener('dragstart', (e) => {
            draggedItem = food;
            e.dataTransfer!.setData('text/plain', food.dataset.reward!);
            setTimeout(() => {
                food.classList.add('is-dragging');
            }, 0);
        });

        food.addEventListener('dragend', () => {
            food.classList.remove('is-dragging');
            draggedItem = null;
        });

        friesContainer.appendChild(food);
    }
    
    function setupMinigame() {
        if (!hasPlayedMinigame) {
            speak("put the fries in the bag");
            hasPlayedMinigame = true;
        }
        minigameTitle.textContent = `Cooking Job`;
        bagDropzone.textContent = '🛍️';
        friesContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) createFoodItem();
    }

    function animateWorker() {
        if (availableFoods.length === 0) return;
        const foodData = availableFoods[Math.floor(Math.random() * availableFoods.length)];
        
        const food = document.createElement('span');
        food.textContent = foodData.emoji;
        food.className = 'worker-anim-item';
        food.id = 'worker-anim-food';
        food.style.top = '50%';
        workerAnimationRow.appendChild(food);

        setTimeout(() => { food.remove(); }, 3900);
    }

    function startWorkerInterval() {
        if (workerIntervalId) clearInterval(workerIntervalId);
        if (!hasWorker) return;

        const interval = 10000 / workerLevel;
        workerIntervalId = window.setInterval(() => {
            if (availableFoods.length === 0) return;
            const foodData = availableFoods[Math.floor(Math.random() * availableFoods.length)];
            updateScore(foodData.reward);
            showEarningToast(foodData.reward);
            animateWorker();
        }, interval);
        workerAnimationContainer.classList.remove('hidden');
    }
    
    // --- New Minigames Logic ---
    let firstCard: HTMLElement | null = null, secondCard: HTMLElement | null = null;
    let lockBoard = false;
    let memoryGameTotalPairs = 0;

    function playSparkleEffect(targetElement: HTMLElement) {
        const rect = targetElement.getBoundingClientRect();
        const sparkleContainer = document.body;
        for (let i = 0; i < 10; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-effect';
            sparkle.style.left = `${rect.left + rect.width / 2}px`;
            sparkle.style.top = `${rect.top + rect.height / 2}px`;
            const angle = Math.random() * 2 * Math.PI;
            const travelDist = 20 + Math.random() * 30;
            sparkle.style.setProperty('--tx', `${Math.cos(angle) * travelDist}px`);
            sparkle.style.setProperty('--ty', `${Math.sin(angle) * travelDist}px`);
            sparkle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
            sparkle.style.animationDelay = `${Math.random() * 0.2}s`;
            sparkleContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    }

    function setupMemoryGame() {
        memoryGameGrid.innerHTML = '';
        firstCard = secondCard = null;
        lockBoard = false;
        
        const itemMap = new Map<string, string>();
        collectedSouvenirs.forEach(s => itemMap.set(s.emoji, s.name));
        unlockedRecipes.forEach(r => itemMap.set(r.emoji, r.name.replace(' Recipe', '')));
        
        let items = Array.from(itemMap.keys());
        if (items.length < 8) {
            const defaults = new Map([['🍟', 'Fries'], ['⭐', 'Star'], ['💎', 'Gem'], ['🎁', 'Gift'], ['🎈', 'Balloon'], ['🎉', 'Party'], ['❤️', 'Heart'], ['💯', 'Score']]);
            defaults.forEach((name, emoji) => {
                if(items.length < 8) {
                    items.push(emoji);
                    itemMap.set(emoji, name);
                }
            });
        }

        items = items.slice(0, 8); 
        memoryGameTotalPairs = items.length;
        const gameItems = [...items, ...items].sort(() => 0.5 - Math.random());
        
        gameItems.forEach(itemEmoji => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.item = itemEmoji;
            card.innerHTML = `
                <div class="memory-card-face card-front"></div>
                <div class="memory-card-face card-back">
                    <div class="card-emoji">${itemEmoji}</div>
                    <span class="card-label">${itemMap.get(itemEmoji)}</span>
                </div>
            `;
            card.addEventListener('click', flipCard);
            memoryGameGrid.appendChild(card);
        });
    }
    
    function flipCard(this: HTMLElement) {
        if (lockBoard || this === firstCard || this.classList.contains('is-matched')) return;
        playSound('card-flip');
        this.classList.add('is-flipped');
        
        if (!firstCard) {
            firstCard = this;
            return;
        }
        
        secondCard = this;
        lockBoard = true;
        checkForMatch();
    }
    
    async function handleMemoryGameWin() {
        updateScore(1000);
        await playGenericCelebration('memory-game-win-celebration', 'You Win! +$1000');
        memoryGameDialog.classList.add('hidden');
    }
    
    function checkForMatch() {
        const isMatch = firstCard!.dataset.item === secondCard!.dataset.item;
        isMatch ? disableCards() : unflipCards();
    }
    
    function disableCards() {
        firstCard!.classList.add('is-matched');
        secondCard!.classList.add('is-matched');
        playSparkleEffect(firstCard!);
        playSparkleEffect(secondCard!);
        firstCard!.removeEventListener('click', flipCard);
        secondCard!.removeEventListener('click', flipCard);
        updateScore(50);
        playSound('earn');
        
        const matchedPairs = document.querySelectorAll('.memory-card.is-matched').length / 2;
        if (matchedPairs === memoryGameTotalPairs) {
            handleMemoryGameWin();
        }

        resetBoard();
    }
    
    function unflipCards() {
        setTimeout(() => {
            firstCard!.classList.remove('is-flipped');
            secondCard!.classList.remove('is-flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }
    
    const GRID_SIZE = 8;
    let gemGrid: (string | null)[][] = [];
    let selectedGem: { row: number, col: number } | null = null;
    let isSwapping = false;
    let gemSwapGems: string[] = [];
    
    function setupGemSwapGame() {
        gemSwapGrid.innerHTML = '';
        gemGrid = [];
        gemSwapGems = [];

        collectedSouvenirs.forEach(s => gemSwapGems.push(s.emoji));
        unlockedRecipes.forEach(r => gemSwapGems.push(r.emoji));
        visitedCities.forEach(city => {
            const flight = flightData.find(f => f.city === city);
            if (flight && flight.emojis) {
                gemSwapGems.push(...flight.emojis.slice(1, 4)); // Add some cultural emojis
            }
        });
        
        gemSwapGems = [...new Set(gemSwapGems)];
        if (gemSwapGems.length < 6) {
            const defaultGems = ['💎', '💍', '👑', '💰', '🪙', '🔮'];
            gemSwapGems.push(...defaultGems.slice(0, 6 - gemSwapGems.length));
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            gemGrid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                 do {
                    gemGrid[r][c] = gemSwapGems[Math.floor(Math.random() * gemSwapGems.length)];
                } while (
                    (c >= 2 && gemGrid[r][c] === gemGrid[r][c-1] && gemGrid[r][c] === gemGrid[r][c-2]) ||
                    (r >= 2 && gemGrid[r][c] === gemGrid[r-1][c] && gemGrid[r][c] === gemGrid[r-2][c])
                );
            }
        }
        renderGemGrid();
    }

    function renderGemGrid() {
        gemSwapGrid.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const gem = document.createElement('div');
                gem.className = 'gem';
                gem.textContent = gemGrid[r][c];
                gem.dataset.row = r.toString();
                gem.dataset.col = c.toString();
                gem.addEventListener('click', handleGemClick);
                gemSwapGrid.appendChild(gem);
            }
        }
    }
    
    async function handleGemClick(e: MouseEvent) {
        if (isSwapping) return;
        const target = e.currentTarget as HTMLElement;
        const row = parseInt(target.dataset.row!);
        const col = parseInt(target.dataset.col!);
        
        if (!selectedGem) {
            selectedGem = { row, col };
            target.classList.add('selected');
        } else {
            const prevSelected = document.querySelector('.gem.selected');
            prevSelected?.classList.remove('selected');
            
            const isAdjacent = Math.abs(selectedGem.row - row) + Math.abs(selectedGem.col - col) === 1;
            if (isAdjacent) {
                isSwapping = true;
                await swapGems(selectedGem.row, selectedGem.col, row, col);
                const matches = findMatches();
                if (matches.length > 0) {
                    await handleMatches(matches);
                } else {
                    await swapGems(selectedGem.row, selectedGem.col, row, col);
                }
                isSwapping = false;
            }
            selectedGem = null;
        }
    }

    async function swapGems(r1: number, c1: number, r2: number, c2: number) {
        [gemGrid[r1][c1], gemGrid[r2][c2]] = [gemGrid[r2][c2], gemGrid[r1][c1]];
        renderGemGrid();
        await new Promise(res => setTimeout(res, 200));
    }
    
    function findMatches(): { row: number, col: number }[] {
        const matches: { row: number, col: number }[] = [];
        const toMatch = (r: number, c: number) => { if (!matches.some(m => m.row === r && m.col === c)) matches.push({row:r, col:c}); };
        for (let r = 0; r < GRID_SIZE; r++) { for (let c = 0; c < GRID_SIZE - 2; c++) { if (gemGrid[r][c] && gemGrid[r][c] === gemGrid[r][c+1] && gemGrid[r][c] === gemGrid[r][c+2]) { toMatch(r,c); toMatch(r,c+1); toMatch(r,c+2); } } }
        for (let c = 0; c < GRID_SIZE; c++) { for (let r = 0; r < GRID_SIZE - 2; r++) { if (gemGrid[r][c] && gemGrid[r][c] === gemGrid[r+1][c] && gemGrid[r][c] === gemGrid[r+2][c]) { toMatch(r,c); toMatch(r+1,c); toMatch(r+2,c); } } }
        return matches;
    }
    
    async function handleMatches(matches: { row: number, col: number }[]) {
        matches.forEach(m => {
            const el = document.querySelector(`.gem[data-row='${m.row}'][data-col='${m.col}']`);
            if (el) {
                el.classList.add('matched');
                playSparkleEffect(el as HTMLElement);
            }
            updateScore(10);
        });
        playSound('earn');
        await new Promise(res => setTimeout(res, 300));
        matches.forEach(m => { gemGrid[m.row][m.col] = null; });
        for (let c = 0; c < GRID_SIZE; c++) {
            let emptyRow = GRID_SIZE - 1;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
                if (gemGrid[r][c] !== null) {
                    [gemGrid[r][c], gemGrid[emptyRow][c]] = [gemGrid[emptyRow][c], gemGrid[r][c]];
                    emptyRow--;
                }
            }
        }
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (gemGrid[r][c] === null) {
                    gemGrid[r][c] = gemSwapGems[Math.floor(Math.random() * gemSwapGems.length)];
                }
            }
        }
        renderGemGrid();
        await new Promise(res => setTimeout(res, 200));
        const newMatches = findMatches();
        if (newMatches.length > 0) {
            await handleMatches(newMatches);
        }
    }


    function closeAllDialogs() {
        document.querySelectorAll('.dialog-container').forEach(d => d.classList.add('hidden'));
    }

    // --- Event Listeners & Game Init ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDialogs();
        }
    });

    document.body.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        
        // Prevent player movement when interacting with UI
        if (target.closest('.dialog-container, .action-button, [id$="-container"], .button-42, .button-5, .button-85, .button-14, #chat-container')) {
             // Let other handlers below process the click
        } else {
            targetX = e.clientX;
            targetY = e.clientY;
        }

        const openDialog = document.querySelector('.dialog-container:not(.hidden)');
        if (openDialog && !target.closest('.dialog-container') && !target.closest('.action-button') && !target.closest('[id$="-container"]') && !target.closest('.button-42') && !target.closest('.button-5') && !target.closest('.button-85') && !target.closest('.button-14')) {
             openDialog.classList.add('hidden');
             return;
        }

        if (isInteracting) return;

        // DIALOG INTERACTIONS
        if (target.id === 'exit-gift-shop-btn') {
            playSound('click'); giftShopDialog.classList.add('hidden'); return;
        }
        if (target.matches('[data-dialog]')) {
             playSound('click');
             const dialogId = target.getAttribute('data-dialog');
             document.getElementById(dialogId!)?.classList.add('hidden');
             return;
        }
        if (passportDialog.contains(target) && target === applyPassportBtn) {
            if (score >= 200) {
                updateScore(-200);
                hasPassport = true;
                passportDialog.classList.add('hidden');
                speak("Congratulations! You now have a passport!");
                playPassportCelebration();
            } else {
                handleInsufficientFunds();
            }
            return;
        }
        if (flightsDialog.contains(target)) {
            const button = target.closest('.button-42');
            if (button) {
                const city = button.getAttribute('data-city');
                const flight = flightData.find(f => f.city === city);
                if (flight) {
                    if (score >= flight.cost) {
                        playSound('ding-dong');
                        travelTo(flight);
                    } else {
                        handleInsufficientFunds();
                    }
                }
            }
            return;
        }
        if (giftShopDialog.contains(target)) {
            const button = target.closest('.button-14') as HTMLButtonElement | null;
            if (button && !button.disabled) {
                const itemName = button.getAttribute('data-name')!;
                const itemType = button.getAttribute('data-type')!;
                const flight = flightData.find(f => f.city === currentLocation)!;
                let cost = 0;
                let item;

                if (itemType === 'souvenir') {
                    item = flight.souvenirs.find(s => s.name === itemName)!;
                    cost = item.cost;
                } else if (itemType === 'recipe') {
                    item = flight.recipe;
                    cost = item.cost;
                }
                
                if (score >= cost) {
                    if (itemType === 'souvenir') {
                        updateScore(-cost);
                        collectedSouvenirs.set(itemName, item as any);
                        const el = document.createElement('div');
                        el.className = 'souvenir-item';
                        el.textContent = `${item!.emoji} ${item!.name}`;
                        souvenirsList.appendChild(el);
                    } else if (itemType === 'recipe') {
                        updateScore(-cost);
                        unlockedRecipes.set(flight.city, item as any);
                        playGenericCelebration('recipe-celebration', `${item!.name} added to Fajr's Café!`);
                        updateAvailableFoods();
                        const narration = recipeNarration[flight.city];
                        if (narration) speak(narration, flight.lang);
                    }
                    playSound('success');
                    updateButtonStates();
                } else {
                    handleInsufficientFunds();
                }
            }
            return;
        }
        if (target === workShiftBtn) { setupMinigame(); minigameDialog.classList.remove('hidden'); return; }
        if (target === manageStaffBtn) { 
            const promotionCost = 1000 * (workerLevel + 1);
            if(hasWorker) {
                staffStatus.textContent = `Your Chef is Level ${workerLevel}, earning every ${ (10000 / workerLevel / 1000).toFixed(1)}s.`;
                promoteWorkerBtn.textContent = `Promote Chef ($${promotionCost})`;
                hireWorkerBtn.classList.add('hidden');
                promoteWorkerBtn.classList.remove('hidden');
            } else {
                staffStatus.textContent = "You have no employees.";
                hireWorkerBtn.classList.remove('hidden');
                promoteWorkerBtn.classList.add('hidden');
            }
            updateButtonStates();
            staffDialog.classList.remove('hidden'); 
            return; 
        }
        if (target === memoryMatchBtn && !memoryMatchBtn.disabled) { setupMemoryGame(); memoryGameDialog.classList.remove('hidden'); return; }
        if (target === gemSwapBtn && !gemSwapBtn.disabled) { setupGemSwapGame(); gemSwapDialog.classList.remove('hidden'); return; }

        if (staffDialog.contains(target)) {
             if(target === hireWorkerBtn) {
                if (score >= 1000) {
                    updateScore(-1000);
                    hasWorker = true;
                    workerLevel = 1;
                    startWorkerInterval();
                    staffDialog.classList.add('hidden');
                } else {
                    handleInsufficientFunds();
                }
             } else if (target === promoteWorkerBtn) {
                const cost = 1000 * (workerLevel + 1);
                if(score >= cost) {
                    updateScore(-cost);
                    workerLevel++;
                    startWorkerInterval();
                    staffDialog.classList.add('hidden');
                } else {
                    handleInsufficientFunds();
                }
             }
             return;
        }
        
        // WORLD INTERACTIONS
        const interactionTarget = target.closest('#passport-office-container, #airport-container, #mf-group-container, #restaurant-container:not(.hidden), #gift-shop-container:not(.hidden), #luggage-container, #settings-container, #away-airport-placeholder:not(.hidden)');
        if (interactionTarget) {
            playSound('click');
            isInteracting = true;
            closeAllDialogs();
            
            if (interactionTarget.id !== 'luggage-container') {
                await moveTo(interactionTarget as HTMLElement);
            }
            
            if (interactionTarget.id === 'passport-office-container') {
                 if (hasPassport) {
                    officerMessage.querySelector('#speech-bubble')!.textContent = "You already have a passport!";
                    officerMessage.classList.remove('hidden');
                } else {
                    updateButtonStates();
                    passportDialog.classList.remove('hidden');
                }
            } else if (interactionTarget.id === 'mf-group-container') {
                restaurantDialog.classList.remove('hidden');
            } else if (interactionTarget.id === 'luggage-container') {
                souvenirsContainer.classList.remove('hidden');
            } else if (interactionTarget.id === 'settings-container') {
                settingsDialog.classList.remove('hidden');
            } else if (interactionTarget.id === 'airport-container' || interactionTarget.id === 'away-airport-placeholder') {
                if (!hasPassport) {
                    officerMessage.querySelector('#speech-bubble')!.textContent = "You must have a passport to travel";
                    officerMessage.classList.remove('hidden');
                } else if (currentLocation === 'Toronto') {
                     flightsContainer.innerHTML = flightData.map(f => `
                        <button class="button-42" role="button" data-city="${f.city}" id="flight-btn-${f.city}">
                            <span class="flight-flag">${f.visa}</span>
                            <span class="flight-city-name">${f.city}</span>
                            <span class="flight-cost">$${f.cost}</span>
                            ${visitedCities.has(f.city) ? '<span class="visited-checkmark">✅</span>' : ''}
                        </button>
                    `).join('');
                    updateButtonStates();
                    flightsDialog.classList.remove('hidden');
                } else {
                    await returnHome();
                }
            } else if (interactionTarget.id === 'restaurant-container') {
                const flight = flightData.find(f => f.city === currentLocation);
                if (flight) {
                    restaurantImage.src = flight.restaurantImage;
                    restaurantViewContainer.classList.remove('hidden');
                }
            } else if (interactionTarget.id === 'gift-shop-container') {
                const flight = flightData.find(f => f.city === currentLocation);
                if (flight) {
                    let itemsHTML = '';
                    if (flight.souvenirs) {
                        itemsHTML += flight.souvenirs.map(item => `
                            <button class="gift-item button-14" role="button" data-name="${item.name}" data-type="souvenir" id="souvenir-btn-${item.name.replace(/\s+/g, '-')}">
                                ${item.emoji} ${item.name}<br>
                                $${item.cost}
                            </button>
                        `).join('');
                    }
                     itemsHTML += `<button class="gift-item button-14 recipe-item" role="button" data-name="${flight.recipe.name}" data-type="recipe" id="recipe-btn-${flight.recipe.name.replace(/\s+/g, '-')}">
                        📖 ${flight.recipe.name}<br>
                        $${flight.recipe.cost}
                    </button>`;
                    giftShopItemsContainer.innerHTML = itemsHTML;
                    updateButtonStates();
                    giftShopDialog.classList.remove('hidden');
                }
            }
            isInteracting = false;
        }
    });
    
    // Settings Listeners
    playerNameInput.addEventListener('input', () => {
        playerName = playerNameInput.value.trim() || 'Person';
        personLabel.textContent = playerName;
    });

    sfxMuteBtn.addEventListener('click', () => {
        isSfxMuted = !isSfxMuted;
        sfxMuteBtn.textContent = isSfxMuted ? '🔇' : '🔊';
    });

    musicMuteBtn.addEventListener('click', () => {
        isMusicMuted = !isMusicMuted;
        musicMuteBtn.textContent = isMusicMuted ? '🔇' : '🎵';
    });
    
    settingsOkBtn.addEventListener('click', () => settingsDialog.classList.add('hidden'));

    // Chat Listeners
    chatSendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Tooltip and Hover Sound Logic
    document.body.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        const flightButton = target.closest('.button-42');
        
        if (flightButton) {
            const city = flightButton.getAttribute('data-city');
            const flight = flightData.find(f => f.city === city);
            if (flight) {
                flightTooltip.innerHTML = `<strong>${flight.airline}</strong><br>Airport: ${flight.airport}<br>Time: ${flight.time}h`;
                flightTooltip.style.opacity = '1';
            }
        }

        const interactiveElement = target.closest('.action-button, .button-42, .button-5, .button-14, .button-85, #passport-office-container, #airport-container, #mf-group-container, #restaurant-container, #gift-shop-container, #luggage-container, #settings-container, #away-airport-placeholder');
        if (interactiveElement && !interactiveElement.hasAttribute('data-hover-sound-played')) {
            playSound('pop');
            interactiveElement.setAttribute('data-hover-sound-played', 'true');
            interactiveElement.addEventListener('mouseleave', () => {
                interactiveElement.removeAttribute('data-hover-sound-played');
                if (flightButton) flightTooltip.style.opacity = '0';
            }, { once: true });
        }
    });
    
    document.body.addEventListener('mousemove', (e) => {
         if (flightTooltip.style.opacity === '1') {
            flightTooltip.style.left = `${e.clientX + 15}px`;
            flightTooltip.style.top = `${e.clientY + 15}px`;
         }
    });

    // Minigame Drag/Drop Listeners
    bagDropzone.addEventListener('dragover', e => {
        e.preventDefault();
        bagDropzone.classList.add('over');
    });

    bagDropzone.addEventListener('dragleave', () => {
        bagDropzone.classList.remove('over');
    });

    bagDropzone.addEventListener('drop', e => {
        e.preventDefault();
        bagDropzone.classList.remove('over');
        if (draggedItem) {
            const reward = parseInt(e.dataTransfer!.getData('text/plain'));
            updateScore(reward);
            playSound('earn');
            showEarningToast(reward); // Show toast on successful manual drop
            draggedItem.remove();
            setTimeout(createFoodItem, 50); // Replenish quickly
        }
    });


    // Game initialization
    playSound('welcome');
    updateScore(500);
    updateMinigameUnlockStatus();
    setInterval(pollAndUpdateState, 5000);
    pollAndUpdateState(); // Initial fetch
    showHomeView();
    gameLoop();
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});
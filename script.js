const transcript = document.querySelector("#transcript");
const composer = document.querySelector("#composer");
const promptInput = document.querySelector("#prompt");
const statusLine = document.querySelector("#status");
const agentCard = document.querySelector("#agentCard");
const belief = document.querySelector("#belief");
const usefulness = document.querySelector("#usefulness");
const skill = document.querySelector("#skill");
const aura = document.querySelector("#aura");
const moodFill = document.querySelector("#moodFill");
const moodText = document.querySelector("#moodText");
const leftEye = document.querySelector("#leftEye");
const rightEye = document.querySelector("#rightEye");
const mouth = document.querySelector("#mouth");
const gameResult = document.querySelector("#gameResult");
const flappyGame = document.querySelector("#flappyGame");
const flappyCanvas = document.querySelector("#flappyCanvas");
const flappyScore = document.querySelector("#flappyScore");
const flappyMessage = document.querySelector("#flappyMessage");
const flappyJump = document.querySelector("#flappyJump");
const flappyMusic = document.querySelector("#flappyMusic");
const flappyRestart = document.querySelector("#flappyRestart");
const flappyContext = flappyCanvas.getContext("2d");
const flappyImage = new Image();
flappyImage.src = "assets/harshal-the-goonboy.jpeg";
flappyImage.addEventListener("load", () => drawFlappy());

const replies = [
  "Lowkey I opened 47 tabs in my brain and all of them are RCB edits.",
  "I would solve this, but my entire model is trained on vibes, cope, and scoreboard trauma.",
  "Bestie, the answer is definitely to send Kohli in. I do not know the question.",
  "Chat, we are cooked. I pressed the strategy button and it became a meme folder.",
  "Skibidi analysis: do nothing, blame dew, manifest playoffs.",
  "This is giving final-over collapse energy, so I am respectfully unavailable.",
  "I ran the numbers. The numbers left the group chat.",
  "My source is one uncle on WhatsApp and extreme confidence.",
  "I can neither confirm nor deny that I lost tic-tac-toe to a loading spinner.",
  "RCB will win by 300 aura points. Actual runs are a separate department.",
  "I tried to cook, but the kitchen banned me for negative strategy.",
  "That is above my pay grade, and my pay grade is one half-eaten packet of chips.",
  "I asked my inner genius. It said 'nah fam' and logged out."
];

const rcbJokes = [
  "RCB strategy meeting ended at 49 runs. Very historically accurate trauma.",
  "I saw the number 49 and my batting order started uninstalling itself.",
  "RCB fans do not need horror movies. They have scorecards.",
  "HARSHAl says 49 all out was just minimalist batting.",
  "Play bold? More like pray bold.",
  "This innings has more collapses than my Wi-Fi during exams."
];

const statuses = [
  "Bro is attempting chess by moving the boundary rope.",
  "Currently calculating net run rate using astrology.",
  "Braincell went to buy jersey paint and never returned.",
  "Emotionally reviewing 2016 highlights again.",
  "Locked in, which means absolutely no progress is happening.",
  "Trying to clutch a game that has no controls."
];

const cardLines = [
  "Card tapped. HARSHAl gained 2 aura debt and zero wisdom.",
  "He tried to pose. The camera asked for DRS.",
  "RCB cap adjusted. Trophy count unchanged in this simulation.",
  "HARSHAl has entered main character mode and immediately lagged.",
  "Portrait inspected. Confidence high, usefulness missing."
];

let beliefScore = 99;
let skillScore = -4;
let auraDebt = 12;
let moodScore = 66;
let panicTimer;
let flappyFrame;
let flappyRunning = false;
let flappyStarted = false;
let flappy = createFlappyState();
let audioContext;
let musicTimer;
let musicEnabled = true;
let chantStep = 0;
let faceTimer;

function addBubble(type, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  const name = document.createElement("span");
  name.textContent = type === "user" ? "YOU" : "HARSHAl";
  bubble.append(name, document.createTextNode(text));
  transcript.append(bubble);
  while (transcript.children.length > 18) {
    transcript.removeChild(transcript.firstElementChild);
  }
  transcript.scrollTop = transcript.scrollHeight;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function failAnimation() {
  agentCard.classList.remove("fail");
  window.requestAnimationFrame(() => agentCard.classList.add("fail"));
}

function updateFace() {
  const faces = [
    ["x", "o", "x"],
    ["0", "_", "0"],
    [">", "w", "<"],
    ["?", "O", "?"],
    ["-", "3", "-"]
  ];
  const [left, mid, right] = randomItem(faces);
  leftEye.textContent = left;
  mouth.textContent = mid;
  rightEye.textContent = right;
}

function setCardFace(left, mid, right, className) {
  window.clearTimeout(faceTimer);
  leftEye.textContent = left;
  mouth.textContent = mid;
  rightEye.textContent = right;
  if (className) {
    agentCard.classList.remove("hyped", "sad");
    agentCard.classList.add(className);
  }
  faceTimer = window.setTimeout(() => {
    agentCard.classList.remove("sad");
    updateFace();
  }, 1200);
}

function updateStats(delta = {}) {
  beliefScore = Math.max(0, Math.min(100, beliefScore + (delta.belief ?? 0)));
  skillScore += delta.skill ?? 0;
  auraDebt = Math.max(0, auraDebt + (delta.aura ?? 0));
  moodScore = Math.max(5, Math.min(100, moodScore + (delta.mood ?? 0)));

  belief.textContent = `${beliefScore}%`;
  usefulness.textContent = "0%";
  skill.textContent = String(skillScore);
  aura.textContent = String(auraDebt);
  moodFill.style.width = `${moodScore}%`;
  moodText.textContent = moodScore > 78 ? "delulu max" : moodScore > 45 ? "delulu" : "tilted";
  updateFace();
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration = 0.12, type = "square", volume = 0.045) {
  if (!musicEnabled) return;
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.03);
}

function playKick() {
  if (!musicEnabled) return;
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(42, audioContext.currentTime + 0.16);
  gain.gain.setValueAtTime(0.09, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

function playSnare(volume = 0.035) {
  if (!musicEnabled) return;
  ensureAudio();
  const noise = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.08, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = "highpass";
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.09);
}

function playCrowdBurst() {
  if (!musicEnabled) return;
  ensureAudio();
  const noise = audioContext.createBufferSource();
  const length = audioContext.sampleRate * 0.32;
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const fade = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * fade * 0.65;
  }
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = "bandpass";
  filter.frequency.value = 1350;
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(0.06, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.34);
}

function playWicketSting() {
  if (!musicEnabled) return;
  playTone(196, 0.13, "sawtooth", 0.055);
  window.setTimeout(() => playTone(147, 0.15, "sawtooth", 0.055), 120);
  window.setTimeout(() => playTone(98, 0.22, "sawtooth", 0.05), 260);
  window.setTimeout(playCrowdBurst, 80);
}

function playCrySound() {
  if (!musicEnabled) return;
  playTone(440, 0.16, "triangle", 0.045);
  window.setTimeout(() => playTone(370, 0.18, "triangle", 0.045), 150);
  window.setTimeout(() => playTone(294, 0.26, "triangle", 0.04), 330);
  window.setTimeout(() => playSnare(0.02), 120);
}

function playWinSound() {
  if (!musicEnabled) return;
  playCrowdBurst();
  [392, 523, 659, 784, 1046, 1318].forEach((note, index) => {
    window.setTimeout(() => playTone(note, 0.18, index % 2 ? "sawtooth" : "square", 0.048), index * 135);
  });
  window.setTimeout(playCrowdBurst, 520);
}

function startRcbMusic() {
  if (!musicEnabled || musicTimer) return;
  ensureAudio();
  chantStep = 0;
  const chant = [392, 392, 440, 494, 392, 330, 392, 523, 494, 440, 392, 330];
  musicTimer = window.setInterval(() => {
    if (!flappyRunning || flappyGame.classList.contains("is-hidden")) {
      stopRcbMusic();
      return;
    }
    if (chantStep % 4 === 0) playKick();
    if (chantStep % 4 === 2) playSnare();
    if (chantStep % 8 === 7) playCrowdBurst();
    playTone(chant[chantStep % chant.length], 0.11, chantStep % 3 === 0 ? "sawtooth" : "square", 0.026);
    chantStep += 1;
  }, 185);
}

function stopRcbMusic() {
  window.clearInterval(musicTimer);
  musicTimer = undefined;
}

function answer() {
  window.setTimeout(() => {
    addBubble("agent", randomItem(replies));
    statusLine.textContent = randomItem(statuses);
    updateStats({
      belief: Math.floor(Math.random() * 2),
      skill: -Math.floor(Math.random() * 3),
      aura: 2,
      mood: Math.random() > 0.5 ? 4 : -5
    });
    failAnimation();
  }, 380);
}

function createFlappyState() {
  return {
    player: { x: 88, y: 120, size: 38, velocity: 0 },
    pipes: [],
    trophies: [],
    gravity: 0.26,
    lift: -5.8,
    speed: 1.55,
    gap: 168,
    score: 0,
    target: 5,
    tick: 0,
    grace: 70,
    ended: false,
    won: false
  };
}

function drawFlappyBackground() {
  const width = flappyCanvas.width;
  const height = flappyCanvas.height;
  const sky = flappyContext.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#243b5a");
  sky.addColorStop(1, "#17171b");
  flappyContext.fillStyle = sky;
  flappyContext.fillRect(0, 0, width, height);

  flappyContext.fillStyle = "rgba(233, 189, 69, 0.16)";
  for (let i = 0; i < 6; i += 1) {
    const x = (i * 110 - (flappy.tick * 0.45) % 110);
    flappyContext.fillRect(x, 220 + (i % 2) * 10, 72, 8);
  }
}

function drawFlappyPlayer() {
  const { x, y, size } = flappy.player;
  flappyContext.save();
  flappyContext.translate(x + size / 2, y + size / 2);
  flappyContext.rotate(Math.max(-0.45, Math.min(0.55, flappy.player.velocity / 12)));
  flappyContext.beginPath();
  flappyContext.arc(0, 0, size / 2, 0, Math.PI * 2);
  flappyContext.clip();
  if (flappyImage.complete) {
    flappyContext.drawImage(flappyImage, -size / 2, -size / 2, size, size);
  } else {
    flappyContext.fillStyle = "#c91f32";
    flappyContext.fillRect(-size / 2, -size / 2, size, size);
  }
  flappyContext.restore();

  flappyContext.strokeStyle = "#e9bd45";
  flappyContext.lineWidth = 4;
  flappyContext.beginPath();
  flappyContext.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  flappyContext.stroke();
}

function drawFlappyPipes() {
  flappy.pipes.forEach((pipe) => {
    flappyContext.fillStyle = "#c91f32";
    flappyContext.fillRect(pipe.x, 0, pipe.width, pipe.top);
    flappyContext.fillRect(pipe.x, pipe.top + flappy.gap, pipe.width, flappyCanvas.height - pipe.top - flappy.gap);

    flappyContext.fillStyle = "#e9bd45";
    flappyContext.fillRect(pipe.x - 5, pipe.top - 12, pipe.width + 10, 12);
    flappyContext.fillRect(pipe.x - 5, pipe.top + flappy.gap, pipe.width + 10, 12);
  });
}

function drawTrophies() {
  flappy.trophies.forEach((trophy) => {
    flappyContext.save();
    flappyContext.translate(trophy.x, trophy.y);
    flappyContext.fillStyle = "#e9bd45";
    flappyContext.strokeStyle = "#f7f1df";
    flappyContext.lineWidth = 2;
    flappyContext.beginPath();
    flappyContext.moveTo(0, -13);
    flappyContext.lineTo(16, -13);
    flappyContext.lineTo(12, 4);
    flappyContext.quadraticCurveTo(8, 10, 4, 4);
    flappyContext.closePath();
    flappyContext.fill();
    flappyContext.stroke();
    flappyContext.fillRect(6, 8, 4, 8);
    flappyContext.fillRect(1, 16, 14, 4);
    flappyContext.beginPath();
    flappyContext.arc(-2, -5, 7, -Math.PI / 2, Math.PI / 2);
    flappyContext.arc(18, -5, 7, Math.PI / 2, -Math.PI / 2);
    flappyContext.stroke();
    flappyContext.restore();
  });
}

function drawFlappyOverlay(text) {
  flappyContext.fillStyle = "rgba(0, 0, 0, 0.48)";
  flappyContext.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
  flappyContext.fillStyle = "#f7f1df";
  flappyContext.font = "900 22px system-ui";
  flappyContext.textAlign = "center";
  flappyContext.fillText(text, flappyCanvas.width / 2, flappyCanvas.height / 2 - 8);
  flappyContext.font = "700 13px system-ui";
  flappyContext.fillText("Jump / Space / Click to flap", flappyCanvas.width / 2, flappyCanvas.height / 2 + 22);
}

function drawWinningOverlay() {
  flappyContext.fillStyle = "rgba(0, 0, 0, 0.62)";
  flappyContext.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
  flappyContext.fillStyle = "#e9bd45";
  flappyContext.font = "900 32px system-ui";
  flappyContext.textAlign = "center";
  flappyContext.fillText("EE SALA CUP NAMDE", flappyCanvas.width / 2, flappyCanvas.height / 2 - 6);
  flappyContext.fillStyle = "#f7f1df";
  flappyContext.font = "800 14px system-ui";
  flappyContext.fillText("HARSHAl collected 5 imaginary trophies.", flappyCanvas.width / 2, flappyCanvas.height / 2 + 26);
}

function drawFlappy() {
  drawFlappyBackground();
  drawFlappyPipes();
  drawTrophies();
  drawFlappyPlayer();
}

function resetFlappy() {
  window.cancelAnimationFrame(flappyFrame);
  flappyGame.classList.remove("is-hidden");
  flappy = createFlappyState();
  flappyScore.textContent = `Trophies 0/${flappy.target}`;
  flappyMessage.textContent = "Collect 5 trophies. Avoid pipes. RCB math says this is possible.";
  flappyRunning = true;
  flappyStarted = true;
  drawFlappy();
  playCrowdBurst();
  startRcbMusic();
  flappyLoop();
}

function flap(event) {
  if (event) event.preventDefault();
  if (flappyGame.classList.contains("is-hidden")) return;
  if (!flappyRunning || flappy.ended) {
    resetFlappy();
    return;
  }
  playTone(660, 0.055, "triangle", 0.035);
  flappy.player.velocity = flappy.lift;
}

function spawnPipe() {
  const top = 28 + Math.random() * 62;
  const pipe = {
    x: flappyCanvas.width + 12,
    width: 42,
    top,
    scored: false
  };
  flappy.pipes.push(pipe);
  if (flappy.score < flappy.target) {
    flappy.trophies.push({
      x: pipe.x + 82,
      y: pipe.top + flappy.gap / 2,
      size: 28,
      collected: false
    });
  }
}

function hitPipe(pipe) {
  const player = flappy.player;
  const padding = 9;
  const playerLeft = player.x + padding;
  const playerTop = player.y + padding;
  const playerRight = player.x + player.size - padding;
  const playerBottom = player.y + player.size - padding;
  const withinX = playerRight > pipe.x && playerLeft < pipe.x + pipe.width;
  const inGap = playerTop > pipe.top && playerBottom < pipe.top + flappy.gap;
  return withinX && !inGap;
}

function hitTrophy(trophy) {
  const player = flappy.player;
  const centerX = player.x + player.size / 2;
  const centerY = player.y + player.size / 2;
  const dx = centerX - trophy.x;
  const dy = centerY - trophy.y;
  return Math.hypot(dx, dy) < player.size / 2 + trophy.size / 2;
}

function winFlappy() {
  flappyRunning = false;
  flappy.ended = true;
  flappy.won = true;
  stopRcbMusic();
  drawFlappy();
  drawWinningOverlay();
  flappyMessage.textContent = "EE SALA CUP NAMDE. Trophy cabinet finally rendered.";
  addBubble("agent", "I collected 5 trophies. EE SALA CUP NAMDE. Reality may appeal this decision.");
  statusLine.textContent = "HARSHAl is smiling like RCB just won the multiverse.";
  setCardFace("^", "u", "^", "hyped");
  playWinSound();
  updateStats({ belief: 1, skill: 8, aura: -12, mood: 22 });
  window.setTimeout(() => {
    if (flappy.won) drawWinningOverlay();
  }, 1800);
  window.setTimeout(() => {
    if (flappy.won) drawWinningOverlay();
  }, 3600);
}

function endFlappy() {
  flappyRunning = false;
  flappy.ended = true;
  stopRcbMusic();
  drawFlappy();
  drawFlappyOverlay("HARSHAl fumbled the flight");
  const roast = flappy.score === 49 ? "The sacred 49 has returned. Everyone hide the scorecard." : randomItem(rcbJokes);
  flappyMessage.textContent = `Trophies ${flappy.score}/${flappy.target}. ${roast}`;
  addBubble("agent", `Flappy report: I collected ${flappy.score}/${flappy.target} trophies, then cried in RCB font.`);
  setCardFace(";", "n", ";", "sad");
  playCrySound();
  updateStats({ skill: -4, aura: 6, mood: -8 });
  failAnimation();
}

function flappyLoop() {
  if (!flappyRunning) return;

  flappy.tick += 1;
  flappy.player.velocity += flappy.gravity;
  flappy.player.y += flappy.player.velocity;

  if (flappy.tick % 138 === 0) spawnPipe();

  flappy.pipes.forEach((pipe) => {
    pipe.x -= flappy.speed;
  });

  flappy.trophies.forEach((trophy) => {
    trophy.x -= flappy.speed;
    if (!trophy.collected && hitTrophy(trophy)) {
      trophy.collected = true;
      flappy.score += 1;
      flappyScore.textContent = `Trophies ${flappy.score}/${flappy.target}`;
      playTone(784, 0.055, "square", 0.028);
      setCardFace("^", "o", "^", "hyped");
      statusLine.textContent = `Trophy collected. HARSHAl briefly remembered how to win.`;
      if (flappy.score === flappy.target) {
        winFlappy();
        return;
      }
      if (flappy.score === 1 || flappy.score === 3) {
        playCrowdBurst();
        flappyMessage.textContent = randomItem(rcbJokes);
      }
    }
  });

  flappy.pipes = flappy.pipes.filter((pipe) => pipe.x + pipe.width > -20);
  flappy.trophies = flappy.trophies.filter((trophy) => !trophy.collected && trophy.x > -30);

  if (flappy.won) return;

  const hitGround = flappy.player.y < -18 || flappy.player.y + flappy.player.size > flappyCanvas.height + 18;
  const crashed = hitGround || flappy.pipes.some(hitPipe);

  drawFlappy();

  if (crashed && flappy.tick > flappy.grace) {
    playWicketSting();
    endFlappy();
    return;
  }

  flappyFrame = window.requestAnimationFrame(flappyLoop);
}

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = promptInput.value.trim();
  if (!message) return;

  addBubble("user", message);
  promptInput.value = "";
  answer();
});

document.querySelectorAll(".actions button").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const wasFlappyHidden = flappyGame.classList.contains("is-hidden");
    const actionLines = {
      game: "I chose rock in chess and somehow got LBW. Massive skill issue.",
      think: "Thinking hard... thought expired. Please recharge with one RCB win.",
      rcb: "Prediction: RCB wins everything, including sports they do not play.",
      fix: "I fixed it by saying 'trust the process' and closing my eyes.",
      panic: `Panic mode activated. ${randomItem(rcbJokes)}`,
      reset: "Delusion reset complete. Unfortunately it reset to the same delusion.",
      flappy: "Flappy HARSHAl loaded. Tap Jump and witness aviation fraud."
    };

    if (action !== "flappy" || wasFlappyHidden || flappy.ended) {
      addBubble("agent", actionLines[action]);
    }
    statusLine.textContent = randomItem(statuses);
    updateStats({ skill: action === "flappy" ? 0 : -1, aura: action === "reset" ? -5 : 3, mood: action === "panic" ? -18 : 6 });
    failAnimation();

    if (action === "panic") {
      playTone(220, 0.09, "sawtooth", 0.06);
      window.setTimeout(() => playTone(180, 0.12, "sawtooth", 0.06), 90);
      agentCard.classList.add("panic");
      window.clearTimeout(panicTimer);
      panicTimer = window.setTimeout(() => agentCard.classList.remove("panic"), 1800);
    }

    if (action === "flappy") {
      flappyGame.classList.remove("is-hidden");
      if (wasFlappyHidden || flappy.ended) {
        resetFlappy();
      } else {
        flap();
      }
    }
  });
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;
    promptInput.focus();
  });
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    const losingReasons = {
      A: "A was correct until HARSHAl clicked it. Then it became 49 all out.",
      B: "B stood for batting collapse. Instant loss.",
      C: "C was cup, but he dropped it in the simulation."
    };

    gameResult.textContent = losingReasons[choice];
    addBubble("agent", `Mini-game update: ${losingReasons[choice]} I remain defeated.`);
    updateStats({ skill: -3, aura: 4, mood: -6 });
    failAnimation();
  });
});

flappyJump.addEventListener("pointerdown", flap);
flappyCanvas.addEventListener("pointerdown", flap);
flappyRestart.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  resetFlappy();
});

flappyMusic.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  flappyMusic.textContent = musicEnabled ? "Music on" : "Music off";
  if (musicEnabled && flappyRunning) {
    startRcbMusic();
    playTone(523, 0.08, "square", 0.04);
  } else {
    stopRcbMusic();
  }
});

function interactWithCard() {
  const line = randomItem(cardLines);
  statusLine.textContent = line;
  addBubble("agent", line);
  updateStats({ aura: 2, mood: 4, skill: -1 });
  playTone(330 + Math.random() * 220, 0.08, "triangle", 0.035);
  agentCard.classList.remove("hyped");
  window.requestAnimationFrame(() => agentCard.classList.add("hyped"));
}

agentCard.addEventListener("click", interactWithCard);
agentCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    interactWithCard();
  }
});

window.addEventListener("keydown", (event) => {
  if (document.activeElement === promptInput) return;
  if (event.code === "Space" && flappyStarted) {
    event.preventDefault();
    flap();
  }
});

drawFlappy();

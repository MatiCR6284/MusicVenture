const {
  config: CFG,
  easySongs,
  icebergSongs,
  mediumSongs,
} = window.MusicVentureData;

const $ = (id) => document.getElementById(id);
const RING = 628.3;
const TIERS = ["fácil", "medio", "iceberg"];
const BASE_POINTS = [100, 150, 200];
const TIERS_SONGS = [easySongs, mediumSongs, icebergSongs];
const ALL_SONGS = [...easySongs, ...mediumSongs, ...icebergSongs];
const MIN_PREVIEW_REMAINDER_SECS = 10;
const audioPlayers = [new Audio(), new Audio()];
const sampleAudio = new Audio();
audioPlayers.forEach((player) => {
  player.loop = false;
  player.volume = 0;
});
const AUDIO_FADE_MS = 800;
const SAMPLE_DURATION_MS = 10_000;

let game = null;
let activeAudio = null;
let audioFadeToken = 0;
let sampleButton = null;
let sampleTimer = null;
let sampleRequest = 0;

const shuffle = (items) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const tierForLevel = (level) => (level <= 5 ? 0 : level <= 10 ? 1 : 2);
const blockForLevel = (level) => CFG.bl.find((block) => level <= block[0]);
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9 ]/g, "");

function showSection(id) {
  ["home", "game", "end"].forEach((section) => {
    $(section).hidden = section !== id;
  });
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `cb${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const cleanup = () => {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject();
    }, 8000);

    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject();
    };
    script.src = `${url}&callback=${callback}`;
    document.head.appendChild(script);
  });
}

async function preview(song) {
  if ("p" in song) return song.p;

  const trackId = song.q?.match(/[?&]i=(\d+)/)?.[1];
  if (trackId) {
    try {
      const data = await jsonp(
        `https://itunes.apple.com/lookup?id=${trackId}&country=CL`,
      );
      return (song.p = data.results.find((result) => result.previewUrl)?.previewUrl || null);
    } catch (error) {
      return (song.p = null);
    }
  }

  const artistKey = normalize(song.a.replace(/^the /i, "").split(" ")[0]);
  const titleKey = normalize(song.t.split(" ")[0]);
  const normalizedTitle = normalize(song.t);
  let url = null;
  const countries = trackId ? ["CL"] : CFG.stores;

  for (const country of countries) {
    try {
      const data = await jsonp(
        trackId
          ? `https://itunes.apple.com/lookup?id=${trackId}&country=${country}`
          : "https://itunes.apple.com/search?media=music&entity=song&limit=10&country=" +
              country +
              "&term=" +
              encodeURIComponent(song.q || `${song.t} ${song.a}`),
      );
      const resultsWithPreview = data.results.filter((result) => result.previewUrl);
      if (trackId) {
        url = resultsWithPreview[0]?.previewUrl || null;
        break;
      }

      const matchingArtist = resultsWithPreview.filter((result) =>
        normalize(result.artistName).includes(artistKey),
      );
      const result =
        matchingArtist.find((item) => normalize(item.trackName).includes(titleKey)) ||
        matchingArtist[0] ||
        resultsWithPreview.find((item) =>
          normalize(item.trackName).includes(normalizedTitle),
        );

      if (result) {
        url = result.previewUrl;
        break;
      }
    } catch (error) {
      break;
    }
  }

  return (song.p = url);
}

function resetSampleButton(button) {
  if (!button) return;
  button.disabled = false;
  button.textContent = "▶";
  button.setAttribute("aria-label", button.dataset.playLabel);
  button.removeAttribute("title");
}

function stopSample() {
  sampleRequest++;
  clearTimeout(sampleTimer);
  sampleTimer = null;
  sampleAudio.pause();
  sampleAudio.removeAttribute("src");
  sampleAudio.load();
  resetSampleButton(sampleButton);
  sampleButton = null;
}

async function playSample(song, button) {
  if (sampleButton === button && !sampleAudio.paused) {
    stopSample();
    return;
  }

  stopSample();
  const request = sampleRequest;
  sampleButton = button;
  button.disabled = true;
  button.textContent = "…";
  button.setAttribute("aria-label", `Cargando muestra de ${song.t}`);

  try {
    const url = await preview(song);
    if (request !== sampleRequest) return;
    if (!url) {
      resetSampleButton(button);
      button.title = `No hay una muestra disponible para ${song.t}.`;
      button.setAttribute("aria-label", button.title);
      sampleButton = null;
      return;
    }

    sampleAudio.src = url;
    sampleAudio.onended = () => {
      if (request === sampleRequest) stopSample();
    };
    button.disabled = false;
    button.textContent = "⏸";
    button.setAttribute("aria-label", `Detener muestra de ${song.t}`);
    await sampleAudio.play();
    if (request !== sampleRequest) return;
    sampleTimer = setTimeout(stopSample, SAMPLE_DURATION_MS);
  } catch (error) {
    if (request !== sampleRequest) return;
    stopSample();
    button.title = `No se pudo reproducir la muestra de ${song.t}.`;
    button.setAttribute("aria-label", button.title);
  }
}

// Desde mixFrom, las alternativas se reparten entre los tres tramos.
function distractors(song, count) {
  if (game.level < CFG.mixFrom) {
    return shuffle(ALL_SONGS.filter((item) => item !== song)).slice(0, count);
  }

  const groups = TIERS_SONGS.map((tier) =>
    shuffle(tier.filter((item) => item !== song)),
  );
  const output = [];

  for (
    let i = (Math.random() * 3) | 0, guard = 0;
    output.length < count && guard < 60;
    i++, guard++
  ) {
    const item = groups[i % 3].pop();
    if (item) output.push(item);
  }

  return output;
}

function updateHud() {
  const secondsLeft = game.left;
  const roundedSeconds = Math.ceil(secondsLeft);

  $("tm").textContent =
    `${Math.floor(roundedSeconds / 60)}:` +
    String(roundedSeconds % 60).padStart(2, "0");
  $("ring").style.strokeDashoffset =
    RING * (1 - Math.min(1, secondsLeft / 60));
  $("ring").style.stroke = secondsLeft < 10 ? "var(--cor)" : "var(--mint)";
  $("score").textContent = game.score;
  $("err").textContent =
    `Errores ${game.errors}/${CFG.maxErr} · seguidos ${game.row}/${CFG.maxRow}`;
  [...$("lights").children].forEach((light, index) => {
    light.classList.toggle("on", index < Math.min(game.streak, 5));
  });
}

setInterval(() => {
  if (!game || game.over) return;

  const now = performance.now();
  const elapsed = (now - game.last) / 1000;

  if (game.running) {
    game.left = Math.max(0, game.left - elapsed);

    const question = game.question;
    if (question && question.fade) {
      question.time += elapsed;
      const lastIndex = question.items.length - 1;
      const due = Math.min(
        lastIndex,
        Math.floor(question.time / (CFG.fadeSecs / lastIndex)),
      );

      while (question.gone < due) {
        const remainingOptions = [...$("opts").children].filter(
          (option, index) =>
            question.items[index] !== question.correct &&
            !option.classList.contains("gone"),
        );
        if (!remainingOptions.length) break;
        remainingOptions[(Math.random() * remainingOptions.length) | 0].classList.add(
          "gone",
        );
        question.gone++;
      }

      if (question.time >= CFG.fadeSecs) pick(null, null);
    }
  }

  game.last = now;
  updateHud();
}, 100);

async function start() {
  stopAudio();
  game = {
    level: 1,
    pool: TIERS_SONGS.map((tier) => shuffle([...tier])),
    left: CFG.start,
    last: performance.now(),
    running: false,
    over: false,
    score: 0,
    streak: 0,
    errors: 0,
    row: 0,
    log: [],
    block: [],
    bonusIndex: 0,
    current: null,
  };

  const currentGame = game;
  showSection("game");
  $("lv").textContent = "";
  updateHud();
  const countdown = $("countdown");
  countdown.hidden = false;
  for (let value = 3; value > 0; value--) {
    if (game !== currentGame || currentGame.over) return;
    countdown.textContent = value;
    await wait(1000);
  }
  if (game !== currentGame || currentGame.over) return;
  countdown.hidden = true;
  round();
}

async function play(url) {
  const outgoing = activeAudio;
  const incoming = audioPlayers.find((player) => player !== outgoing);
  const outgoingVolume = outgoing?.volume || 0;
  const token = ++audioFadeToken;

  incoming.pause();
  incoming.onended = null;
  incoming.src = url;
  incoming.load();
  incoming.volume = 0;

  if (incoming.readyState < 1) {
    try {
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timeout);
          incoming.removeEventListener("loadedmetadata", onLoaded);
          incoming.removeEventListener("error", onError);
        };
        const onLoaded = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("No se pudieron cargar los metadatos del audio."));
        };
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Se agotó el tiempo de carga de los metadatos del audio."));
        }, 8000);
        incoming.addEventListener("loadedmetadata", onLoaded, { once: true });
        incoming.addEventListener("error", onError, { once: true });
      });
    } catch (error) {
      $("msg").textContent = "No se pudo cargar el fragmento de audio.";
      return;
    }
  }

  if (token !== audioFadeToken) return;
  const maxStart = Number.isFinite(incoming.duration)
    ? Math.max(
        0,
        Math.min(
          CFG.previewStartSecs,
          incoming.duration - MIN_PREVIEW_REMAINDER_SECS,
        ),
      )
    : 0;
  const minStart = Math.min(CFG.previewStartMinSecs, maxStart);
  const startAt = minStart + Math.random() * (maxStart - minStart);
  try {
    incoming.currentTime = startAt;
  } catch (error) {
    $("msg").textContent = "Este fragmento no permite cambiar el punto de inicio.";
    return;
  }
  incoming.onended = () => {
    if (token !== audioFadeToken || !game?.running) return;
    try {
      incoming.currentTime = startAt;
    } catch (error) {
      $("msg").textContent = "No se pudo repetir el fragmento de audio.";
      return;
    }
    incoming.play().catch(() => {
      if (token === audioFadeToken) {
        $("msg").textContent = "No se pudo continuar el fragmento de audio.";
      }
    });
  };

  try {
    await incoming.play();
  } catch (error) {
    $("msg").textContent = "Haz clic en una opción para continuar.";
    return;
  }

  activeAudio = incoming;
  const started = performance.now();
  const fade = () => {
    if (token !== audioFadeToken) return;
    const progress = Math.min(1, (performance.now() - started) / AUDIO_FADE_MS);
    incoming.volume = progress;
    if (outgoing) outgoing.volume = outgoingVolume * (1 - progress);
    if (progress < 1) {
      setTimeout(fade, 25);
    } else if (outgoing) {
      outgoing.pause();
      outgoing.volume = 0;
    }
  };
  fade();
  $("rec").classList.add("playing");
}

function stopAudio() {
  audioFadeToken++;
  audioPlayers.forEach((player) => {
    player.pause();
    player.onended = null;
    player.volume = 0;
  });
  activeAudio = null;
}

function fadeOutAudio() {
  const token = ++audioFadeToken;
  const volumes = audioPlayers.map((player) => player.volume);
  const started = performance.now();
  const fade = () => {
    if (token !== audioFadeToken) return;
    const progress = Math.min(1, (performance.now() - started) / AUDIO_FADE_MS);
    audioPlayers.forEach((player, index) => {
      player.volume = volumes[index] * (1 - progress);
    });
    if (progress < 1) {
      setTimeout(fade, 25);
    } else {
      stopAudio();
    }
  };
  fade();
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setTrackMeter(progress) {
  const meter = $("track-meter");
  meter.classList.remove("filling", "draining");
  meter.style.setProperty("--meter-duration", "0s");
  $("meter-left").style.transform = `scaleY(${progress})`;
  $("meter-right").style.transform = `scaleY(${progress})`;
}

function fillTrackMeter() {
  const meter = $("track-meter");
  setTrackMeter(0);
  meter.style.setProperty("--meter-duration", `${CFG.optionDelaySecs}s`);
  meter.classList.add("filling");
}

function drainTrackMeter(progress = 1, duration = CFG.fadeSecs) {
  const meter = $("track-meter");
  meter.classList.remove("filling", "draining");
  $("meter-left").style.transform = `scaleY(${progress})`;
  $("meter-right").style.transform = `scaleY(${progress})`;
  meter.style.setProperty("--meter-start", progress);
  meter.style.setProperty("--meter-duration", `${duration}s`);
  meter.classList.add("draining");
}

function finishAfterMeterDrains() {
  const question = game.question;
  const elapsed = Math.min(CFG.fadeSecs, question?.time || 0);
  const remaining = CFG.fadeSecs - elapsed;

  if (remaining <= 0) {
    finish("Se acabó el tiempo");
    return;
  }

  drainTrackMeter(1 - elapsed / CFG.fadeSecs, remaining);
  setTimeout(() => {
    if (game.question) game.question.time = CFG.fadeSecs;
    finish("Se acabó el tiempo");
  }, remaining * 1000);
}

function pauseTrackMeter() {
  const elapsed = game.question?.time || 0;
  const progress = Math.max(0, 1 - Math.min(1, elapsed / CFG.fadeSecs));
  setTrackMeter(progress);
}

function renderOptions(items, getText, correct, onDone) {
  const box = $("opts");
  box.innerHTML = "";
  setTrackMeter(0);
  game.question = {
    items,
    correct,
    done: onDone,
    gone: 0,
    time: 0,
    fade: game.level >= CFG.fadeFrom,
  };

  items.forEach((item) => {
    const button = document.createElement("button");
    button.textContent = getText(item);
    button.onclick = () => pick(item, button);
    box.appendChild(button);
  });
}

// Una respuesta null significa que se agotó el tiempo de la pregunta.
function pick(answer, button) {
  if (!game.running) return;
  game.running = false;
  pauseTrackMeter();
  const question = game.question;

  [...$("opts").children].forEach((option, index) => {
    option.disabled = true;
    if (answer !== null) option.classList.remove("gone");
    if (question.items[index] === question.correct) option.classList.add("ok");
  });

  const isCorrect = answer === question.correct;
  if (button && !isCorrect) button.classList.add("bad");
  question.done(isCorrect, answer === null);
}

async function round() {
  game.running = false;
  $("rec").classList.remove("playing");
  $("card").hidden = true;
  $("opts").innerHTML = "";
  $("msg").textContent = "Cargando fragmento…";

  const tier = tierForLevel(game.level);
  $("lv").textContent = `Nivel ${game.level} · ${TIERS[tier]}`;

  let song = null;
  let url = null;
  while (game.pool[tier].length && !url) {
    song = game.pool[tier].pop();
    url = await preview(song);
  }
  if (game.over) return;
  if (!url) return finish("No quedan más canciones en este tramo");

  const nextSong = game.pool[tier][game.pool[tier].length - 1];
  if (nextSong) preview(nextSong);
  game.current = song;

  const options = shuffle([
    song,
    ...distractors(song, CFG.opts - 1),
  ]);
  renderOptions(options, (item) => item.t, song, answered);
  fillTrackMeter();
  $("msg").textContent = "";
  await wait(CFG.optionDelaySecs * 1000);
  if (game.over) return;
  await play(url);
  if (game.over) return;
  drainTrackMeter();
  game.last = performance.now();
  game.running = true;
}

function answered(isCorrect, late) {
  const tier = tierForLevel(game.level);
  const block = blockForLevel(game.level);
  const entry = { s: game.current, ok: isCorrect, bonus: null };
  game.log.push(entry);
  $("rec").classList.remove("playing");

  if (isCorrect) {
    if (game.bonusIndex < CFG.artistBonusSizes.length) {
      game.block.push(entry);
    }
    game.row = 0;
    game.streak++;
    let points = BASE_POINTS[tier];
    if (game.streak >= 3) points = Math.round(points * 1.5);
    game.score += points;

    let message =
      (game.streak >= 3 ? `¡${game.streak} seguidas! ` : "¡Correcto! ") +
      `+${points}`;
    if (block) {
      game.left += block[1];
      message += ` · +${block[1]} s`;
    }
    $("msg").textContent = message;
  } else {
    game.errors++;
    game.row++;
    game.streak = 0;
    game.block = [];
    $("msg").textContent = late
      ? "Se agotó el tiempo de la pregunta."
      : "Esa no era.";
  }

  updateHud();
  if (game.left <= 0) return finishAfterMeterDrains();
  if (game.row >= CFG.maxRow) {
    return setTimeout(() => finish(`${CFG.maxRow} errores seguidos`), 1500);
  }
  if (game.errors >= CFG.maxErr) {
    return setTimeout(
      () => finish(`Llegaste al límite de ${CFG.maxErr} errores`),
      1500,
    );
  }

  setTimeout(() => {
    if (game.over) return;
    const needed = CFG.artistBonusSizes[game.bonusIndex];
    if (needed && game.block.length >= needed) {
      bonus();
    } else {
      game.level++;
      round();
    }
  }, 1500);
}

// Etapa bonus: una pregunta de artista por cada canción jugada en el tramo.
function askArtist(entry, index, total, bonusSeconds) {
  return new Promise(async (resolve) => {
    const song = entry.s;
    $("lv").textContent = `Etapa bonus · artista ${index} de ${total}`;
    $("card").textContent = song.t;
    $("card").hidden = false;
    $("msg").textContent = "";

    const artists = [...new Set(ALL_SONGS.map((item) => item.a))].filter(
      (artist) => artist !== song.a,
    );
    renderOptions(
      shuffle([song.a, ...shuffle(artists).slice(0, CFG.opts - 1)]),
      (artist) => artist,
      song.a,
      (isCorrect) => {
        $("rec").classList.remove("playing");
        entry.bonus = isCorrect;
        if (isCorrect) {
          game.score += CFG.bonusPts;
          if (bonusSeconds) game.left += bonusSeconds;
          $("msg").textContent = bonusSeconds
            ? `¡Artista correcto! +${CFG.bonusPts} · +${bonusSeconds} s`
            : `¡Artista correcto! +${CFG.bonusPts}`;
        } else {
          $("msg").textContent = `Era ${song.a}`;
        }
        updateHud();
        setTimeout(resolve, 1500);
      },
    );

    fillTrackMeter();
    await wait(CFG.optionDelaySecs * 1000);
    if (game.over) return resolve();
    await play(song.p);
    if (game.over) return resolve();
    drainTrackMeter();
    game.last = performance.now();
    game.running = true;
  });
}

async function bonus() {
  const entries = game.block;
  const bonusSeconds = blockForLevel(game.level)?.[1] || 0;
  game.block = [];

  for (let index = 0; index < entries.length; index++) {
    await askArtist(entries[index], index + 1, entries.length, bonusSeconds);
    if (game.over) return;
    if (game.left <= 0) {
      finishAfterMeterDrains();
      return;
    }
  }

  game.bonusIndex++;
  game.level++;
  round();
}

function finish(reason) {
  if (game.over) return;
  game.over = true;
  game.running = false;
  if (game.question) pauseTrackMeter();
  fadeOutAudio();

  let best = game.score;
  try {
    best = Math.max(best, +localStorage.getItem("mv-best") || 0);
    localStorage.setItem("mv-best", best);
  } catch (error) {}

  $("lv").textContent = "";
  const timeExpired = reason === "Se acabó el tiempo";
  $("fin").textContent = timeExpired
    ? "¡Se acabó el tiempo!"
    : `${game.score} puntos`;
  $("why").textContent = timeExpired
    ? `${game.score} puntos. Llegaste al nivel ${game.level}. Mejor marca: ${best}.`
    : `${reason}. Llegaste al nivel ${game.level}. Mejor marca: ${best}.`;

  stopSample();
  const list = $("songs");
  list.innerHTML = "";
  const entries = [
    ...game.log.filter((entry) => entry.ok),
    ...game.log.filter((entry) => !entry.ok),
  ];
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = `song-row ${entry.ok ? "ok" : "bad"}`;

    const sample = document.createElement("button");
    sample.className = "song-sample";
    sample.type = "button";
    sample.textContent = "▶";
    sample.dataset.playLabel = `Reproducir muestra de ${entry.s.t} de ${entry.s.a}`;
    sample.setAttribute("aria-label", sample.dataset.playLabel);
    sample.onclick = () => playSample(entry.s, sample);

    const artist = document.createElement("span");
    artist.className = "song-artist";
    artist.textContent = entry.s.a;

    const title = document.createElement("span");
    title.className = "song-title";
    title.textContent = entry.s.t;

    item.append(sample, artist, title);
    list.appendChild(item);
  });
  showSection("end");
}

function showBest() {
  try {
    const best = localStorage.getItem("mv-best");
    $("best").textContent = best ? `Mejor marca: ${best}` : "";
  } catch (error) {}
}

$("go").onclick = start;
$("again").onclick = () => {
  stopSample();
  showSection("home");
  showBest();
};
showBest();

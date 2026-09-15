import './styles.css';
import { LanternParadeGame, type GameResult, type GameSnapshot } from './game/LanternParadeGame';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app root');

app.innerHTML = `
  <section class="game-shell">
    <div id="scene" class="scene" aria-live="off"></div>

    <header class="topbar">
      <div class="brand" aria-label="Rước Đèn Đêm Trăng">
        <span class="brand-mark">🏮</span>
        <span>
          <strong>Rước Đèn Đêm Trăng</strong>
          <small>Lantern Parade · 3D</small>
        </span>
      </div>
      <button id="soundBtn" class="icon-btn" type="button" aria-label="Bật hoặc tắt âm thanh">🔊</button>
    </header>

    <aside id="hud" class="hud is-hidden" aria-label="Thông tin lượt chơi">
      <div class="hud-card score-card">
        <small>ĐIỂM</small>
        <strong id="score">0</strong>
      </div>
      <div class="hud-card compact"><span>🏮</span><strong id="lanterns">0</strong></div>
      <div class="hud-card compact"><span>🥮</span><strong id="mooncakes">0</strong></div>
      <div class="hud-card timer"><small>TRĂNG LÊN</small><strong><span id="timer">75</span>s</strong></div>
    </aside>

    <div id="moonMeter" class="moon-meter is-hidden" aria-label="Tiến độ Trăng Rằm">
      <div class="moon-meter-head"><span>🌙 Thắp sáng Trăng Rằm</span><strong id="moonPercent">0%</strong></div>
      <div class="meter-track"><div id="meterFill" class="meter-fill"></div></div>
    </div>

    <div id="combo" class="combo" aria-live="polite"></div>
    <div id="toast" class="toast" aria-live="polite"></div>

    <div id="controls" class="mobile-controls is-hidden" aria-label="Điều khiển">
      <button id="leftBtn" type="button" aria-label="Sang trái">←</button>
      <button id="rightBtn" type="button" aria-label="Sang phải">→</button>
    </div>

    <section id="home" class="overlay home-overlay">
      <div class="hero-copy">
        <div class="eyebrow">MID-AUTUMN WEB GAME · 2026</div>
        <h1>Rước Đèn<br/><em>Đêm Trăng</em></h1>
        <p>Dẫn đoàn rước qua phố đêm, mời thêm bạn nhỏ, nhặt bánh Trung Thu và thắp sáng vầng trăng trước khi thời gian kết thúc.</p>
        <div class="feature-row" aria-label="Điểm nổi bật">
          <span>✨ 3D low-poly</span><span>📱 Mobile-first</span><span>🏆 High score</span>
        </div>
        <button id="playBtn" class="primary-btn" type="button"><span>Bắt đầu rước đèn</span><b>PLAY</b></button>
        <p class="controls-hint"><kbd>←</kbd><kbd>→</kbd> hoặc vuốt màn hình để đổi làn</p>
      </div>

      <div class="mission-card">
        <span class="mission-kicker">NHIỆM VỤ ĐÊM NAY</span>
        <strong>Thu thập 18 chiếc đèn</strong>
        <p>Mở <b>Full Moon Mode</b> để đường phố sáng lên và nhận hệ số điểm cao hơn.</p>
        <div class="mission-icons"><span>🏮 +90</span><span>🥮 +60</span><span>✨ +42</span></div>
      </div>
    </section>

    <section id="result" class="overlay result-overlay is-hidden" aria-live="polite">
      <div class="result-card">
        <span id="resultKicker" class="eyebrow">ĐÊM HỘI KẾT THÚC</span>
        <h2 id="resultTitle">Một đoàn rước thật đẹp!</h2>
        <div class="final-score"><small>MOON SCORE</small><strong id="finalScore">0</strong></div>
        <div class="result-grid">
          <div><span>🏮</span><strong id="finalLanterns">0</strong><small>đèn</small></div>
          <div><span>🥮</span><strong id="finalMooncakes">0</strong><small>bánh</small></div>
          <div><span>🏆</span><strong id="bestScore">0</strong><small>kỷ lục</small></div>
        </div>
        <div class="result-actions">
          <button id="replayBtn" class="primary-btn" type="button"><span>Rước lại</span><b>↻</b></button>
          <button id="shareBtn" class="secondary-btn" type="button">Chia sẻ kết quả</button>
        </div>
      </div>
    </section>

    <footer class="footer-note">A tiny celebration of Vietnamese Mid-Autumn Festival · Made for the web</footer>
  </section>
`;

const get = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const sceneHost = get<HTMLElement>('#scene');
const home = get<HTMLElement>('#home');
const result = get<HTMLElement>('#result');
const hud = get<HTMLElement>('#hud');
const moonMeter = get<HTMLElement>('#moonMeter');
const mobileControls = get<HTMLElement>('#controls');
const scoreEl = get<HTMLElement>('#score');
const lanternsEl = get<HTMLElement>('#lanterns');
const mooncakesEl = get<HTMLElement>('#mooncakes');
const timerEl = get<HTMLElement>('#timer');
const meterFill = get<HTMLElement>('#meterFill');
const moonPercent = get<HTMLElement>('#moonPercent');
const comboEl = get<HTMLElement>('#combo');
const toastEl = get<HTMLElement>('#toast');
const finalScore = get<HTMLElement>('#finalScore');
const finalLanterns = get<HTMLElement>('#finalLanterns');
const finalMooncakes = get<HTMLElement>('#finalMooncakes');
const bestScore = get<HTMLElement>('#bestScore');
const resultTitle = get<HTMLElement>('#resultTitle');
const resultKicker = get<HTMLElement>('#resultKicker');
const soundBtn = get<HTMLButtonElement>('#soundBtn');

let soundEnabled = true;
let audioContext: AudioContext | null = null;
let toastTimer = 0;
let pointerStartX: number | null = null;

function tone(frequency: number, duration = 0.08, gainValue = 0.035): void {
  if (!soundEnabled) return;
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, now + duration);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function showToast(message: string, className = ''): void {
  window.clearTimeout(toastTimer);
  toastEl.className = `toast is-visible ${className}`.trim();
  toastEl.textContent = message;
  toastTimer = window.setTimeout(() => {
    toastEl.className = 'toast';
  }, 1100);
}

function renderSnapshot(snapshot: GameSnapshot): void {
  scoreEl.textContent = snapshot.score.toLocaleString('vi-VN');
  lanternsEl.textContent = String(snapshot.lanterns);
  mooncakesEl.textContent = String(snapshot.mooncakes);
  timerEl.textContent = String(snapshot.secondsLeft);
  const percent = Math.round(snapshot.moonProgress * 100);
  meterFill.style.width = `${percent}%`;
  moonPercent.textContent = snapshot.fullMoon ? 'FULL MOON ×1.6' : `${percent}%`;
  moonMeter.classList.toggle('is-full', snapshot.fullMoon);

  comboEl.textContent = snapshot.combo >= 4 ? `COMBO ×${snapshot.combo}` : '';
  comboEl.classList.toggle('is-visible', snapshot.combo >= 4);
}

function renderResult(gameResult: GameResult): void {
  finalScore.textContent = gameResult.score.toLocaleString('vi-VN');
  finalLanterns.textContent = String(gameResult.lanterns);
  finalMooncakes.textContent = String(gameResult.mooncakes);
  bestScore.textContent = gameResult.bestScore.toLocaleString('vi-VN');

  if (gameResult.reason === 'obstacle') {
    resultKicker.textContent = 'ĐOÀN RƯỚC BỊ GIÁN ĐOẠN';
    resultTitle.textContent = 'Suýt nữa là tới hội trăng rồi!';
    tone(180, 0.22, 0.05);
  } else if (gameResult.fullMoon) {
    resultKicker.textContent = 'TRĂNG RẰM ĐÃ SÁNG';
    resultTitle.textContent = 'Bạn đã thắp sáng cả con phố!';
    tone(880, 0.18, 0.045);
  } else {
    resultKicker.textContent = 'ĐÊM HỘI KẾT THÚC';
    resultTitle.textContent = 'Một đoàn rước thật đẹp!';
    tone(660, 0.16, 0.04);
  }

  hud.classList.add('is-hidden');
  moonMeter.classList.add('is-hidden');
  mobileControls.classList.add('is-hidden');
  result.classList.remove('is-hidden');
}

const game = new LanternParadeGame(sceneHost, {
  onTick: renderSnapshot,
  onEnd: renderResult,
  onCollect: (kind) => {
    if (kind === 'recruit') {
      showToast('🏮 Đoàn rước dài thêm!');
      tone(620);
    } else if (kind === 'mooncake') {
      showToast('🥮 Bánh Trung Thu +60');
      tone(520);
    } else {
      showToast('✨ Ánh sao +42');
      tone(760, 0.06);
    }
  },
  onFullMoon: () => {
    showToast('🌕 FULL MOON MODE!', 'full-moon-toast');
    tone(980, 0.25, 0.055);
  },
});

function beginRun(): void {
  home.classList.add('is-hidden');
  result.classList.add('is-hidden');
  hud.classList.remove('is-hidden');
  moonMeter.classList.remove('is-hidden');
  mobileControls.classList.remove('is-hidden');
  game.start();
  tone(440, 0.12, 0.03);
}

get<HTMLButtonElement>('#playBtn').addEventListener('click', beginRun);
get<HTMLButtonElement>('#replayBtn').addEventListener('click', beginRun);
get<HTMLButtonElement>('#leftBtn').addEventListener('pointerdown', () => game.moveLeft());
get<HTMLButtonElement>('#rightBtn').addEventListener('pointerdown', () => game.moveRight());

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
  soundBtn.setAttribute('aria-label', soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh');
  if (soundEnabled) tone(500, 0.06, 0.025);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    event.preventDefault();
    game.moveLeft();
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    event.preventDefault();
    game.moveRight();
  }
});

sceneHost.addEventListener('pointerdown', (event) => {
  pointerStartX = event.clientX;
});
sceneHost.addEventListener('pointerup', (event) => {
  if (pointerStartX === null || !game.isRunning()) return;
  const delta = event.clientX - pointerStartX;
  pointerStartX = null;
  if (Math.abs(delta) < 28) return;
  if (delta < 0) game.moveLeft();
  else game.moveRight();
});

get<HTMLButtonElement>('#shareBtn').addEventListener('click', async () => {
  const score = finalScore.textContent ?? '0';
  const text = `🏮 Tôi vừa đạt ${score} điểm trong Rước Đèn Đêm Trăng. Bạn xây được đoàn rước dài hơn không?`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Rước Đèn Đêm Trăng', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      showToast('🔗 Đã copy link chia sẻ');
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    showToast('Không thể chia sẻ lúc này');
  }
});

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;
let volume = 0.8;

function ensureCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
    const storedMute = localStorage.getItem('zgame_mute');
    if (storedMute === '1') muted = true;
    const storedVol = localStorage.getItem('zgame_volume');
    if (storedVol) volume = Number(storedVol);
    if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  }
}

function playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.12) {
  ensureCtx();
  if (!audioCtx || !masterGain) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(masterGain);
  g.gain.value = 0;
  const now = audioCtx.currentTime;
  g.gain.linearRampToValueAtTime(0.9, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  o.start(now);
  o.stop(now + duration + 0.02);
}

export const soundService = {
  play(name: 'cardPass' | 'buzzerPress' | 'countdown' | 'win' | 'directionChange') {
    switch (name) {
      case 'cardPass':
        playBeep(800, 'triangle', 0.08);
        break;
      case 'buzzerPress':
        playBeep(1200, 'square', 0.18);
        playBeep(900, 'sawtooth', 0.12);
        break;
      case 'countdown':
        playBeep(1000, 'sine', 0.06);
        break;
      case 'win':
        playBeep(880, 'sine', 0.06);
        setTimeout(() => playBeep(990, 'sine', 0.06), 80);
        setTimeout(() => playBeep(1188, 'sine', 0.08), 160);
        break;
      case 'directionChange':
        playBeep(600, 'sine', 0.12);
        break;
      default:
        break;
    }
  },
  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('zgame_volume', String(volume));
    ensureCtx();
    if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  },
  toggleMute() {
    muted = !muted;
    localStorage.setItem('zgame_mute', muted ? '1' : '0');
    if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  },
  isMuted() {
    return muted;
  },
};

// Web Audio API synthesized audio alerts
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  } catch (e) {
    console.warn('Web Audio API not supported', e)
    return null
  }
}

/**
 * Toca um sinal sonoro agradável e nítido de novo pedido
 */
export function playOrderAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 1ª nota: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)

    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.4)

    // 2ª nota: 880 Hz (A5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.15)

    gain2.gain.setValueAtTime(0, now + 0.15)
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.2)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.7)

    // 3ª nota de reforço de sino (1174.66 Hz - D6)
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(1174.66, now + 0.3)

    gain3.gain.setValueAtTime(0, now + 0.3)
    gain3.gain.linearRampToValueAtTime(0.25, now + 0.35)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now + 0.3)
    osc3.stop(now + 0.9)
  } catch (err) {
    console.error('Erro ao tocar som de novo pedido:', err)
  }
}

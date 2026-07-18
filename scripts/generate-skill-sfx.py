"""Create the short, original player skill sounds used by the Canvas runtime.

The sounds are intentionally generated from simple oscillators/noise so the
project has a reproducible, license-free source instead of relying on a
placeholder or an external download.
"""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44_100
OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "audio" / "sfx"


def envelope(index: int, total: int, attack: float = 0.04, release: float = 0.2) -> float:
    t = index / max(1, total - 1)
    if t < attack:
        return t / attack
    if t > 1.0 - release:
        return max(0.0, (1.0 - t) / release)
    return 1.0


def tone(duration: float, start_hz: float, end_hz: float, amplitude: float, waveform: str = "sine") -> list[float]:
    total = max(1, round(duration * SAMPLE_RATE))
    samples: list[float] = []
    phase = 0.0
    for index in range(total):
        progress = index / max(1, total - 1)
        frequency = start_hz + (end_hz - start_hz) * progress
        phase += 2.0 * math.pi * frequency / SAMPLE_RATE
        if waveform == "square":
            value = 1.0 if math.sin(phase) >= 0 else -1.0
        elif waveform == "triangle":
            value = (2.0 / math.pi) * math.asin(math.sin(phase))
        else:
            value = math.sin(phase)
        samples.append(value * amplitude * envelope(index, total))
    return samples


def noise(duration: float, amplitude: float, seed: int) -> list[float]:
    total = max(1, round(duration * SAMPLE_RATE))
    rng = random.Random(seed)
    return [rng.uniform(-1.0, 1.0) * amplitude * envelope(index, total, 0.01, 0.45) for index in range(total)]


def mix(*layers: list[float]) -> list[float]:
    total = max((len(layer) for layer in layers), default=0)
    result = [0.0] * total
    for layer in layers:
        for index, value in enumerate(layer):
            result[index] += value
    peak = max((abs(value) for value in result), default=1.0)
    if peak > 0.92:
        result = [value * (0.92 / peak) for value in result]
    return result


def at(seconds: float, layer: list[float]) -> list[float]:
    return [0.0] * round(seconds * SAMPLE_RATE) + layer


def bell(duration: float, hz: float, amplitude: float) -> list[float]:
    return mix(
        tone(duration, hz, hz, amplitude, "triangle"),
        tone(duration * 0.72, hz * 2.01, hz * 2.01, amplitude * 0.28),
        tone(duration * 0.48, hz * 3.02, hz * 3.02, amplitude * 0.12),
    )


def decay_tone(duration: float, hz: float, amplitude: float, decay: float = 4.5, detune: float = 0.0) -> list[float]:
    total = max(1, round(duration * SAMPLE_RATE))
    samples: list[float] = []
    phase = 0.0
    for index in range(total):
        progress = index / max(1, total - 1)
        frequency = hz * (1.0 + detune * progress)
        phase += 2.0 * math.pi * frequency / SAMPLE_RATE
        attack = min(1.0, index / max(1, round(0.008 * SAMPLE_RATE)))
        tail = math.exp(-decay * progress)
        samples.append(math.sin(phase) * amplitude * attack * tail)
    return samples


def textured_noise(duration: float, amplitude: float, seed: int, smoothing: float = 0.72) -> list[float]:
    total = max(1, round(duration * SAMPLE_RATE))
    rng = random.Random(seed)
    filtered = 0.0
    samples: list[float] = []
    for index in range(total):
        progress = index / max(1, total - 1)
        filtered = filtered * smoothing + rng.uniform(-1.0, 1.0) * (1.0 - smoothing)
        attack = min(1.0, index / max(1, round(0.004 * SAMPLE_RATE)))
        samples.append(filtered * amplitude * attack * math.exp(-5.5 * progress))
    return samples


def wood_hit(hz: float, amplitude: float = 0.18) -> list[float]:
    return mix(
        decay_tone(0.48, hz, amplitude, 5.8),
        decay_tone(0.34, hz * 2.02, amplitude * 0.34, 7.2),
        textured_noise(0.12, amplitude * 0.52, round(hz * 10), 0.84),
    )


def soft_chime(hz: float, amplitude: float = 0.13) -> list[float]:
    return mix(
        decay_tone(1.45, hz, amplitude, 3.8),
        decay_tone(1.1, hz * 2.01, amplitude * 0.22, 5.0),
        decay_tone(0.82, hz * 2.99, amplitude * 0.08, 6.5),
    )


def metal_strike(hz: float, amplitude: float = 0.16) -> list[float]:
    return mix(
        decay_tone(1.35, hz, amplitude, 3.6, -0.008),
        decay_tone(1.05, hz * 1.47, amplitude * 0.42, 4.4, 0.006),
        decay_tone(0.78, hz * 2.31, amplitude * 0.24, 5.8),
        textured_noise(0.16, amplitude * 0.36, round(hz * 17), 0.58),
    )


def low_drum(hz: float = 78.0, amplitude: float = 0.18) -> list[float]:
    return mix(
        tone(0.72, hz * 1.7, hz, amplitude, "sine"),
        textured_noise(0.22, amplitude * 0.55, round(hz * 31), 0.9),
    )


def pad(duration: float, frequencies: list[float], amplitude: float) -> list[float]:
    return mix(*[
        tone(duration, frequency, frequency * 1.002, amplitude / max(1, len(frequencies)), "sine")
        for frequency in frequencies
    ])


def fracture_sound() -> list[float]:
    """Layer dry wood, torn masonry/paper, metal snap and a short low tail."""
    return mix(
        wood_hit(92.0, 0.34),
        textured_noise(0.82, 0.48, 9021, 0.44),
        at(0.025, textured_noise(0.46, 0.34, 771, 0.15)),
        at(0.045, metal_strike(238.0, 0.24)),
        at(0.16, low_drum(54.0, 0.23)),
        at(0.42, decay_tone(0.93, 63.0, 0.13, 3.2, -0.18)),
    )


def convergence_score(ending: str) -> list[float]:
    """Author a 13-second cue: arrivals, fusion, map reveal and ending identity."""
    duration = 13.2
    if ending == "fractured":
        # Historically ominous from the first relic: descending metal,
        # restrained machinery, low drum and dissonance before the split.
        arrivals = [
            at(time, metal_strike(hz, amp))
            for time, hz, amp in [(0.45, 220.0, 0.17), (1.25, 196.0, 0.175), (2.05, 174.6, 0.18), (2.85, 155.6, 0.185), (3.65, 138.6, 0.19)]
        ]
        fusion = mix(
            at(4.65, low_drum(66.0, 0.25)),
            at(4.72, metal_strike(110.0, 0.23)),
            at(5.18, metal_strike(103.8, 0.14)),
        )
        machinery = mix(*[
            at(5.55 + index * 0.56, wood_hit(82.0, 0.065 + index * 0.003))
            for index in range(8)
        ])
        map_tension = mix(
            at(5.8, pad(6.8, [92.5, 98.0, 138.6], 0.18)),
            at(6.35, metal_strike(130.8, 0.11)),
        )
        corruption = mix(
            at(8.0, tone(1.8, 185.0, 116.5, 0.10, "triangle")),
            at(8.35, tone(1.65, 174.6, 110.0, 0.075, "sine")),
            at(9.0, low_drum(58.0, 0.16)),
            at(10.15, pad(3.05, [73.4, 77.8, 110.0], 0.11)),
        )
        return mix([0.0] * round(duration * SAMPLE_RATE), *arrivals, fusion, machinery, map_tension, corruption)

    if ending == "neutral":
        arrivals = [
            at(time, mix(wood_hit(hz, amp), soft_chime(hz * 2.0, amp * 0.34)))
            for time, hz, amp in [(0.45, 196.0, 0.14), (1.25, 220.0, 0.14), (2.05, 246.9, 0.14), (2.85, 261.6, 0.14), (3.65, 293.7, 0.14)]
        ]
        fusion = mix(
            at(4.68, soft_chime(293.7, 0.12)),
            at(4.82, soft_chime(392.0, 0.10)),
            at(5.05, wood_hit(146.8, 0.13)),
        )
        reveal = mix(
            at(5.8, pad(7.4, [146.8, 220.0, 261.6], 0.17)),
            at(6.4, soft_chime(392.0, 0.09)),
            at(8.1, soft_chime(440.0, 0.075)),
            at(10.0, soft_chime(349.2, 0.055)),
        )
        return mix([0.0] * round(duration * SAMPLE_RATE), *arrivals, fusion, reveal)

    arrivals = [
        at(time, mix(wood_hit(hz, amp), soft_chime(hz * 2.0, amp * 0.42)))
        for time, hz, amp in [(0.45, 196.0, 0.15), (1.25, 220.0, 0.15), (2.05, 246.9, 0.15), (2.85, 293.7, 0.15), (3.65, 329.6, 0.15)]
    ]
    fusion = mix(
        at(4.65, wood_hit(130.8, 0.16)),
        at(4.72, soft_chime(392.0, 0.15)),
        at(4.9, soft_chime(523.3, 0.13)),
        at(5.12, soft_chime(659.3, 0.11)),
    )
    reveal = mix(
        at(5.75, pad(7.45, [130.8, 164.8, 196.0, 261.6], 0.22)),
        at(6.3, soft_chime(523.3, 0.12)),
        at(7.15, soft_chime(659.3, 0.11)),
        at(8.1, soft_chime(784.0, 0.10)),
        at(9.3, wood_hit(261.6, 0.09)),
        at(10.1, soft_chime(523.3, 0.075)),
    )
    return mix([0.0] * round(duration * SAMPLE_RATE), *arrivals, fusion, reveal)


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(b"".join(struct.pack("<h", round(max(-1.0, min(1.0, sample)) * 32767)) for sample in samples))


def main() -> None:
    relic_good = convergence_score("good")
    relic_neutral = convergence_score("neutral")
    relic_fractured = convergence_score("fractured")
    relic_fracture = fracture_sound()
    sounds = {
        "player-dash.wav": mix(tone(0.22, 620, 190, 0.3), noise(0.2, 0.18, 12)),
        "player-heal.wav": mix(tone(0.18, 520, 780, 0.26), [0.0] * round(0.08 * SAMPLE_RATE) + tone(0.22, 780, 1_120, 0.25)),
        "player-hurt.wav": mix(tone(0.18, 150, 62, 0.38), noise(0.12, 0.12, 21)),
        "player-death.wav": mix(tone(0.58, 180, 42, 0.42), noise(0.5, 0.1, 34)),
        # Three original 13-second convergence cues. Each follows the five
        # arrivals, fusion core, and map reveal rather than behaving like
        # a keyboard beep or short UI sound.
        "relic-convergence.wav": relic_good,
        "relic-convergence-neutral.wav": relic_neutral,
        "relic-convergence-fractured.wav": relic_fractured,
        "relic-fracture.wav": relic_fracture,
    }
    for filename, samples in sounds.items():
        write_wav(OUT_DIR / filename, samples)
    print(f"Generated {len(sounds)} original skill SFX in {OUT_DIR}")


if __name__ == "__main__":
    main()

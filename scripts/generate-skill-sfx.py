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


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(b"".join(struct.pack("<h", round(max(-1.0, min(1.0, sample)) * 32767)) for sample in samples))


def main() -> None:
    sounds = {
        "player-dash.wav": mix(tone(0.22, 620, 190, 0.3), noise(0.2, 0.18, 12)),
        "player-heal.wav": mix(tone(0.18, 520, 780, 0.26), [0.0] * round(0.08 * SAMPLE_RATE) + tone(0.22, 780, 1_120, 0.25)),
        "player-hurt.wav": mix(tone(0.18, 150, 62, 0.38), noise(0.12, 0.12, 21)),
        "player-death.wav": mix(tone(0.58, 180, 42, 0.42), noise(0.5, 0.1, 34)),
    }
    for filename, samples in sounds.items():
        write_wav(OUT_DIR / filename, samples)
    print(f"Generated {len(sounds)} original skill SFX in {OUT_DIR}")


if __name__ == "__main__":
    main()

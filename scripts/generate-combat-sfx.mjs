import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "assets", "audio", "combat");
await mkdir(output, { recursive: true });

const sounds = [
  ["baton-hit", "sine=frequency=122:duration=0.09,afade=t=out:st=0.04:d=0.05", 0.14],
  ["rifle-shot", "anoisesrc=color=white:duration=0.07,lowpass=f=1700,afade=t=out:st=0.03:d=0.04", 0.13],
  ["lantern-pulse", "sine=frequency=690:duration=0.18,afade=t=out:st=0.09:d=0.09", 0.1],
  ["captain-command", "sine=frequency=190:duration=0.28,afade=t=out:st=0.12:d=0.16", 0.15],
  ["captain-slam", "sine=frequency=76:duration=0.24,afade=t=out:st=0.06:d=0.18", 0.16],
  ["hurt", "anoisesrc=color=pink:duration=0.11,lowpass=f=900,afade=t=out:st=0.04:d=0.07", 0.1],
  ["death", "sine=frequency=105:duration=0.32,afade=t=out:st=0.08:d=0.24", 0.12],
  ["parry", "sine=frequency=940:duration=0.1,afade=t=out:st=0.03:d=0.07", 0.12],
];

for (const [name, source, volume] of sounds) {
  for (const [extension, codec] of [["ogg", "libopus"], ["mp3", "libmp3lame"]]) {
    const destination = path.join(output, `${name}.${extension}`);
    const sampleRate = extension === "ogg" ? "48000" : "44100";
    const result = spawnSync(ffmpegPath, ["-y", "-f", "lavfi", "-i", source, "-filter:a", `volume=${volume}`, "-ac", "1", "-ar", sampleRate, "-c:a", codec, destination], { stdio: "pipe" });
    if (result.status !== 0) {
      throw new Error(`Could not create ${destination}: ${result.stderr}`);
    }
  }
}

console.log(`Generated ${sounds.length} original combat SFX in ${output}`);

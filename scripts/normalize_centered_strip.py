#!/usr/bin/env python3
"""Normalize a horizontal strip using a center anchor for portals and VFX."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def crop_content(image: Image.Image, threshold: int) -> Image.Image | None:
    alpha = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    bbox = alpha.getbbox()
    return image.crop(bbox) if bbox else None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--frames", type=int, required=True)
    parser.add_argument("--frame-size", type=int, required=True)
    args = parser.parse_args()

    strip = Image.open(args.input).convert("RGBA")
    slots = []
    for index in range(args.frames):
        left = round(index * strip.width / args.frames)
        right = round((index + 1) * strip.width / args.frames)
        slots.append(crop_content(strip.crop((left, 0, right, strip.height)), 8))

    contents = [slot for slot in slots if slot is not None]
    if not contents:
        raise SystemExit("No alpha content detected")
    max_width = max(image.width for image in contents)
    max_height = max(image.height for image in contents)
    scale = min(args.frame_size / max_width, args.frame_size / max_height)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    for index, content in enumerate(slots, start=1):
        canvas = Image.new("RGBA", (args.frame_size, args.frame_size), (0, 0, 0, 0))
        if content is not None:
            width = max(1, round(content.width * scale))
            height = max(1, round(content.height * scale))
            resized = content.resize((width, height), Image.Resampling.NEAREST)
            canvas.alpha_composite(
                resized,
                ((args.frame_size - width) // 2, (args.frame_size - height) // 2),
            )
        canvas.save(args.out_dir / f"{index:02d}.png")


if __name__ == "__main__":
    main()

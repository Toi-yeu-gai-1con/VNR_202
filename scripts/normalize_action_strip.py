#!/usr/bin/env python3
"""Normalize an action strip while preserving an approved character baseline."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def alpha_bbox(image: Image.Image, threshold: int = 8) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    return alpha.getbbox()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--anchor", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--sheet", type=Path, required=True)
    parser.add_argument("--frames", type=int, default=8)
    parser.add_argument("--frame-size", type=int, default=96)
    parser.add_argument("--ground-y", type=int, default=80)
    args = parser.parse_args()

    strip = Image.open(args.input).convert("RGBA")
    anchor = Image.open(args.anchor).convert("RGBA")
    anchor_bounds = alpha_bbox(anchor)
    if anchor_bounds is None:
        raise SystemExit("Approved anchor frame has no visible pixels")

    slots: list[Image.Image] = []
    bounds: list[tuple[int, int, int, int]] = []
    for index in range(args.frames):
        left = round(index * strip.width / args.frames)
        right = round((index + 1) * strip.width / args.frames)
        slot = strip.crop((left, 0, right, strip.height))
        bbox = alpha_bbox(slot)
        if bbox is None:
            raise SystemExit(f"No visible pixels detected in action frame {index + 1}")
        slots.append(slot)
        bounds.append(bbox)

    reference = bounds[0]
    reference_height = reference[3] - reference[1]
    anchor_height = anchor_bounds[3] - anchor_bounds[1]
    scale = anchor_height / reference_height
    reference_center_x = slots[0].width / 2
    reference_baseline_y = reference[3]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    normalized: list[Image.Image] = []
    for index, (slot, bbox) in enumerate(zip(slots, bounds, strict=True), start=1):
        canvas = Image.new("RGBA", (args.frame_size, args.frame_size), (0, 0, 0, 0))
        if index == 1:
            # Lock the first frame to the shipped M-90 seed exactly.
            canvas.alpha_composite(
                anchor,
                ((args.frame_size - anchor.width) // 2, args.ground_y - anchor.height),
            )
        else:
            cropped = slot.crop(bbox)
            width = max(1, round(cropped.width * scale))
            height = max(1, round(cropped.height * scale))
            resized = cropped.resize((width, height), Image.Resampling.NEAREST)
            destination_x = round(
                args.frame_size / 2 + (bbox[0] - reference_center_x) * scale
            )
            destination_y = round(
                args.ground_y + (bbox[1] - reference_baseline_y) * scale
            )
            if (
                destination_x < 0
                or destination_y < 0
                or destination_x + width > args.frame_size
                or destination_y + height > args.frame_size
            ):
                raise SystemExit(
                    f"Frame {index} would clip at {(destination_x, destination_y, width, height)}"
                )
            canvas.alpha_composite(resized, (destination_x, destination_y))

        frame_path = args.out_dir / f"{index:02d}.png"
        canvas.save(frame_path)
        normalized.append(canvas)

    sheet = Image.new(
        "RGBA", (args.frame_size * args.frames, args.frame_size), (0, 0, 0, 0)
    )
    for index, frame in enumerate(normalized):
        sheet.alpha_composite(frame, (index * args.frame_size, 0))
    args.sheet.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.sheet)


if __name__ == "__main__":
    main()

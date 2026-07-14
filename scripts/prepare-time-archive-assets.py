#!/usr/bin/env python3
"""Prepare generated time-archive art for the game's existing sprite contracts."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def alpha_from_black(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    pixels = []
    pixel_data = image.get_flattened_data() if hasattr(image, "get_flattened_data") else image.getdata()
    for red, green, blue in pixel_data:
        alpha = max(red, green, blue)
        if alpha <= 4:
            pixels.append((0, 0, 0, 0))
            continue
        scale = 255 / alpha
        pixels.append(
            (
                min(255, round(red * scale)),
                min(255, round(green * scale)),
                min(255, round(blue * scale)),
                alpha,
            )
        )
    output = Image.new("RGBA", image.size, (0, 0, 0, 0))
    output.putdata(pixels)
    output.save(destination)


def load_frames(directory: Path) -> list[Image.Image]:
    paths = sorted(directory.glob("[0-9][0-9].png"))
    if not paths:
        raise SystemExit(f"No normalized frames found in {directory}")
    return [Image.open(path).convert("RGBA") for path in paths]


def pack_row(frames: list[Image.Image], destination: Path) -> None:
    width = frames[0].width
    height = frames[0].height
    if any(frame.size != (width, height) for frame in frames):
        raise SystemExit(f"Frame sizes differ while packing {destination}")
    sheet = Image.new("RGBA", (width * len(frames), height), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * width, 0))
    sheet.save(destination)


def pack_agent_sheet(frames: list[Image.Image], destination: Path) -> None:
    if len(frames) != 11:
        raise SystemExit(f"Expected 11 M-90 source frames, got {len(frames)}")

    sheet = Image.new("RGBA", (96 * 8, 96 * 2), (0, 0, 0, 0))

    # Existing NPC contract: source crop x=30, y=18, w=36, h=62.
    # The 62px normalized frame is centered in the 96px slot and bottom-aligned
    # to that crop, preserving the current 24x40 in-game draw ratio.
    def place(frame: Image.Image, column: int, row: int) -> None:
        sheet.alpha_composite(frame, (column * 96 + 17, row * 96 + 18))

    for column, frame in enumerate(frames[:4]):
        place(frame, column, 0)

    walk_frames = [*frames[4:], frames[4]]
    for column, frame in enumerate(walk_frames):
        place(frame, column, 1)

    sheet.save(destination)


def export_office(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    image.save(destination, "WEBP", lossless=True, method=6)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--sources-only", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    base = root / "assets" / "time-archive"

    alpha_from_black(
        base / "sources" / "reset-wave-raw-black.png",
        base / "effects" / "reset-wave-alpha-source.png",
    )
    export_office(
        base / "sources" / "chronicle-office-raw.png",
        base / "environment" / "chronicle-office.webp",
    )

    if args.sources_only:
        return

    agent_root = base / "characters" / "agent-m90"
    for direction in ("down", "left", "up", "downleft", "upleft"):
        pack_agent_sheet(
            load_frames(agent_root / f"frames-{direction}"),
            agent_root / f"{direction}.png",
        )

    portal_frames = load_frames(base / "environment" / "chronicle-door-frames")
    prop_frames = load_frames(base / "props" / "frames")
    reset_frames = load_frames(base / "effects" / "reset-wave-frames")
    pack_row(portal_frames, base / "environment" / "chronicle-door-sheet.png")
    pack_row(prop_frames, base / "props" / "archive-tools-sheet.png")
    pack_row(reset_frames, base / "effects" / "reset-wave-sheet.png")


if __name__ == "__main__":
    main()

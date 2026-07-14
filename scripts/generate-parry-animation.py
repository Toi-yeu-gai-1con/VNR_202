"""Extract a clean raised-sword Parry strip from the approved Attack 2 cels."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


FRAME_WIDTH = 96
FRAME_HEIGHT = 80
DIRECTIONS = ("up", "down", "left", "right")

# Attack 2 frames 4-6 hold the sword overhead without the old slash burst.
PARRY_SEQUENCE = (0, 4, 5, 6, 6, 5, 4, 0)


def load_frames(path: Path) -> list[Image.Image]:
    sheet = Image.open(path).convert("RGBA")
    if sheet.size != (FRAME_WIDTH * 8, FRAME_HEIGHT):
        raise ValueError(f"{path} must be an 8-frame 96x80 strip")
    return [sheet.crop((index * FRAME_WIDTH, 0, (index + 1) * FRAME_WIDTH, FRAME_HEIGHT)) for index in range(8)]


def write_parry_strip(source_frames: list[Image.Image], output: Path) -> None:
    strip = Image.new("RGBA", (FRAME_WIDTH * len(PARRY_SEQUENCE), FRAME_HEIGHT), (0, 0, 0, 0))
    for index, source_index in enumerate(PARRY_SEQUENCE):
        strip.alpha_composite(source_frames[source_index], (index * FRAME_WIDTH, 0))
    strip.save(output, optimize=True)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    output_dir = root / "assets" / "player"
    for direction in DIRECTIONS:
        write_parry_strip(
            load_frames(output_dir / f"attack2_{direction}.png"),
            output_dir / f"parry_{direction}.png",
        )


if __name__ == "__main__":
    main()

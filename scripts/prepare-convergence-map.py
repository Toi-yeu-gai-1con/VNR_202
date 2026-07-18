"""Clean the generated unified-map artifact without changing its pixel-art edge.

Image generation exports a dark checkerboard around the artifact.  It is not
part of the art direction, so remove only connected dark border pixels and
keep the bronze/ink outline inside the artifact untouched.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "relic-seeds" / "vietnam-unified-map-cinematic-raw.png"
DESTINATION = ROOT / "assets" / "story" / "relics" / "vietnam-unified-map-cinematic.png"


def is_border_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    is_dark_grid = max(red, green, blue) <= 42
    is_light_grid = min(red, green, blue) >= 170 and max(red, green, blue) - min(red, green, blue) <= 12
    return alpha > 0 and (is_dark_grid or is_light_grid)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing source map artifact: {SOURCE}")

    image = Image.open(SOURCE).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not is_border_background(pixels[x, y]):
            continue
        visited.add((x, y))
        pixels[x, y] = (0, 0, 0, 0)
        for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= next_x < width and 0 <= next_y < height:
                queue.append((next_x, next_y))

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    image.save(DESTINATION, optimize=True)
    print(f"Removed {len(visited)} connected background pixels from {DESTINATION}")


if __name__ == "__main__":
    main()

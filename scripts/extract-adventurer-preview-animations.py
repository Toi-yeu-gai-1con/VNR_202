"""Extract directional Adventurer action strips from the supplied 4x preview GIFs.

The previews render four 96x80 frames at exactly 4x nearest-neighbour scale on a
fixed grey stage. This script removes that stage, keeps the stable source-canvas
origins, and packs the requested non-looping actions back into 96x80 PNG strips.
"""

from __future__ import annotations

import argparse
import shutil
from collections import deque
from pathlib import Path

from PIL import Image


FRAME_WIDTH = 96
FRAME_HEIGHT = 80
PREVIEW_SCALE = 4
PREVIEW_SIZE = (632, 500)
LOGICAL_SIZE = (158, 125)
BACKGROUND_COLORS = {
    (61, 61, 61),
    (180, 180, 180),
    (133, 133, 133),
    (93, 93, 93),
    (136, 136, 136),
}

# These are the exact 1x origins used by the public four-direction preview.
DIRECTIONS = {
    "up": {"origin": (31, 2), "window": (63, 18, 96, 67)},
    "left": {"origin": (1, 19), "window": (24, 33, 69, 85)},
    "right": {"origin": (60, 19), "window": (89, 33, 134, 85)},
    "down": {"origin": (31, 43), "window": (62, 58, 97, 113)},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fall", type=Path, required=True)
    parser.add_argument("--dash", type=Path, required=True)
    parser.add_argument("--heal", type=Path, required=True)
    parser.add_argument("--pack-root", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def read_logical_frames(path: Path) -> list[Image.Image]:
    gif = Image.open(path)
    if gif.size != PREVIEW_SIZE:
        raise ValueError(f"{path} must be {PREVIEW_SIZE[0]}x{PREVIEW_SIZE[1]}, got {gif.size}")

    frames: list[Image.Image] = []
    for frame_index in range(gif.n_frames):
        gif.seek(frame_index)
        source = gif.convert("RGB")
        logical = Image.new("RGB", LOGICAL_SIZE)
        logical.putdata(
            [
                source.getpixel((x * PREVIEW_SCALE + 2, y * PREVIEW_SCALE + 2))
                for y in range(LOGICAL_SIZE[1])
                for x in range(LOGICAL_SIZE[0])
            ]
        )
        frames.append(logical)
    return frames


def connected_components(mask: set[tuple[int, int]]) -> list[set[tuple[int, int]]]:
    remaining = set(mask)
    components: list[set[tuple[int, int]]] = []
    while remaining:
        start = remaining.pop()
        component = {start}
        queue = deque([start])
        while queue:
            x, y = queue.popleft()
            for ny in range(y - 1, y + 2):
                for nx in range(x - 1, x + 2):
                    point = (nx, ny)
                    if point in remaining:
                        remaining.remove(point)
                        component.add(point)
                        queue.append(point)
        components.append(component)
    return components


def component_distance(left: set[tuple[int, int]], right: set[tuple[int, int]]) -> int:
    left_x = [point[0] for point in left]
    left_y = [point[1] for point in left]
    right_x = [point[0] for point in right]
    right_y = [point[1] for point in right]
    dx = max(0, max(min(left_x), min(right_x)) - min(max(left_x), max(right_x)) - 1)
    dy = max(0, max(min(left_y), min(right_y)) - min(max(left_y), max(right_y)) - 1)
    return max(dx, dy)


def fill_enclosed_holes(mask: set[tuple[int, int]]) -> set[tuple[int, int]]:
    if not mask:
        return mask
    xs = [point[0] for point in mask]
    ys = [point[1] for point in mask]
    min_x, max_x = min(xs) - 1, max(xs) + 1
    min_y, max_y = min(ys) - 1, max(ys) + 1
    outside = {(min_x, min_y)}
    queue = deque(outside)
    while queue:
        x, y = queue.popleft()
        for ny in range(y - 1, y + 2):
            for nx in range(x - 1, x + 2):
                point = (nx, ny)
                if not (min_x <= nx <= max_x and min_y <= ny <= max_y):
                    continue
                if point in mask or point in outside:
                    continue
                outside.add(point)
                queue.append(point)
    holes = {
        (x, y)
        for y in range(min_y, max_y + 1)
        for x in range(min_x, max_x + 1)
        if (x, y) not in mask and (x, y) not in outside
    }
    return mask | holes


def extract_direction_frame(frame: Image.Image, direction: str) -> Image.Image:
    config = DIRECTIONS[direction]
    x0, y0, x1, y1 = config["window"]
    visible = {
        (x, y)
        for y in range(y0, y1)
        for x in range(x0, x1)
        if frame.getpixel((x, y)) not in BACKGROUND_COLORS
    }
    components = connected_components(visible)
    if not components:
        raise ValueError(f"No {direction} sprite component found")

    body = max(components, key=len)
    selected = set(body)
    # Preserve nearby detached spark/foot clusters without stealing the opposing
    # direction's effect in the narrow centre of the four-character preview.
    for component in components:
        if component is body or len(component) < 2:
            continue
        if component_distance(body, component) <= 3:
            selected.update(component)
    selected = fill_enclosed_holes(selected)

    origin_x, origin_y = config["origin"]
    output = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
    for x, y in selected:
        local_x = x - origin_x
        local_y = y - origin_y
        if 0 <= local_x < FRAME_WIDTH and 0 <= local_y < FRAME_HEIGHT:
            output.putpixel((local_x, local_y), (*frame.getpixel((x, y)), 255))
    return output


def reduce_dash_down_vfx(frame: Image.Image) -> Image.Image:
    """Tone down detached white burst pixels in the down-facing dash preview.

    The source preview has a bright white burst above the character in a few
    down-facing frames. Keep the animation readable, but lower only detached
    upper components so the character's scarf and body remain opaque.
    """
    alpha = frame.getchannel("A")
    visible = {
        (x, y)
        for y in range(FRAME_HEIGHT)
        for x in range(FRAME_WIDTH)
        if alpha.getpixel((x, y)) > 0
    }
    components = connected_components(visible)
    body = max(components, key=len) if components else set()
    pixels = frame.load()
    for component in components:
        if component is body or len(component) < 4:
            continue
        max_y = max(y for _, y in component)
        if max_y > 35:
            continue
        for x, y in component:
            red, green, blue, opacity = pixels[x, y]
            pixels[x, y] = (red, green, blue, round(opacity * 0.58))
    return frame


def write_strip(frames: list[Image.Image], direction: str, output: Path, animation: str) -> None:
    strip = Image.new("RGBA", (FRAME_WIDTH * len(frames), FRAME_HEIGHT), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        extracted = extract_direction_frame(frame, direction)
        if animation == "dash" and direction == "down":
            extracted = reduce_dash_down_vfx(extracted)
        strip.alpha_composite(extracted, (index * FRAME_WIDTH, 0))
    strip.save(output, optimize=True)


def copy_free_pack_actions(pack_root: Path, output_dir: Path) -> None:
    for source_name, output_name in (("ATTACK 1", "attack1"), ("ATTACK 2", "attack2")):
        for direction in DIRECTIONS:
            source = pack_root / "Sprites" / source_name / f"{output_name}_{direction}.png"
            shutil.copyfile(source, output_dir / f"{output_name}_{direction}.png")


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    fall_frames = read_logical_frames(args.fall)
    dash_frames = read_logical_frames(args.dash)
    heal_frames = read_logical_frames(args.heal)
    if (len(fall_frames), len(dash_frames), len(heal_frames)) != (10, 15, 20):
        raise ValueError("Expected fall/dash/heal previews with 10/15/20 frames")

    action_frames = {
        "dash": dash_frames[8:15],
        "heal": heal_frames[8:20],
        "hurt": fall_frames[0:4],
        # Hurt and death share their neutral first frame in the combined preview.
        "death": [fall_frames[0], *fall_frames[4:10]],
    }
    for animation, frames in action_frames.items():
        for direction in DIRECTIONS:
            write_strip(frames, direction, args.output_dir / f"{animation}_{direction}.png", animation)
    copy_free_pack_actions(args.pack_root, args.output_dir)


if __name__ == "__main__":
    main()

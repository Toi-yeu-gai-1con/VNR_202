"""Build normalized 4-frame 64px relic sheets from approved pixel-art seeds.

The source images are generated only as art seeds. This script removes their chroma
background, snaps them to a shared 64px pixel grid, and produces deterministic
idle/glow/resonance/burst frames for the Canvas renderer.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "tmp" / "relic-seeds"
OUTPUT_DIR = ROOT / "assets" / "story" / "relics"
RELIC_IDS = (
    "red-compass",
    "unified-emblem",
    "vietminh-thread",
    "healed-map",
    "doi-moi-gear",
)
FRAME_SIZE = 64
SHEET_SIZE = (FRAME_SIZE * 4, FRAME_SIZE)


def crop_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("Relic source has no visible pixels")
    return image.crop(bounds)


def snap_to_square(image: Image.Image, target: int) -> Image.Image:
    """Fit a source into an integer pixel canvas without smoothing."""
    visible = crop_visible(image)
    max_edge = max(visible.width, visible.height)
    scale = target / max_edge
    size = (
        max(1, round(visible.width * scale)),
        max(1, round(visible.height * scale)),
    )
    reduced = visible.resize(size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (target, target), (0, 0, 0, 0))
    canvas.alpha_composite(reduced, ((target - size[0]) // 2, (target - size[1]) // 2))
    return canvas


def color_for(relic_id: str) -> tuple[int, int, int, int]:
    return {
        "red-compass": (255, 180, 82, 255),
        "unified-emblem": (255, 216, 112, 255),
        "vietminh-thread": (244, 105, 73, 255),
        "healed-map": (112, 203, 215, 255),
        "doi-moi-gear": (160, 218, 112, 255),
    }[relic_id]


def make_aura(size: int, color: tuple[int, int, int, int], strength: int) -> Image.Image:
    aura = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(aura)
    cx = cy = size // 2
    for radius, alpha in ((size // 2 - 4, strength // 6), (size // 2 - 10, strength // 3), (size // 2 - 16, strength)):
        if radius > 0:
            draw.rectangle((cx - radius, cy - radius, cx + radius, cy + radius), fill=(*color[:3], alpha))
    return aura


def stars(size: int, color: tuple[int, int, int, int], amount: int) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    points = ((8, 13), (53, 11), (8, 48), (54, 49), (31, 5), (32, 59))[:amount]
    for x, y in points:
        draw.rectangle((x - 1, y, x + 1, y), fill=color)
        draw.rectangle((x, y - 1, x, y + 1), fill=(255, 248, 203, 255))
    return layer


def scaled(image: Image.Image, factor: float) -> Image.Image:
    width = max(1, round(image.width * factor))
    height = max(1, round(image.height * factor))
    resized = image.resize((width, height), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", image.size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((image.width - width) // 2, (image.height - height) // 2))
    return canvas


def make_frames(relic_id: str, base: Image.Image) -> list[Image.Image]:
    color = color_for(relic_id)
    idle = base
    glow = Image.alpha_composite(make_aura(FRAME_SIZE, color, 60), base)
    resonance = Image.alpha_composite(make_aura(FRAME_SIZE, color, 105), scaled(base, 1.08))
    burst = Image.alpha_composite(make_aura(FRAME_SIZE, color, 150), scaled(base, 1.16))
    return [idle, glow, Image.alpha_composite(resonance, stars(FRAME_SIZE, color, 4)), Image.alpha_composite(burst, stars(FRAME_SIZE, color, 6))]


def build(relic_id: str) -> None:
    source = SOURCE_DIR / f"{relic_id}-alpha.png"
    image = Image.open(source).convert("RGBA")
    base = snap_to_square(image, 48)
    centered = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    centered.alpha_composite(base, (8, 8))
    sheet = Image.new("RGBA", SHEET_SIZE, (0, 0, 0, 0))
    for index, frame in enumerate(make_frames(relic_id, centered)):
        sheet.alpha_composite(frame, (index * FRAME_SIZE, 0))
    sheet.save(OUTPUT_DIR / f"{relic_id}.png", optimize=True)


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for relic in RELIC_IDS:
        build(relic)

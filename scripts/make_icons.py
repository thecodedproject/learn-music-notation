# Draws the app icon: a pair of beamed quavers, rising a third, on a five-line stave,
# white on a blue square. Writes icon.svg and the PNG sizes into the given folder.
#
#   python3 scripts/make_icons.py public/icons
#
# Needs Pillow (pip install pillow).
import math
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
BLUE = (47, 111, 237)
WHITE = (255, 255, 255)
LINE_OPACITY = 0.6

# the drawing in its own units: stave lines 10 apart, y growing downwards
GAP = 10
LINES = [i * GAP for i in range(5)]
LINE_W = 2.4
STAVE_X = (0, 74)
HEAD_RX, HEAD_RY, HEAD_TILT = 6.6, 4.8, -20  # degrees
STEM_W = 2.6
NOTES = [(24, 35), (48, 25)]  # notehead centres: the F and A spaces
STEM_LEN = 29
BEAM_H = 6.2


def head(cx, cy, n=48):
    t = math.radians(HEAD_TILT)
    return [(cx + HEAD_RX * math.cos(a) * math.cos(t) - HEAD_RY * math.sin(a) * math.sin(t),
             cy + HEAD_RX * math.cos(a) * math.sin(t) + HEAD_RY * math.sin(a) * math.cos(t))
            for a in (2 * math.pi * i / n for i in range(n))]


def shapes():
    """(kind, points, opacity): polygons in drawing units"""
    for y in LINES:
        x0, x1 = STAVE_X
        yield [(x0, y - LINE_W / 2), (x1, y - LINE_W / 2), (x1, y + LINE_W / 2), (x0, y + LINE_W / 2)], LINE_OPACITY
    stems = []
    for cx, cy in NOTES:
        yield head(cx, cy), 1
        # the stem rises from the right of the head
        sx = cx + HEAD_RX - 1.1
        top = cy - STEM_LEN
        stems.append((sx, top))
        yield [(sx - STEM_W, top), (sx, top), (sx, cy - 1), (sx - STEM_W, cy - 1)], 1
    (ax, ay), (bx, by) = stems
    yield [(ax - STEM_W, ay), (bx, by), (bx, by + BEAM_H), (ax - STEM_W, ay + BEAM_H)], 1


def fitted(size, scale):
    """the shapes scaled to `scale` of the icon's width (or height) and centred on it"""
    pts = [p for poly, _ in shapes() for p in poly]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    k = size * scale / max(x1 - x0, y1 - y0)
    ox = (size - (x1 - x0) * k) / 2 - x0 * k
    oy = (size - (y1 - y0) * k) / 2 - y0 * k
    for poly, opacity in shapes():
        yield [(ox + x * k, oy + y * k) for x, y in poly], opacity


SCALE = 0.64        # plain icons
MASK_SCALE = 0.5    # maskable icons keep within the central safe circle


def svg():
    polys = "\n".join(
        f'  <polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in poly)}" fill="#ffffff"'
        + (f' opacity="{opacity}"' if opacity < 1 else "") + "/>"
        for poly, opacity in fitted(512, SCALE))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  <rect width="512" height="512" rx="112" fill="#2f6fed"/>\n{polys}\n</svg>\n'


def mix(opacity):
    return tuple(round(b + (w - b) * opacity) for b, w in zip(BLUE, WHITE)) + (255,)


def png(size, scale, rounded):
    k = 4  # draw large and shrink, for smooth edges
    S = size * k
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=112 / 512 * S, fill=BLUE + (255,))
    else:
        d.rectangle([0, 0, S, S], fill=BLUE + (255,))
    for poly, opacity in fitted(S, scale):
        d.polygon(poly, fill=mix(opacity))
    return im.resize((size, size), Image.LANCZOS)


open(f"{out}/icon.svg", "w").write(svg())
png(512, SCALE, True).save(f"{out}/icon-512.png")
png(192, SCALE, True).save(f"{out}/icon-192.png")
png(512, MASK_SCALE, False).save(f"{out}/icon-maskable-512.png")
png(180, SCALE, False).save(f"{out}/apple-touch-icon.png")

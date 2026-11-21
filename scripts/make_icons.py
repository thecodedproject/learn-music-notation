# Draws the QRS icon: Q, R and S in Morse on three left-aligned lines, the block
# centred on a blue square. Writes icon.svg and the PNG sizes into the given folder.
#
#   python3 scripts/make_icons.py public/icons
#
# Needs Pillow (pip install pillow).
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
BLUE, WHITE = (47, 111, 237, 255), (255, 255, 255, 255)
ROWS = ["--.-", ".-.", "..."]   # Q, R, S, top to bottom

# in units: a dot is 1 wide, a dash 3, with 1 between; lines are 1 tall with 1.6 between
def row_elements(code):
    x, els = 0.0, []
    for c in code:
        w = 1 if c == "." else 3
        els.append((x, w))
        x += w + 1
    return els, x - 1

WIDTH_U = max(row_elements(r)[1] for r in ROWS)  # 13
LINE_GAP = 1.6
HEIGHT_U = len(ROWS) + (len(ROWS) - 1) * LINE_GAP

def shapes(size, scale):
    """rounded bars (x, y, w, h, r) for an icon `size` across, the block `scale` of it wide"""
    u = size * scale / WIDTH_U
    x0 = (size - WIDTH_U * u) / 2
    y0 = (size - HEIGHT_U * u) / 2
    for i, code in enumerate(ROWS):
        y = y0 + i * (1 + LINE_GAP) * u
        for x, w in row_elements(code)[0]:
            yield (x0 + x * u, y, w * u, u, u / 2)

SCALE = 0.66        # plain icons
MASK_SCALE = 0.56   # maskable icons keep within the central safe circle

def svg():
    bars = "\n".join(
        f'  <rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="#ffffff"/>'
        for x, y, w, h, r in shapes(512, SCALE))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  <rect width="512" height="512" rx="112" fill="#2f6fed"/>\n{bars}\n</svg>\n'

def png(size, scale, rounded):
    k = 4  # draw large and shrink, for smooth edges
    S = size * k
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=112 / 512 * S, fill=BLUE)
    else:
        d.rectangle([0, 0, S, S], fill=BLUE)
    for x, y, w, h, r in shapes(S, scale):
        d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)

open(f"{out}/icon.svg", "w").write(svg())
png(512, SCALE, True).save(f"{out}/icon-512.png")
png(192, SCALE, True).save(f"{out}/icon-192.png")
png(512, MASK_SCALE, False).save(f"{out}/icon-maskable-512.png")
png(180, SCALE, False).save(f"{out}/apple-touch-icon.png")

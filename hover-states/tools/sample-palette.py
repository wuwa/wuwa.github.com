"""Sample the swatch grid out of a BMP: project the non-white mask onto each
axis to find the circle rows/columns, then take the median color of a small
patch at each intersection. Usage: python3 -I sample-palette.py <file.bmp>"""
import struct
import sys
from statistics import median

path = sys.argv[1]
with open(path, 'rb') as f:
    data = f.read()

assert data[:2] == b'BM', 'not a BMP'
offset = struct.unpack_from('<I', data, 10)[0]
w, h = struct.unpack_from('<ii', data, 18)
bpp = struct.unpack_from('<H', data, 28)[0]
bottom_up = h > 0
h = abs(h)
stride = ((w * bpp // 8) + 3) // 4 * 4
px = bpp // 8
print(f'{w}x{h} {bpp}bpp', file=sys.stderr)


def pixel(x, y):
    row = (h - 1 - y) if bottom_up else y
    i = offset + row * stride + x * px
    return data[i + 2], data[i + 1], data[i]  # BMP is BGR


def is_ink(x, y):
    r, g, b = pixel(x, y)
    return min(r, g, b) < 250


# sub-sample the mask for speed, then project onto both axes
STEP = 4
cols = [0] * w
rows = [0] * h
for y in range(0, h, STEP):
    for x in range(0, w, STEP):
        if is_ink(x, y):
            cols[x] += 1
            rows[y] += 1


def bands(counts, step):
    """contiguous runs of non-zero projection -> list of (start, end) centers"""
    out, start = [], None
    for i in range(0, len(counts), step):
        if counts[i] > 0 and start is None:
            start = i
        elif counts[i] == 0 and start is not None:
            if i - start > 20:
                out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(counts)))
    return out


xb, yb = bands(cols, STEP), bands(rows, STEP)
print(f'{len(xb)} columns, {len(yb)} rows', file=sys.stderr)

STEPS = ['50', '300', '500', '700', '900']
for ri, (y0, y1) in enumerate(yb):
    cy = (y0 + y1) // 2
    line = []
    for (x0, x1) in xb:
        cx = (x0 + x1) // 2
        # median over a 21x21 patch kills webp ringing
        samples = [pixel(cx + dx, cy + dy)
                   for dy in range(-10, 11, 2) for dx in range(-10, 11, 2)]
        rgb = [int(median(s[c] for s in samples)) for c in range(3)]
        line.append('#%02X%02X%02X' % tuple(rgb))
    label = STEPS[ri] if ri < len(STEPS) else f'row{ri}'
    print(f'{label:>4}: ' + '  '.join(line))

"""Generate 6 unique tarot card back designs at high resolution (1050x1800)."""
import random
import math
from PIL import Image, ImageDraw, ImageFilter

W, H = 1050, 1800
OUT = "public/decks/backs"
R = 60  # corner radius


def make_base(bg_color, border_color):
    """Create base card with rounded corners and double border."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Outer card rect
    d.rounded_rectangle((6, 6, W - 6, H - 6), R, fill=bg_color)
    # Outer border
    d.rounded_rectangle((24, 24, W - 24, H - 24), R - 6, outline=border_color, width=9)
    # Inner border
    d.rounded_rectangle((42, 42, W - 42, H - 42), R - 10, outline=border_color, width=3)
    return img, d


def draw_antialiased_star(d, cx, cy, points, outer_r, inner_r, fill):
    """Draw an anti-aliased star using polygon."""
    pts = []
    for i in range(points * 2):
        angle = -math.pi / 2 + i * math.pi / points
        r = outer_r if i % 2 == 0 else inner_r
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    d.polygon(pts, fill=fill)


def deck1_rider_waite():
    """RWS: Deep cosmic blue + gold celestial theme with rich star field."""
    img, d = make_base((12, 16, 48, 255), (200, 170, 90, 255))

    # Deep cosmic nebula-like glow spots
    for _ in range(8):
        x = random.randint(W // 6, 5 * W // 6)
        y = random.randint(H // 6, 5 * H // 6)
        for j in range(15):
            rr = random.randint(30, 120) - j * 5
            if rr <= 0: break
            alpha = max(1, 15 - j)
            d.ellipse((x - rr, y - rr, x + rr, y + rr),
                      fill=(30, 50, 120, alpha))

    # Rich star field with varied sizes and brightness
    for _ in range(200):
        x = random.randint(60, W - 60)
        y = random.randint(60, H - 60)
        r = random.uniform(1.5, 5.5)
        brightness = random.randint(140, 240)
        alpha = random.randint(60, 220)
        color = (brightness, brightness - 20, brightness - 50, alpha)
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)
        # Small glow for larger stars
        if r > 3.5:
            for glow_r in range(3):
                gr = r + 2 + glow_r * 2
                ga = max(1, 40 - glow_r * 15)
                d.ellipse((x - gr, y - gr, x + gr, y + gr),
                          fill=(brightness, brightness - 10, brightness - 30, ga))

    # Central large 8-pointed star (elaborate)
    cx, cy = W // 2, H // 2 - 50
    for s in [180, 130, 85]:
        draw_antialiased_star(d, cx, cy, 8, s, s * 0.4, (220, 190, 80, 200))
    # Central dot
    d.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=(240, 210, 100, 255))

    # Crescent moon - more detailed
    moon_cx, moon_cy = cx + 230, cy - 360
    d.ellipse((moon_cx - 75, moon_cy - 75, moon_cx + 75, moon_cy + 75),
              fill=(210, 185, 95, 210))
    d.ellipse((moon_cx - 30, moon_cy - 85, moon_cx + 65, moon_cy + 60),
              fill=(12, 16, 48, 255))

    # Decorative border stars on sides
    for _ in range(40):
        x = random.choice([random.randint(70, 200), random.randint(W - 200, W - 70)])
        y = random.randint(100, H - 100)
        r = random.uniform(2, 7)
        alpha = random.randint(100, 200)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(210, 185, 100, alpha))

    # Top and bottom decorative dots
    for i in range(60):
        t = i / 60
        x = 80 + t * (W - 160)
        r = 3.5
        d.ellipse((x - r, 80 - r, x + r, 80 + r), fill=(200, 180, 100, 130))
        d.ellipse((x - r, H - 80 - r, x + r, H - 80 + r), fill=(200, 180, 100, 130))

    # Constellation lines
    for _ in range(8):
        x1 = random.randint(80, W // 2 - 50)
        y1 = random.randint(80, H - 80)
        x2 = x1 + random.randint(60, 200)
        y2 = y1 + random.randint(-100, 100)
        d.line((x1, y1, x2, y2), fill=(200, 180, 100, 60), width=2)
        # Small star dots at endpoints
        for px, py in [(x1, y1), (x2, y2)]:
            d.ellipse((px - 4, py - 4, px + 4, py + 4), fill=(220, 195, 110, 180))

    img.save(f"{OUT}/back-rider-waite.png")
    print("✓ Rider-Waite back (1050x1800)")


def deck2_marseille():
    """Marseille: Ivory parchment + red/blue geometric patterns with fleur-de-lis."""
    img, d = make_base((248, 242, 228, 255), (70, 50, 35, 255))

    # Subtle parchment texture overlay
    for _ in range(300):
        x = random.randint(50, W - 50)
        y = random.randint(50, H - 50)
        r = random.uniform(1, 2)
        d.ellipse((x - r, y - r, x + r, y + r),
                  fill=(230, 220, 200, random.randint(15, 40)))

    # Diagonal cross-hatch pattern
    for x in range(80, W - 80, 36):
        for y in range(80, H - 80, 36):
            d.rectangle((x, y, x + 24, y + 24), fill=(175, 45, 35, 28))
            d.rectangle((x + 8, y + 8, x + 32, y + 32), fill=(35, 55, 135, 22))

    # Central mandorla / vesica piscis
    cx, cy = W // 2, H // 2
    for offset in range(0, 16, 4):
        w, h = 130 - offset * 2, 210 - offset * 3
        color = (175, 45, 35, 180 - offset * 12) if offset % 8 == 0 else (35, 55, 135, 160 - offset * 12)
        d.ellipse((cx - w, cy - h, cx + w, cy + h), outline=color, width=4 if offset == 0 else 2)

    # Inner cross
    d.line((cx, cy - 150, cx, cy + 150), fill=(70, 50, 35, 160), width=5)
    d.line((cx - 90, cy, cx + 90, cy), fill=(70, 50, 35, 160), width=5)
    # Rose center
    d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=(175, 45, 35, 180))
    d.ellipse((cx - 14, cy - 14, cx + 14, cy + 14), fill=(35, 55, 135, 200))
    d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=(248, 242, 228, 255))

    # Fleur-de-lis at corners - more detailed
    for corner_x, corner_y in [(150, 220), (W - 150, 220), (150, H - 220), (W - 150, H - 220)]:
        # Base circle
        d.ellipse((corner_x - 30, corner_y - 30, corner_x + 30, corner_y + 30),
                  fill=(175, 45, 35, 130))
        # Top petal
        d.ellipse((corner_x - 14, corner_y - 55, corner_x + 14, corner_y - 12),
                  fill=(35, 55, 135, 110))
        # Side petals
        d.ellipse((corner_x + 5, corner_y - 12, corner_x + 38, corner_y + 15),
                  fill=(175, 45, 35, 90))
        d.ellipse((corner_x - 38, corner_y - 12, corner_x - 5, corner_y + 15),
                  fill=(175, 45, 35, 90))
        # Center dot
        d.ellipse((corner_x - 5, corner_y - 5, corner_x + 5, corner_y + 5),
                  fill=(248, 242, 228, 200))

    # Decorative corner squares
    for corner_x, corner_y in [(100, 120), (W - 100, 120), (100, H - 120), (W - 100, H - 120)]:
        d.rounded_rectangle((corner_x - 18, corner_y - 18, corner_x + 18, corner_y + 18),
                            6, fill=(35, 55, 135, 100))
        d.rounded_rectangle((corner_x - 8, corner_y - 8, corner_x + 8, corner_y + 8),
                            3, fill=(175, 45, 35, 130))

    img.save(f"{OUT}/back-marseille.png")
    print("✓ Marseille back (1050x1800)")


def deck3_thoth():
    """Thoth: Deep cosmic purple + gold Tree of Life with mystical geometry."""
    img, d = make_base((25, 10, 42, 255), (205, 175, 55, 255))

    # Cosmic dust background
    for _ in range(150):
        x = random.randint(60, W - 60)
        y = random.randint(60, H - 60)
        r = random.uniform(1, 3)
        d.ellipse((x - r, y - r, x + r, y + r),
                  fill=(140, 100, 200, random.randint(20, 80)))

    # Tree of Life - 10 sephiroth in 3 columns
    cx, cy = W // 2, H // 2
    sephiroth = [
        (cx, 130, "kether"),
        (cx - 140, 250, "binah"), (cx + 140, 250, "chokmah"),
        (cx, 370, "daath"),
        (cx - 140, 490, "geburah"), (cx + 140, 490, "chesed"),
        (cx, 610, "tiphareth"),
        (cx - 140, 730, "hod"), (cx + 140, 730, "netzach"),
        (cx, 850, "yesod"),
        (cx, 1000, "malkuth"),
    ]

    for sx, sy, name in sephiroth:
        r = 32 if name in ("kether", "malkuth") else 26
        # Outer glow
        for j in range(4):
            gr = r + 4 + j * 4
            ga = max(1, 40 - j * 10)
            d.ellipse((sx - gr, sy - gr, sx + gr, sy + gr),
                      fill=(205, 175, 55, ga))
        # Main circle
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(205, 175, 55, 210))
        # Inner
        d.ellipse((sx - r + 8, sy - r + 8, sx + r - 8, sy + r - 8),
                  fill=(25, 10, 42, 255))

    # Connecting paths between sephiroth
    paths = [
        (0, 1), (0, 2), (1, 3), (2, 3), (1, 4), (2, 5),
        (3, 6), (4, 6), (5, 6), (4, 7), (5, 8), (6, 9), (7, 9), (8, 9), (9, 10)
    ]
    for a, b in paths:
        if a < len(sephiroth) and b < len(sephiroth):
            d.line((sephiroth[a][0], sephiroth[a][1],
                    sephiroth[b][0], sephiroth[b][1]),
                   fill=(205, 175, 55, 120), width=2)

    # Three pillars
    for pillar_x in [cx - 140, cx, cx + 140]:
        d.line((pillar_x, 130, pillar_x, 1000), fill=(205, 175, 55, 60), width=1)

    # Rosy cross at top
    rosy_cx, rosy_cy = cx, 130
    cross_s = 50
    d.line((rosy_cx - cross_s, rosy_cy - cross_s, rosy_cx + cross_s, rosy_cy + cross_s),
           fill=(220, 180, 60, 200), width=4)
    d.line((rosy_cx + cross_s, rosy_cy - cross_s, rosy_cx - cross_s, rosy_cy + cross_s),
           fill=(220, 180, 60, 200), width=4)
    for j in range(5):
        rr = 20 - j * 3
        if rr > 0:
            d.ellipse((rosy_cx - rr, rosy_cy - rr, rosy_cx + rr, rosy_cy + rr),
                      fill=(200, 150, 30, 180 - j * 30))

    # Geometric border
    for i in range(24):
        angle = i * math.pi / 12
        r_outer = min(W, H) // 2 - 80
        r_inner = r_outer - 15
        x1 = cx + r_inner * math.cos(angle)
        y1 = cy + r_inner * math.sin(angle)
        x2 = cx + r_outer * math.cos(angle)
        y2 = cy + r_outer * math.sin(angle)
        d.line((x1, y1, x2, y2), fill=(205, 175, 55, 100), width=2)

    # Floating geometric shapes
    for _ in range(16):
        x = random.randint(80, W - 80)
        y = random.randint(80, H - 80)
        size = random.randint(14, 28)
        shapes = [
            lambda x, y, s: d.regular_polygon((x, y, s), n=3, rotation=random.uniform(0, 360), fill=(205, 175, 55, 50)),
            lambda x, y, s: d.regular_polygon((x, y, s), n=5, rotation=random.uniform(0, 360), fill=(150, 100, 200, 40)),
            lambda x, y, s: d.ellipse((x - s, y - s, x + s, y + s), fill=(205, 175, 55, 35)),
        ]
        try:
            shapes[random.randint(0, 2)](x, y, size)
        except Exception:
            d.ellipse((x - size, y - size, x + size, y + size),
                      fill=(205, 175, 55, 35))

    img.save(f"{OUT}/back-thoth.png")
    print("✓ Thoth back (1050x1800)")


def deck4_modern_witch():
    """Modern Witch: Sleek dark + gold moon phase cycle with starlight."""
    img, d = make_base((16, 16, 20, 255), (210, 180, 80, 255))

    # Subtle grid
    for i in range(20):
        y = 100 + i * 85
        d.line((60, y, W - 60, y), fill=(210, 180, 80, 12), width=1)
    for i in range(10):
        x = 100 + i * 100
        d.line((x, 60, x, H - 60), fill=(210, 180, 80, 10), width=1)

    # Central large moon phases ring
    cx, cy = W // 2, H // 2
    phases = 12
    for i in range(phases):
        angle = i * 2 * math.pi / phases - math.pi / 2
        r_orbit = 280
        mx = cx + r_orbit * math.cos(angle)
        my = cy + r_orbit * math.sin(angle)
        radius = 42

        # Moon phase
        d.ellipse((mx - radius, my - radius, mx + radius, my + radius),
                  fill=(210, 180, 80, 220))
        # Crescent cutout
        if i < 6:
            cut = int(35 - i * 6)
            d.ellipse((mx - radius + cut, my - radius, mx + radius + cut, my + radius),
                      fill=(16, 16, 20, 255))
        elif i > 6:
            cut = int(35 - (phases - i) * 6)
            d.ellipse((mx - radius - cut, my - radius, mx + radius - cut, my + radius),
                      fill=(16, 16, 20, 255))

    # Center full moon - glowing
    for j in range(8):
        rr = 80 - j * 8
        if rr > 0:
            d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr),
                      fill=(210, 180, 80, 180 - j * 20))
    d.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), fill=(240, 210, 120, 255))

    # Constellation lines connecting moons
    for i in range(phases):
        for j in [2, 3, 5]:
            a1 = i * 2 * math.pi / phases - math.pi / 2
            a2 = ((i + j) % phases) * 2 * math.pi / phases - math.pi / 2
            x1 = cx + 280 * math.cos(a1)
            y1 = cy + 280 * math.sin(a1)
            x2 = cx + 280 * math.cos(a2)
            y2 = cy + 280 * math.sin(a2)
            d.line((x1, y1, x2, y2), fill=(210, 180, 80, 30), width=1)

    # Sparkle field
    for _ in range(80):
        x = random.randint(70, W - 70)
        y = random.randint(70, H - 70)
        r = random.uniform(1.5, 4)
        brightness = random.randint(180, 255)
        d.ellipse((x - r, y - r, x + r, y + r),
                  fill=(brightness, brightness - 40, brightness - 120, 200))
        # Cross sparkle for some
        if random.random() < 0.25:
            s = r * 2.5
            d.line((x - s, y, x + s, y), fill=(brightness, brightness - 20, brightness - 80, 120), width=2)
            d.line((x, y - s, x, y + s), fill=(brightness, brightness - 20, brightness - 80, 120), width=2)

    img.save(f"{OUT}/back-modern-witch.png")
    print("✓ Modern Witch back (1050x1800)")


def deck5_wild_unknown():
    """Wild Unknown: Minimal b&w hand-drawn aesthetic with intricate linework."""
    img, d = make_base((248, 245, 240, 255), (28, 25, 22, 255))

    # Paper texture
    for _ in range(400):
        x = random.randint(50, W - 50)
        y = random.randint(50, H - 50)
        d.ellipse((x - 1, y - 1, x + 1, y + 1),
                  fill=(220, 215, 205, random.randint(10, 30)))

    # Concentric hand-drawn style borders (irregular)
    for i in range(40):
        inset = 60 + i * 22
        alpha = 200 - i * 5
        if inset < W // 2 - 30:
            d.rounded_rectangle(
                (inset, inset, W - inset, H - inset),
                R + i, outline=(28, 25, 22, max(alpha, 12)), width=2 if i % 4 == 0 else 1
            )

    # Central eye symbol - more detailed
    cx, cy = W // 2, H // 2

    # Outer almond shape
    d.ellipse((cx - 150, cy - 105, cx + 150, cy + 105),
              outline=(28, 25, 22, 210), width=5)
    # Inner almond
    d.ellipse((cx - 135, cy - 92, cx + 135, cy + 92),
              outline=(28, 25, 22, 120), width=2)

    # Iris
    d.ellipse((cx - 50, cy - 50, cx + 50, cy + 50),
              fill=(28, 25, 22, 230))
    # Pupil
    d.ellipse((cx - 28, cy - 28, cx + 28, cy + 28),
              fill=(0, 0, 0, 250))
    # Highlight
    d.ellipse((cx + 5, cy - 12, cx + 16, cy - 1),
              fill=(248, 245, 240, 220))

    # Radiating lines from eye - dense
    for i in range(72):
        angle = i * 5 * math.pi / 180
        r1 = 70
        r2 = 130 + (i % 3) * 25
        x1 = cx + r1 * math.cos(angle)
        y1 = cy + r1 * math.sin(angle)
        x2 = cx + r2 * math.cos(angle)
        y2 = cy + r2 * math.sin(angle)
        d.line((x1, y1, x2, y2), fill=(28, 25, 22, 80), width=2 if i % 6 == 0 else 1)

    # Corner spirals - more detailed
    for ox, oy in [(130, 160), (W - 130, 160), (130, H - 160), (W - 130, H - 160)]:
        for t in range(0, 720, 10):
            a = t * math.pi / 180
            r = 8 + t / 60
            x = ox + r * math.cos(a)
            y = oy + r * math.sin(a)
            dot_size = 1.5 if t % 20 == 0 else 1
            d.ellipse((x - dot_size, y - dot_size, x + dot_size, y + dot_size),
                      fill=(28, 25, 22, 160))

    # Top and bottom ornamental line work
    for side_y in [180, H - 180]:
        for i in range(60):
            x = 150 + i * (W - 300) / 60
            wave_y = side_y + math.sin(i * 0.5) * 18
            r = 3 if i % 5 == 0 else 1.5
            d.ellipse((x - r, wave_y - r, x + r, wave_y + r),
                      fill=(28, 25, 22, 140 if i % 5 == 0 else 60))

    img.save(f"{OUT}/back-wild-unknown.png")
    print("✓ Wild Unknown back (1050x1800)")


def deck6_light_seers():
    """Light Seers: Ethereal purple-pink with starburst and floating light particles."""
    img, d = make_base((22, 12, 32, 255), (180, 145, 205, 255))

    # Gradient glow spots - ethereal feel
    for i in range(8):
        y = H // 6 + i * (H // 8)
        for j in range(12):
            rr = random.randint(50, 160) - j * 8
            x = random.randint(W // 4, 3 * W // 4)
            if rr <= 0: break
            alpha = max(1, 30 - j * 3)
            d.ellipse((x - rr, y - rr, x + rr, y + rr),
                      fill=(120, 80, 180, alpha))

    # Central starburst - elaborate
    cx, cy = W // 2, H // 2
    for i in range(24):
        angle = i * math.pi / 12
        for r in range(50, 320, 12):
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            alpha = max(1, 160 - r // 2)
            s = 6 - r / 60
            brightness = random.randint(200, 255)
            d.ellipse((x - s, y - s, x + s, y + s),
                      fill=(brightness, brightness - 50, 255, int(alpha)))

    # Center glowing orb
    for r in range(80, 0, -4):
        d.ellipse((cx - r, cy - r, cx + r, cy + r),
                  fill=(200, 160, 220, 180 - r * 2))
    d.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), fill=(240, 220, 255, 255))

    # Floating light particles - varied
    for _ in range(120):
        x = random.randint(60, W - 60)
        y = random.randint(60, H - 60)
        r = random.uniform(1.5, 7)
        brightness = random.randint(160, 255)
        colors = [
            (brightness, brightness - 40, brightness, 200),  # pink-white
            (brightness - 40, brightness - 80, brightness, 180),  # purple
            (brightness, brightness - 20, brightness - 80, 170),  # warm
        ]
        c = random.choice(colors)
        d.ellipse((x - r, y - r, x + r, y + r), fill=c)

    # Diamond sparkles
    for _ in range(30):
        x = random.randint(100, W - 100)
        y = random.randint(100, H - 100)
        s = random.uniform(6, 15)
        alpha = random.randint(120, 220)
        d.line((x - s, y, x + s, y), fill=(255, 240, 255, alpha), width=2)
        d.line((x, y - s, x, y + s), fill=(255, 240, 255, alpha), width=2)
        # Diagonal
        ds = s * 0.6
        d.line((x - ds, y - ds, x + ds, y + ds), fill=(255, 240, 255, alpha // 2), width=1)
        d.line((x + ds, y - ds, x - ds, y + ds), fill=(255, 240, 255, alpha // 2), width=1)

    # Ethereal rings
    for i in range(4):
        rr = 250 + i * 60
        alpha = 50 - i * 12
        if alpha > 0:
            d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr),
                      outline=(180, 145, 205, alpha), width=2)
            d.ellipse((cx - rr + 20, cy - rr + 20, cx + rr - 20, cy + rr - 20),
                      outline=(200, 180, 220, alpha // 2), width=1)

    img.save(f"{OUT}/back-light-seers.png")
    print("✓ Light Seers back (1050x1800)")


if __name__ == "__main__":
    import os
    os.makedirs(OUT, exist_ok=True)
    deck1_rider_waite()
    deck2_marseille()
    deck3_thoth()
    deck4_modern_witch()
    deck5_wild_unknown()
    deck6_light_seers()
    print(f"\nAll 6 high-res card backs saved to {OUT}/")

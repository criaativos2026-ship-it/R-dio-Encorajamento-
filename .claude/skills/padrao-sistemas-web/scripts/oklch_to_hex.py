#!/usr/bin/env python3
"""Converte cores oklch (como aparecem no CSS de sites Tailwind v4/shadcn) para HEX, por cálculo exato.

Uso:
  python3 oklch_to_hex.py "oklch(55.3% .195 38.402)" "oklch(0.9 0 0)" ...
Aceita L em % ou 0–1. Valores fora da gama sRGB são limitados a 0–255.
"""
import math
import re
import sys


def oklch_to_hex(L, C, h):
    h = math.radians(h)
    a, b = C * math.cos(h), C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    rgb = (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )

    def to8(x):
        x = min(1.0, max(0.0, x))
        x = 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
        return round(x * 255)

    return "#" + "".join(f"{to8(v):02x}" for v in rgb)


def parse(text):
    m = re.match(r"\s*oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)", text)
    if not m:
        raise ValueError(f"Não entendi: {text}")
    L = float(m.group(1)) / (100 if m.group(2) else 1)
    return L, float(m.group(3)), float(m.group(4))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for arg in sys.argv[1:]:
        print(f"{arg:40s} {oklch_to_hex(*parse(arg))}")

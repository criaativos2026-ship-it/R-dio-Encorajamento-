#!/usr/bin/env python3
"""Acha trechos repetidos entre gravações de tela consecutivas (o fim de uma reaparece no começo da seguinte).

Para cada par (A, B), procura no final de A o quadro mais parecido com o começo de B e informa
em que segundo de A cortar para juntar sem repetição. Requer ffmpeg e numpy.

Uso:
  python3 achar_sobreposicao_videos.py --crop 1900:896:220:0 video1.mp4 video2.mp4 video3.mp4 ...
  (--crop opcional: mesmo recorte que será usado na montagem final, para ignorar bordas/legendas)
"""
import argparse
import subprocess
import sys

import numpy as np

W, H, FPS = 64, 30, 30


def frames(path, crop):
    vf = (f"crop={crop}," if crop else "") + f"fps={FPS},scale={W}:{H},format=gray"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, W * H).astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crop")
    ap.add_argument("videos", nargs="+")
    a = ap.parse_args()
    if len(a.videos) < 2:
        sys.exit("Informe pelo menos dois vídeos, na ordem.")
    data = [frames(v, a.crop) for v in a.videos]
    for i in range(len(data) - 1):
        A, B = data[i], data[i + 1]
        tail = A[-FPS * 5:]
        off = len(A) - len(tail)
        d = np.abs(tail - B[0]).mean(axis=1)
        j = int(d.argmin())
        corte = (off + j) / FPS
        repetido = (len(A) - (off + j)) / FPS  # tudo o que vem depois do corte em A já aparece no começo de B
        print(f"{a.videos[i]} -> {a.videos[i + 1]}: começo do próximo = {corte:.2f}s do anterior "
              f"(diferença {d[j]:.1f}; repetido ≈ {repetido:.1f}s; duração do anterior {len(A) / FPS:.1f}s)")
        print(f"   → cortar {a.videos[i]} em trim=end={corte:.2f}" if d[j] < 3 else "   → sem sobreposição clara (diferença alta)")


if __name__ == "__main__":
    main()

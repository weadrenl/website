#!/usr/bin/env bash
# Turns a raw clip into a web-ready hero film for HERO_FILMS in lib/data.ts.
# Usage: scripts/prep-film.sh <input> <name> <start-seconds> <length-seconds> <land|port|crop:CENTER_X>
#   land       16:9 output, 1920 wide
#   port       9:16 output from a portrait source, 1080 wide
#   crop:0.44  9:16 output cut out of a landscape source, centred at 44% of its width
# Writes public/video/<name>.mp4 and <name>.jpg (poster): silent, H.264, faststart, graded darker, warmer and
# a little desaturated so white type reads over it, with a short fade from and to near-black so the loop is soft.
# Detail-heavy footage (water, foam) can be squeezed with CRF=30 or MAXRATE=2.8M in the environment.
set -euo pipefail
IN="$1"; NAME="$2"; SS="$3"; LEN="$4"; MODE="$5"
OUT="public/video"; mkdir -p "$OUT"
GRADE="curves=all='0/0 0.25/0.19 0.5/0.42 0.8/0.72 1/0.88',eq=saturation=0.8:contrast=1.04,colorbalance=rs=0.05:gs=0.015:bs=-0.05:rh=0.03:bh=-0.03"
FADE="fade=t=in:st=0:d=0.6:color=0x0d0e10,fade=t=out:st=$(echo "$LEN - 0.6" | bc):d=0.6:color=0x0d0e10"
case "$MODE" in
  land) GEOM="scale=1920:-2:flags=lanczos" ;;
  port) GEOM="scale=1080:-2:flags=lanczos" ;;
  crop:*) CX="${MODE#crop:}"; GEOM="crop=ih*9/16:ih:iw*${CX}-ih*9/32:0,scale=1080:1920:flags=lanczos" ;;
  *) echo "mode must be land, port or crop:X"; exit 1 ;;
esac
ffmpeg -loglevel error -y -ss "$SS" -t "$LEN" -i "$IN" -an -vf "${GEOM},fps=30,${GRADE},${FADE}" \
  -c:v libx264 -preset slow -crf "${CRF:-27}" -maxrate "${MAXRATE:-4M}" -bufsize 8M -pix_fmt yuv420p -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -loglevel error -y -ss 1.2 -i "$OUT/$NAME.mp4" -frames:v 1 -q:v 6 "$OUT/$NAME.jpg"
echo "$NAME: $(du -h "$OUT/$NAME.mp4" | cut -f1) video, $(du -h "$OUT/$NAME.jpg" | cut -f1) poster"

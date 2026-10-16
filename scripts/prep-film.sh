#!/usr/bin/env bash
# Turns a raw clip into a light, seamless hero loop for HERO_FILMS in lib/data.ts.
# Usage: scripts/prep-film.sh <input> <name> <start-seconds> <length-seconds> <land|port|crop:CENTER_X>
#   land       16:9 output, 1440 x 810
#   port       9:16 output from a portrait source, 720 x 1280
#   crop:0.44  9:16 output cut out of a landscape source, centred at 44% of its width, 720 x 1280
# Writes to public/video/:
#   <name>.mp4       H.264, plays on every phone and browser
#   <name>.webp      the loop's first frame, shown before the film starts and wherever it cannot play
# The loop is seamless: its last second cross-fades into its first frame, so there is no jump and no black.
# Graded a little darker, warmer and desaturated so white type reads over it. 24 fps, no audio.
# Bitrate is capped at 1.0 Mbps so detailed footage stays light (about 0.5-1.1 MB per film); override with MAXRATE.
# (AV1 was tried: at sizes that keep detail it saves almost nothing, and software decoding stutters on cheaper phones.)
set -euo pipefail
IN="$1"; NAME="$2"; SS="$3"; LEN="$4"; MODE="$5"; XF=1
OUT="public/video"; mkdir -p "$OUT"
GRADE="curves=all='0/0 0.25/0.19 0.5/0.42 0.8/0.72 1/0.88',eq=saturation=0.8:contrast=1.04,colorbalance=rs=0.05:gs=0.015:bs=-0.05:rh=0.03:bh=-0.03"
case "$MODE" in
  land) GEOM="scale=1440:810:flags=lanczos" ;;
  port) GEOM="scale=720:1280:flags=lanczos" ;;
  crop:*) CX="${MODE#crop:}"; GEOM="crop=ih*9/16:ih:iw*${CX}-ih*9/32:0,scale=720:1280:flags=lanczos" ;;
  *) echo "mode must be land, port or crop:X"; exit 1 ;;
esac
TOTAL=$(echo "$LEN + $XF" | bc); OFF=$(echo "$LEN - $XF" | bc)
FILTER="[0:v]${GEOM},fps=24,${GRADE},split[a][b];[a]trim=start=${XF}:end=${TOTAL},setpts=PTS-STARTPTS[main];[b]trim=start=0:end=${XF},setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=${XF}:offset=${OFF},format=yuv420p[v]"
ffmpeg -loglevel error -y -ss "$SS" -t "$TOTAL" -i "$IN" -filter_complex "$FILTER" -map "[v]" -an \
  -c:v libx264 -preset slow -crf "${CRF:-28}" -maxrate "${MAXRATE:-1.0M}" -bufsize 2M -profile:v high -g 48 -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -loglevel error -y -i "$OUT/$NAME.mp4" -frames:v 1 -c:v libwebp -quality 62 "$OUT/$NAME.webp"
printf '%s: film %s, still %s\n' "$NAME" "$(du -h "$OUT/$NAME.mp4" | cut -f1)" "$(du -h "$OUT/$NAME.webp" | cut -f1)"

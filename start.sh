#!/bin/sh
# Abasthan Node runtime: no Dockerfile, app runs from repo root.
# UUID comes from the UUID environment variable (set as SECRET in Abasthan),
# never from a file committed to the public repo.
set -e
cd "$(dirname "$0")"
if [ -n "$UUID" ]; then
  python3 - "$UUID" <<'PY'
import json, sys
uuid = sys.argv[1]
cfg = {"inbounds": [{"listen": "127.0.0.1", "port": 10000, "protocol": "vless", "settings": {"clients": [{"id": uuid}], "decryption": "none"}, "streamSettings": {"network": "ws", "wsSettings": {"path": "/vless"}}}], "log": {"loglevel": "warning"}, "outbounds": [{"protocol": "freedom", "tag": "direct"}]}
open('./xray-config.json', 'w').write(json.dumps(cfg))
PY
elif [ ! -f ./xray-config.json ]; then
  echo "UUID environment variable is not set and no xray-config.json found" >&2
  exit 1
fi
if [ ! -x ./xray-bin/xray ]; then
  echo "downloading xray..."
  mkdir -p xray-bin
  if command -v curl >/dev/null 2>&1; then
    curl -sL -o /tmp/xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip
  else
    wget -q -O /tmp/xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip
  fi
  if command -v unzip >/dev/null 2>&1; then
    unzip -o /tmp/xray.zip -d ./xray-bin
  else
    python3 -c "import zipfile; zipfile.ZipFile('/tmp/xray.zip').extractall('./xray-bin')"
  fi
  chmod +x ./xray-bin/xray
  rm -f /tmp/xray.zip
fi
./xray-bin/xray run -c ./xray-config.json &
exec node ./server.js

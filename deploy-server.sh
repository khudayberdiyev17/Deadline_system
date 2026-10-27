#!/bin/bash
set -e

echo "=========================================================="
echo "   NIS Deadline Portal - Server Deploy & Port Manager     "
echo "=========================================================="

# 1. SWAP holatini tekshirish
echo ">> [1/5] Tizim xotirasi (RAM va Swap) tekshirilmoqda..."
free -h

# 2. Port bandligini tekshirish funksiyasi
is_port_in_use() {
    local port=$1
    if command -v ss >/dev/null 2>&1; then
        if ss -tuln | grep -E "(:| )${port}( |$)" >/dev/null 2>&1; then
            return 0
        fi
    fi
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :${port} >/dev/null 2>&1; then
            return 0
        fi
    fi
    if command -v python3 >/dev/null 2>&1; then
        if ! python3 -c "import socket; s = socket.socket(); s.bind(('0.0.0.0', $port)); s.close()" >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

find_free_port() {
    local candidate=$1
    while is_port_in_use "$candidate"; do
        echo "   [!] Port $candidate band, keyingi port tekshirilmoqda..." >&2
        candidate=$((candidate + 1))
    done
    echo "$candidate"
}

# 3. Frontend va Backend uchun bo'sh portlarni aniqlash
echo ">> [2/5] Ish holatidagi portlar tekshirilmoqda..."

# Caddy 80 va 443 ni egallagani uchun Frontendni 8080 dan, Backendni 8000 dan boshlab qidiramiz
DESIRED_FRONTEND_PORT=8080
DESIRED_BACKEND_PORT=8000

# Agar avvalgi .env da belgilangan bo'lsa, o'shandan boshlaymiz
if [ -f .env ]; then
    ENV_FRONTEND=$(grep -E '^FRONTEND_PORT=' .env | cut -d '=' -f2 | tr -d ' "')
    ENV_BACKEND=$(grep -E '^BACKEND_PORT=' .env | cut -d '=' -f2 | tr -d ' "')
    [ -n "$ENV_FRONTEND" ] && DESIRED_FRONTEND_PORT=$ENV_FRONTEND
    [ -n "$ENV_BACKEND" ] && DESIRED_BACKEND_PORT=$ENV_BACKEND
fi

FRONTEND_PORT=$(find_free_port "$DESIRED_FRONTEND_PORT")
# Agar backend port frontend bilan bir xil bo'lib qolsa, bittaga oshiramiz
if [ "$DESIRED_BACKEND_PORT" -eq "$FRONTEND_PORT" ]; then
    DESIRED_BACKEND_PORT=$((FRONTEND_PORT + 1))
fi
BACKEND_PORT=$(find_free_port "$DESIRED_BACKEND_PORT")

echo "   [+] Tanlangan Frontend porti: $FRONTEND_PORT"
echo "   [+] Tanlangan Backend porti : $BACKEND_PORT"

# 4. .env faylini yangilash / yaratish
echo ">> [3/5] .env sozlamalari yangilanmoqda..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# FRONTEND_PORT va BACKEND_PORT ni .env ga yozish / almashtirish
update_env_var() {
    local key=$1
    local val=$2
    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${val}|" .env
    else
        echo "${key}=${val}" >> .env
    fi
}

update_env_var "FRONTEND_PORT" "$FRONTEND_PORT"
update_env_var "BACKEND_PORT" "$BACKEND_PORT"

export FRONTEND_PORT
export BACKEND_PORT

# 5. Docker orqali build va ishga tushirish
echo ">> [4/5] Docker konteynerlari yig'ilmoqda (build) va ishga tushirilmoqda..."
docker compose down || true
docker compose up -d --build

# 6. Caddy konfiguratsiyasini yaratish va ko'rsatish
CADDY_CONF_FILE="caddy_ctf.conf"
cat > "$CADDY_CONF_FILE" <<EOF
ctf.cybertron.uz {
    encode zstd gzip

    reverse_proxy localhost:${FRONTEND_PORT} {
        header_up X-Forwarded-Proto https
    }
}
EOF

echo "=========================================================="
echo "          DEPLOY MUVAFFAQIYATLI YAKUNLANDI!               "
echo "=========================================================="
echo ""
echo "📊 Konteynerlar holati va xotira sarfi:"
sleep 3
docker stats --no-stream
echo ""
echo "🔗 Lokal portlar:"
echo "   - Frontend (SPA + API): http://localhost:${FRONTEND_PORT}"
echo "   - Backend (Swagger)   : http://localhost:${BACKEND_PORT}/docs"
echo ""
echo "🌐 CADDY UCHUN TAYYOR KONFIGURATSIYA:"
echo "----------------------------------------------------------"
cat "$CADDY_CONF_FILE"
echo "----------------------------------------------------------"
echo "Bu konfiguratsiya '${CADDY_CONF_FILE}' fayliga saqlandi."
echo ""
echo "Caddy'ga qo'llash uchun:"
echo "1) Ushbu blokni /etc/caddy/Caddyfile ichiga qo'shing yoki:"
echo "   sudo bash -c 'cat $CADDY_CONF_FILE >> /etc/caddy/Caddyfile'"
echo "2) Caddy'ni qayta yuklang:"
echo "   sudo systemctl reload caddy  (yoki 'caddy reload')"
echo "=========================================================="

#!/bin/bash
set -e

echo "======================================================"
echo " NIS Deadline Portal - 1GB RAM Server Deploy Skripti "
echo "======================================================"

# 1. 2GB SWAP yaratish (1GB RAM li serverlarda OOM bo'lmasligi uchun SHART)
if [ ! -f /swapfile ]; then
    echo ">> [1/4] 2GB Swap xotira yaratilmoqda..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo ">> Swap muvaffaqiyatli yoqildi."
else
    echo ">> [1/4] Swap xotira allaqachon mavjud."
fi

# 2. .env faylini tekshirish
if [ ! -f .env ]; then
    echo ">> [2/4] .env fayli topilmadi, .env.example dan nusxalanmoqda..."
    cp .env.example .env
    echo "DIQQAT: .env faylini ochib, parollarni o'zgartiring!"
else
    echo ">> [2/4] .env fayli mavjud."
fi

# 3. Docker va Docker Compose tekshiruvi
echo ">> [3/4] Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda..."
docker compose down || true
docker compose up -d --build

# 4. Holatni ko'rish
echo ">> [4/4] Konteynerlar ishga tushdi. Xotira sarfi:"
sleep 5
docker stats --no-stream

echo "======================================================"
echo " Tizim muvaffaqiyatli ishga tushirildi!               "
echo " Sayt: http://<SERVER_IP>                            "
echo " API : http://<SERVER_IP>:8000/docs                  "
echo "======================================================"

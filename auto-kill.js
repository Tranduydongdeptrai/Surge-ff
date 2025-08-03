$notification.post("⚠️ Anti-Cheat Scan", "Đã phát hiện quét nguy hiểm!", "VPN sẽ ngắt ngay!");
$done({response: {status: 403, body: "BLOCKED"}});

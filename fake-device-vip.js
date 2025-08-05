/*
  Fake Device VIP++: Auto adjust fake mode (login vs in-game)
*/

function randomIMEI() {
    let imei = '35';
    for (let i = 0; i < 13; i++) imei += Math.floor(Math.random() * 10);
    return imei;
}

function randomAndroidID() {
    const chars = 'abcdef0123456789';
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomMAC() {
    const hex = "0123456789ABCDEF";
    return Array.from({ length: 6 }, () => hex[Math.floor(Math.random() * hex.length)])
        .map((v, i) => i ? v + (i % 2 ? ":" : "") : v).join("").replace(/:$/, "");
}

function randomModel() {
    const models = ["SM-G991B", "SM-G996U", "M2102J20SG", "V2031A", "CPH2231", "Redmi Note 11"];
    return models[Math.floor(Math.random() * models.length)];
}

// Đọc chế độ hiện tại từ auto-switch
let mode = $persistentStore.read("fake_mode") || "light";
console.log("[FAKE-DEVICE] Mode:", mode);

let fakeData = {};

if (mode === "strong") {
    // Fake mạnh khi login
    fakeData = {
        imei: randomIMEI(),
        android_id: randomAndroidID(),
        mac: randomMAC(),
        model: randomModel(),
        manufacturer: "Samsung",
        os_version: "Android 13",
        battery: Math.floor(Math.random() * 50) + 50,
        resolution: "1080x2400",
        cpu: "Snapdragon 888"
    };
} else {
    // Fake nhẹ khi in-game (giữ ID ổn định)
    fakeData = {
        imei: "356789012345678",
        android_id: "abc123def4567890",
        mac: "00:1A:2B:3C:4D:5E",
        model: "SM-G996U",
        manufacturer: "Samsung",
        os_version: "Android 13",
        battery: 80,
        resolution: "1080x2400",
        cpu: "Snapdragon 888"
    };
}

console.log("[FAKE-DEVICE] Sending:", fakeData);
$done({ body: JSON.stringify(fakeData) });

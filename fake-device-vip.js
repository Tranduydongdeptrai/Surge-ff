/*
  fake-device-vip.js
  Tự động fake IMEI, Android ID, Model cho API anti-cheat
*/

function randomIMEI() {
    let imei = '35';
    for (let i = 0; i < 13; i++) imei += Math.floor(Math.random() * 10);
    return imei;
}

function randomAndroidID() {
    const chars = 'abcdef0123456789';
    let id = '';
    for (let i = 0; i < 16; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

function randomModel() {
    const models = ["SM-G991B", "SM-G996U", "M2102J20SG", "V2031A", "CPH2231", "Redmi Note 11"];
    return models[Math.floor(Math.random() * models.length)];
}

// Tạo device info giả
const fakeData = {
    imei: randomIMEI(),
    android_id: randomAndroidID(),
    model: randomModel(),
    device_name: "FreeFire_VIP",
    manufacturer: "Samsung",
    os_version: "Android 13"
};

// Log ra để kiểm tra trong Shadowrocket
console.log("[FAKE-DEVICE] IMEI:", fakeData.imei, "| AndroidID:", fakeData.android_id, "| Model:", fakeData.model);

// Trả response fake
$done({ body: JSON.stringify(fakeData) });

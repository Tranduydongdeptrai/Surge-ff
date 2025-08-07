/**
 * VIP Anti-Ban Script for Shadowrocket (http-request & http-response)
 * Bao gồm:
 * - Fake Device (IMEI, AndroidID, MAC, Model, CPU, Battery, Bootloader, Rooted)
 * - Header Rewrite (xóa/giả header tránh phát hiện)
 * - Risk API Bypass (bypass quét /api/scan)
 * - Fake Lag (delay request ngẫu nhiên)
 * - Tracker Block (chặn tracker/analytics)
 * - Auto Switch Mode (chế độ fake mạnh/nhẹ)
 * - Response Tampering (chống debug & phát hiện)
 * 
 * Cài đặt: Dùng trong mục Script của Shadowrocket (chọn http-request hoặc http-response theo URL)
 * 
 * Hỗ trợ: $request, $response, $done, $persistentStore
 */

(async () => {
  // Helpers
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomIMEI() {
    let imei = '35';
    for (let i = 0; i < 13; i++) imei += randomInt(0, 9);
    return imei;
  }
  function randomAndroidID() {
    const chars = 'abcdef0123456789';
    return Array.from({ length: 16 }, () => chars[randomInt(0, chars.length - 1)]).join('');
  }
  function randomMAC() {
    const hex = "0123456789ABCDEF";
    return Array.from({ length: 6 }, () => hex[randomInt(0, hex.length - 1)])
      .map((v, i) => (i % 2 && i !== 5) ? v + ":" : v).join("").replace(/:$/, "");
  }
  function randomModel() {
    const models = ["SM-G991B", "SM-G996U", "M2102J20SG", "V2031A", "CPH2231", "Redmi Note 11"];
    return models[randomInt(0, models.length - 1)];
  }
  function randomCPU() {
    const cpus = ["Snapdragon 888", "Exynos 2100", "MediaTek Dimensity 1200", "Apple A14", "Kirin 9000"];
    return cpus[randomInt(0, cpus.length - 1)];
  }
  function randomBootloader() {
    const loaders = ["UCU2", "QUIM", "QKQ1", "J110FXXU1", "RP1A"];
    return loaders[randomInt(0, loaders.length - 1)];
  }
  function fakeRootCheck() {
    return false; // always say not rooted
  }
  function randomLocale() {
    const locales = ["en_US", "vi_VN", "zh_CN", "ko_KR", "ja_JP", "fr_FR"];
    return locales[randomInt(0, locales.length - 1)];
  }
  function randomTimezone() {
    const zones = ["Asia/Ho_Chi_Minh", "America/New_York", "Europe/London", "Asia/Tokyo"];
    return zones[randomInt(0, zones.length - 1)];
  }
  function fakeSensorWalkPattern() {
    const t = Date.now() / 1000;
    return {
      gyro_x: Math.sin(t) * 0.5,
      gyro_y: Math.cos(t) * 0.5,
      gyro_z: Math.sin(t / 2) * 0.25,
      accel_x: Math.abs(Math.sin(t)) * 0.7,
      accel_y: Math.abs(Math.cos(t)) * 0.7,
      accel_z: 0.8 + Math.abs(Math.sin(t * 2)) * 0.2
    };
  }
  function fakeGPSRoute(t) {
    const baseLat = 21.0278;
    const baseLng = 105.8342;
    const radius = 0.005;
    return {
      latitude: (baseLat + Math.sin(t) * radius).toFixed(6),
      longitude: (baseLng + Math.cos(t) * radius).toFixed(6),
      accuracy: 5 + Math.abs(Math.sin(t * 3)) * 10
    };
  }
  function tamperResponse(body) {
    try {
      let data = JSON.parse(body);
      if (data.debug_log) delete data.debug_log;
      if (data.ban_reason) data.ban_reason = "Unknown error";
      if (data.stacktrace) delete data.stacktrace;
      data._dummy = {
        token: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now()
      };
      return JSON.stringify(data);
    } catch {
      return body;
    }
  }
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Session ID lưu persistent
  let sessionId = $persistentStore.read("session_id");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    $persistentStore.write(sessionId, "session_id");
  }

  // Auto switch mode: "strong" hoặc "light"
  let mode = $persistentStore.read("fake_mode") || "light";

  if ($request) {
    // Risk API Bypass
    if ($request.url.includes("/api/scan")) {
      await delay(150 + Math.random() * 100);
      $done({ body: JSON.stringify({ status: "ok", allow: true }) });
      return;
    }

    // Fake Device Info
    if ($request.url.includes("/device")) {
      let fakeData = {};
      if (mode === "strong") {
        fakeData = {
          imei: randomIMEI(),
          android_id: randomAndroidID(),
          mac: randomMAC(),
          model: randomModel(),
          manufacturer: "Samsung",
          os_version: "Android 13",
          cpu: randomCPU(),
          bootloader: randomBootloader(),
          rooted: fakeRootCheck(),
          battery: {
            level: randomInt(60, 95),
            charging: Math.random() < 0.3
          },
          resolution: "1080x2400",
          gps: fakeGPSRoute(Date.now() / 10000),
          sensor: fakeSensorWalkPattern(),
          locale: randomLocale(),
          timezone: randomTimezone(),
          session_id: sessionId
        };
      } else {
        fakeData = {
          imei: "356789012345678",
          android_id: "abc123def4567890",
          mac: "00:1A:2B:3C:4D:5E",
          model: "SM-G996U",
          manufacturer: "Samsung",
          os_version: "Android 13",
          cpu: "Snapdragon 888",
          bootloader: "QUIM",
          rooted: false,
          battery: { level: 80, charging: false },
          resolution: "1080x2400",
          gps: { latitude: "21.0278", longitude: "105.8342", accuracy: 5 },
          sensor: {},
          locale: "en_US",
          timezone: "Asia/Ho_Chi_Minh",
          session_id: sessionId
        };
      }
      $done({ body: JSON.stringify(fakeData) });
      return;
    }

    // Header Rewrite
    if ($request.url.match(/https:\/\/freefire\.garena\.com/)) {
      let headers = $request.headers;
      delete headers["User-Agent"];
      delete headers["X-Real-IP"];
      headers["X-Proxy-By"] = "VIP-AntiBand-Pro";
      $done({ headers });
      return;
    }

    // Tracker Block
    const blockDomains = ["facebook.com", "firebase", "appsflyer", "google-analytics", "mixpanel.com", "sentry.io"];
    if (blockDomains.some(d => $request.url.includes(d))) {
      $done({ status: 200, body: "" });
      return;
    }

    // Fake Lag cho request match
    if ($request.url.includes("/match")) {
      let lagMs = randomInt(50, 200);
      await delay(lagMs);
      $done({});
      return;
    }
  }

  if ($response && $response.body) {
    // Response tampering chống phát hiện
    $done({ body: tamperResponse($response.body) });
    return;
  }

  $done({});
})();
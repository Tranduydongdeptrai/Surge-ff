/*
  auto-switch-mode.js
  Tự động chuyển chế độ fake khi login hoặc in-game
*/

let url = $request.url;
let mode = "normal";

// Kiểm tra URL login hay game
if (url.includes("/login")) {
    mode = "login";
    console.log("[AUTO-SWITCH] Login detected → bật chế độ fake mạnh hơn");
    $persistentStore.write("strong", "fake_mode");
} else if (url.includes("/game")) {
    mode = "game";
    console.log("[AUTO-SWITCH] In-Game detected → giảm fake để ổn định");
    $persistentStore.write("light", "fake_mode");
}

// Ghi vào store để các script khác có thể đọc mode hiện tại
$done({});

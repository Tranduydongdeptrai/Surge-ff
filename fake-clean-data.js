let fakeData = {
    "device_id": "000000000000000",
    "model": "iPhone13,4",
    "os_version": "iOS 17.0",
    "status": "clean",
    "last_ban": null,
    "risk_score": 0
};
$done({response: {status: 200, body: JSON.stringify(fakeData)}});

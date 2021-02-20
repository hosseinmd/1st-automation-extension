"use strict";
function sleep(num) {
    return new Promise((resolve) => {
        setTimeout(resolve, num);
    });
}
async function setValue(doc, id, value) {
    var _a, _b;
    await sleep(300);
    (_a = doc.getElementById(id)) === null || _a === void 0 ? void 0 : _a.focus();
    await sleep(300);
    (doc.getElementById(id) || {}).value = value;
    await sleep(300);
    (_b = doc.getElementById(id)) === null || _b === void 0 ? void 0 : _b.blur();
}
const runTfs = async () => {
    var _a, _b, _c;
    await sleep(1000);
    const iframe = (_a = document.getElementsByName("myPopupWindow")) === null || _a === void 0 ? void 0 : _a[0];
    if (!iframe) {
        // will be reload
        (_b = document.getElementById("C_C_C_ImgBtnNew")) === null || _b === void 0 ? void 0 : _b.click();
        return;
    }
    const iDocument = (_c = iframe.contentWindow) === null || _c === void 0 ? void 0 : _c.document;
    if (!iDocument) {
        await sleep(1000);
        runTfs();
        return;
    }
    chrome.storage.sync.get({
        extraDates: "",
    }, async function ({ extraDates }) {
        var _a;
        extraDates = JSON.parse(extraDates) || [];
        extraDates = extraDates.filter(Boolean);
        if (extraDates.length <= 0) {
            return;
        }
        /**@type {{exitTime: string,date: string}} */
        const item = extraDates.pop();
        chrome.storage.sync.set({
            extraDates: JSON.stringify(extraDates),
        });
        if (iDocument.getElementById("ctl00_C_rdtpStartTime_dateInput")) {
            await setValue(iDocument, "C_dpDate_txtDate", item.date);
            await setValue(iDocument, "ctl00_C_rdtpStartTime_dateInput", "5:01 PM");
            await setValue(iDocument, "ctl00_C_rdtpEndTime_dateInput", item.exitTime);
            await setValue(iDocument, "C_rdtxtDesc", ".");
            await sleep(300);
            (_a = iDocument.getElementById("ctl00_C_btnSave")) === null || _a === void 0 ? void 0 : _a.click();
            setInterval(() => {
                var _a;
                const visibility = (_a = document.getElementById("RadWindowWrapper_ctl00_ctl00_ctl00_C_C_C_myPopupWindow")) === null || _a === void 0 ? void 0 : _a.style.visibility;
                if (visibility === "hidden") {
                    window.location.reload();
                }
            }, 2000);
        }
    });
};
if (location.href.includes("RequestExtraWorkList")) {
    console.log("RequestExtraWorkList");
    runTfs();
}
const runMyActivity = async () => {
    var _a;
    await sleep(1000);
    const iframe = (_a = document.getElementsByName("WindowShowDialog")) === null || _a === void 0 ? void 0 : _a[0];
    if (!iframe) {
        await sleep(3000);
        runMyActivity();
        return;
    }
    const rwTitleWrapper = document.querySelector(".rwTitleWrapper .rwTitle");
    if (!rwTitleWrapper) {
        await sleep(1000);
        runMyActivity();
        return;
    }
    rwTitleWrapper.innerText = "ذخیره اضافه کاری";
    rwTitleWrapper.style.textDecoration = "underline";
    if (rwTitleWrapper) {
        rwTitleWrapper.onclick = async () => {
            var _a;
            await sleep(300);
            iframe.focus();
            await sleep(300);
            const iDocument = (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document;
            if (!iDocument) {
                console.log("WindowShowDialog not found");
                return;
            }
            // const content = iDocument.querySelectorAll(
            //   "#C_timeSheetTotalView_gridviewReport tr td"
            // )[4].textContent;
            const trs = iDocument.querySelectorAll("#C_timeSheetTotalView_gridviewReport tr");
            const result = [];
            trs.forEach((tr, index) => {
                var _a;
                if (index === 0) {
                    return;
                }
                const weekName = (_a = tr.querySelectorAll("td")[1].textContent) === null || _a === void 0 ? void 0 : _a.trim();
                const textContent = tr.querySelectorAll("td")[4].textContent;
                const date = tr.querySelectorAll("td")[2].textContent;
                const isThus = weekName === "پنجشنبه";
                const isFri = weekName === "جمعه";
                if (isThus || isFri || !textContent || !date) {
                    return;
                }
                const timeArray = textContent.split("و/خ") || [];
                const timeEntries = timeArray.slice(1).map((v) => v
                    .trim()
                    .split("-")
                    .map((t) => t.trim().replace("پ", "").replace("ش", "").trim()));
                const durations = timeEntries.map(([startTime, exitTime]) => {
                    const durationMS = new Date(`2020/1/1 ${exitTime}`).getTime() -
                        new Date(`2020/1/1 ${startTime}`).getTime();
                    return durationMS;
                });
                const isValid = durations.every((duration) => Number.isInteger(duration));
                if (!isValid) {
                    return;
                }
                const sum = durations.reduce((prev, cur) => prev + cur, 0) / 3600000;
                if (sum < 9) {
                    return;
                }
                const exitTime = timeArray[timeArray.length - 1][1];
                const isAfter = new Date(`2020/1/1 ${exitTime}`).getTime() -
                    new Date(`2020/1/1 5:30 PM`).getTime();
                if (isAfter < 0) {
                    return;
                }
                if (exitTime.includes("PM")) {
                    result.push({
                        exitTime,
                        date,
                    });
                }
            });
            console.log(result);
            if (result.length === 0) {
                alert(" شما هیچ اضافه کاری معتبری برای ثبت ندارید.");
                return;
            }
            chrome.storage.sync.set({
                extraDates: JSON.stringify(result.filter(Boolean)),
            });
        };
    }
};
if (location.href.includes("MyActivity")) {
    console.log("ok");
    runMyActivity();
}

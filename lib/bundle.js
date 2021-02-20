(() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    define("utils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.setValue = exports.sleep = void 0;
        function sleep(num) {
            return new Promise((resolve) => {
                setTimeout(resolve, num);
            });
        }
        exports.sleep = sleep;
        async function setValue(doc, id, value) {
            var _a, _b;
            await sleep(300);
            (_a = doc.getElementById(id)) === null || _a === void 0 ? void 0 : _a.focus();
            await sleep(300);
            (doc.getElementById(id) || {}).value = value;
            await sleep(300);
            (_b = doc.getElementById(id)) === null || _b === void 0 ? void 0 : _b.blur();
        }
        exports.setValue = setValue;
    });
    define("extraTime", ["require", "exports", "utils"], function (require, exports, utils_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.runExtraTime = void 0;
        const runExtraTime = async () => {
            chrome.storage.sync.get({
                extraDates: "",
            }, async function ({ extraDates }) {
                var _a, _b, _c, _d;
                extraDates = (extraDates && JSON.parse(extraDates)) || [];
                extraDates = extraDates.filter(Boolean);
                console.log({ extraDates });
                if (extraDates.length <= 0) {
                    return;
                }
                await utils_1.sleep(1000);
                const iframe = (_a = document.getElementsByName("myPopupWindow")) === null || _a === void 0 ? void 0 : _a[0];
                if (!iframe) {
                    // will be reload
                    (_b = document.getElementById("C_C_C_ImgBtnNew")) === null || _b === void 0 ? void 0 : _b.click();
                    return;
                }
                const iDocument = (_c = iframe.contentWindow) === null || _c === void 0 ? void 0 : _c.document;
                if (!iDocument) {
                    await utils_1.sleep(1000);
                    runExtraTime();
                    return;
                }
                /**@type {{exitTime: string,date: string}} */
                const item = extraDates.pop();
                chrome.storage.sync.set({
                    extraDates: JSON.stringify(extraDates),
                });
                if (iDocument.getElementById("ctl00_C_rdtpStartTime_dateInput")) {
                    await utils_1.setValue(iDocument, "C_dpDate_txtDate", item.date);
                    await utils_1.setValue(iDocument, "ctl00_C_rdtpStartTime_dateInput", "5:01 PM");
                    await utils_1.setValue(iDocument, "ctl00_C_rdtpEndTime_dateInput", item.exitTime);
                    await utils_1.setValue(iDocument, "C_rdtxtDesc", ".");
                    await utils_1.sleep(300);
                    (_d = iDocument.getElementById("ctl00_C_btnSave")) === null || _d === void 0 ? void 0 : _d.click();
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
        exports.runExtraTime = runExtraTime;
    });
    define("myActivity", ["require", "exports", "utils"], function (require, exports, utils_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.runMyActivity = void 0;
        const runMyActivity = async () => {
            var _a;
            await utils_2.sleep(1000);
            const iframe = (_a = document.getElementsByName("WindowShowDialog")) === null || _a === void 0 ? void 0 : _a[0];
            if (!iframe) {
                await utils_2.sleep(3000);
                runMyActivity();
                return;
            }
            const rwTitleWrapper = document.querySelector(".rwTitleWrapper .rwTitle");
            if (!rwTitleWrapper) {
                await utils_2.sleep(1000);
                runMyActivity();
                return;
            }
            rwTitleWrapper.innerText = "ذخیره اضافه کاری";
            rwTitleWrapper.style.textDecoration = "underline";
            if (rwTitleWrapper) {
                rwTitleWrapper.onclick = async () => {
                    var _a;
                    await utils_2.sleep(300);
                    iframe.focus();
                    await utils_2.sleep(300);
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
                        alert("هیچ اضافه کاره معتبر و قابل ثبتی وجود ندارد.");
                        return;
                    }
                    chrome.storage.sync.set({
                        extraDates: JSON.stringify(result.filter(Boolean)),
                    }, () => {
                        location.href =
                            "http://automation.1st.co.com:8888/Account/RequestExtraWorkList.aspx";
                    });
                };
            }
        };
        exports.runMyActivity = runMyActivity;
    });
    define("index", ["require", "exports", "extraTime", "myActivity"], function (require, exports, extraTime_1, myActivity_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        if (location.href.includes("RequestExtraWorkList")) {
            console.log("RequestExtraWorkList");
            extraTime_1.runExtraTime();
        }
        if (location.href.includes("MyActivity")) {
            console.log("ok");
            myActivity_1.runMyActivity();
        }
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();
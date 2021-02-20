/**
 * @type {Document}
 */
var iDocument;

function sleep(num) {
  return new Promise((resolve) => {
    setTimeout(resolve, num);
  });
}

async function setValue(id, value) {
  await sleep(300);
  iDocument.getElementById(id).focus();
  await sleep(300);
  iDocument.getElementById(id).value = value;
  await sleep(300);
  iDocument.getElementById(id).blur();
}

const runTfs = async () => {
  await sleep(1000);
  var iframe = document.getElementsByName("myPopupWindow")?.[0];
  if (!iframe) {
    document.getElementById("C_C_C_ImgBtnNew")?.click();
    return;
  }
  iDocument = iframe.contentWindow.document;
  chrome.storage.sync.get(
    {
      extraDates: "",
    },

    async function ({ extraDates }) {
      extraDates = JSON.parse(extraDates) || [];
      extraDates = extraDates.filter(Boolean);

      if (extraDates.length <= 0) {
        return;
      }

      /**@type {{exitTime: string,date: string}} */
      const item = extraDates.pop();
      chrome.storage.sync.set(
        {
          extraDates: JSON.stringify(extraDates),
        },
        function () {}
      );

      if (iDocument.getElementById("ctl00_C_rdtpStartTime_dateInput")) {
        await setValue("C_dpDate_txtDate", item.date);
        await setValue("ctl00_C_rdtpStartTime_dateInput", "5:01 PM");
        await setValue("ctl00_C_rdtpEndTime_dateInput", item.exitTime);
        await setValue("C_rdtxtDesc", ".");
        await sleep(300);
        iDocument.getElementById("ctl00_C_btnSave").click();
        setInterval(() => {
          console.log("setInterval");
          var visibility = document.getElementById(
            "RadWindowWrapper_ctl00_ctl00_ctl00_C_C_C_myPopupWindow"
          ).style.visibility;
          console.log({ visibility });
          if (visibility === "hidden") {
            window.location.reload();
          }
        }, 3000);
      }
    }
  );
};

if (location.href.includes("RequestExtraWorkList")) {
  console.log("ok");
  runTfs();
}

const runMyActivity = async () => {
  await sleep(1000);
  var iframe = document.getElementsByName("WindowShowDialog")?.[0];
  console.log(iframe);
  if (!iframe) {
    await sleep(3000);
    runMyActivity();
    return;
  }

  document.querySelector(".rwTitleWrapper").innerHTML =
    '<button type="button" id="______saveButton" >ذخیره اضافه کاری</button>' +
    document.querySelector(".rwTitleWrapper").innerHTML;

  console.log(document.getElementById("______saveButton"));

  document.getElementById("______saveButton").onclick = async () => {
    await sleep(300);

    iframe.focus();
    await sleep(300);

    iDocument = iframe.contentWindow.document;

    // const content = iDocument.querySelectorAll(
    //   "#C_timeSheetTotalView_gridviewReport tr td"
    // )[4].textContent;

    let trs = iDocument.querySelectorAll(
      "#C_timeSheetTotalView_gridviewReport tr"
    );

    const result = [];

    trs.forEach((tr, index) => {
      if (index === 0) {
        return;
      }
      const weekName = tr.querySelectorAll("td")[1].textContent?.trim();
      const isThus = weekName === "پنجشنبه";
      const isFri = weekName === "جمعه";

      if (isThus || isFri) {
        return;
      }

      const textContent = tr.querySelectorAll("td")[4].textContent;
      const date = tr.querySelectorAll("td")[2].textContent;

      let timeArray = textContent.split("و/خ");

      timeArray = timeArray.slice(1).map((v) =>
        v
          .trim()
          .split("-")
          .map((t) => t.trim().replace("پ", "").replace("ش", "").trim())
      );

      const durations = timeArray.map(([startTime, exitTime]) => {
        durationMS =
          new Date(`2020/1/1 ${exitTime}`) - new Date(`2020/1/1 ${startTime}`);

        return durationMS;
      });

      const isValid = durations.every((duration) => Number.isInteger(duration));

      if (isValid) {
        const sum = durations.reduce((prev, cur) => prev + cur, 0) / 3600000;

        if (sum < 9) {
          return;
        }

        const exitTime = timeArray[timeArray.length - 1][1];

        const isAfter =
          new Date(`2020/1/1 ${exitTime}`) - new Date(`2020/1/1 5:30 PM`);

        if (isAfter < 0) {
          return;
        }

        if (exitTime.includes("PM")) {
          result.push({
            exitTime,
            date,
          });
        }
      }
    });

    console.log({ result });

    chrome.storage.sync.set(
      {
        extraDates: JSON.stringify(result.filter(Boolean)),
      },
      function () {}
    );
  };
};

if (location.href.includes("MyActivity")) {
  console.log("ok");
  runMyActivity();
}

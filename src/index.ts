function sleep(num: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, num);
  });
}

async function setValue(doc: Document, id: string, value: string) {
  await sleep(300);
  doc.getElementById(id)?.focus();
  await sleep(300);
  (doc.getElementById(id) || ({} as any)).value = value;
  await sleep(300);
  doc.getElementById(id)?.blur();
}

const runTfs = async () => {
  chrome.storage.sync.get(
    {
      extraDates: "",
    },
    async function ({ extraDates }) {
      extraDates = (extraDates && JSON.parse(extraDates)) || [];
      extraDates = extraDates.filter(Boolean);
      console.log({ extraDates });

      if (extraDates.length <= 0) {
        return;
      }

      await sleep(1000);
      const iframe = document.getElementsByName("myPopupWindow")?.[0] as
        | HTMLIFrameElement
        | undefined;

      if (!iframe) {
        // will be reload
        document.getElementById("C_C_C_ImgBtnNew")?.click();
        return;
      }

      const iDocument = iframe.contentWindow?.document;

      if (!iDocument) {
        await sleep(1000);
        runTfs();
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
        await setValue(
          iDocument,
          "ctl00_C_rdtpEndTime_dateInput",
          item.exitTime,
        );
        await setValue(iDocument, "C_rdtxtDesc", ".");
        await sleep(300);
        iDocument.getElementById("ctl00_C_btnSave")?.click();
        setInterval(() => {
          const visibility = document.getElementById(
            "RadWindowWrapper_ctl00_ctl00_ctl00_C_C_C_myPopupWindow",
          )?.style.visibility;

          if (visibility === "hidden") {
            window.location.reload();
          }
        }, 2000);
      }
    },
  );
};

if (location.href.includes("RequestExtraWorkList")) {
  console.log("RequestExtraWorkList");
  runTfs();
}

const runMyActivity = async () => {
  await sleep(1000);
  const iframe = document.getElementsByName("WindowShowDialog")?.[0] as
    | HTMLIFrameElement
    | undefined;

  if (!iframe) {
    await sleep(3000);
    runMyActivity();
    return;
  }
  const rwTitleWrapper = document.querySelector(".rwTitleWrapper .rwTitle") as
    | HTMLHeadingElement
    | undefined;
  if (!rwTitleWrapper) {
    await sleep(1000);
    runMyActivity();

    return;
  }

  rwTitleWrapper.innerText = "ذخیره اضافه کاری";
  rwTitleWrapper.style.textDecoration = "underline";

  if (rwTitleWrapper) {
    rwTitleWrapper.onclick = async () => {
      await sleep(300);

      iframe.focus();
      await sleep(300);

      const iDocument = iframe.contentWindow?.document;

      if (!iDocument) {
        console.log("WindowShowDialog not found");
        return;
      }

      // const content = iDocument.querySelectorAll(
      //   "#C_timeSheetTotalView_gridviewReport tr td"
      // )[4].textContent;

      const trs = iDocument.querySelectorAll(
        "#C_timeSheetTotalView_gridviewReport tr",
      );

      const result: {
        exitTime: string;
        date: string;
      }[] = [];

      trs.forEach((tr, index) => {
        if (index === 0) {
          return;
        }
        const weekName = tr.querySelectorAll("td")[1].textContent?.trim();
        const textContent = tr.querySelectorAll("td")[4].textContent;
        const date = tr.querySelectorAll("td")[2].textContent;

        const isThus = weekName === "پنجشنبه";
        const isFri = weekName === "جمعه";

        if (isThus || isFri || !textContent || !date) {
          return;
        }

        const timeArray = textContent.split("و/خ") || [];

        const timeEntries = timeArray.slice(1).map((v) =>
          v
            .trim()
            .split("-")
            .map((t) => t.trim().replace("پ", "").replace("ش", "").trim()),
        );

        const durations = timeEntries.map(([startTime, exitTime]) => {
          const durationMS =
            new Date(`2020/1/1 ${exitTime}`).getTime() -
            new Date(`2020/1/1 ${startTime}`).getTime();

          return durationMS;
        });

        const isValid = durations.every((duration) =>
          Number.isInteger(duration),
        );

        if (!isValid) {
          return;
        }

        const sum = durations.reduce((prev, cur) => prev + cur, 0) / 3600000;

        if (sum < 9) {
          return;
        }

        const exitTime = timeArray[timeArray.length - 1][1];

        const isAfter =
          new Date(`2020/1/1 ${exitTime}`).getTime() -
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

      chrome.storage.sync.set(
        {
          extraDates: JSON.stringify(result.filter(Boolean)),
        },
        () => {
          location.href =
            "http://automation.1st.co.com:8888/Account/RequestExtraWorkList.aspx";
        },
      );
    };
  }
};

if (location.href.includes("MyActivity")) {
  console.log("ok");
  runMyActivity();
}

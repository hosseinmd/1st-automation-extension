import { setValue, sleep } from "./utils";

const runExtraTime = async () => {
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
        runExtraTime();
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

export { runExtraTime };

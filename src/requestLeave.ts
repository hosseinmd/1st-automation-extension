import { DelayItem } from "./types";
import { setValue, sleep } from "./utils";

const runRequestLeave = async () => {
  chrome.storage.sync.get(
    {
      delayedDates: "",
    },
    async function ({ delayedDates: _delayedDates }) {
      let delayedDates: DelayItem[] =
        (_delayedDates && JSON.parse(_delayedDates)) || [];
      delayedDates = delayedDates.filter(Boolean);

      console.log({ delayedDates });

      if (delayedDates.length <= 0) {
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
        runRequestLeave();
        return;
      }

      const item = delayedDates.pop() as DelayItem;
      chrome.storage.sync.set({
        delayedDates: JSON.stringify(delayedDates),
      });
      await sleep(1000);
      if (!iDocument.getElementById("ctl00_C_tpEndTime_dateInput")) {
        await sleep(2000);
      }

      if (iDocument.getElementById("ctl00_C_tpEndTime_dateInput")) {
        await setValue(iDocument, "ctl00_C_txtDesc", ".");
        await setValue(iDocument, "C_dpDate_txtDate", item.date);
        await setValue(iDocument, "ctl00_C_tpStartTime_dateInput", "8:30 AM");
        await setValue(
          iDocument,
          "ctl00_C_tpEndTime_dateInput",
          item.startTime,
        );
        await sleep(300);
        iDocument.getElementById("ctl00_C_btnSave")?.click();

        const interval = setInterval(() => {
          const visibility = document.getElementById(
            "RadWindowWrapper_ctl00_ctl00_ctl00_C_C_C_myPopupWindow",
          )?.style.visibility;

          if (visibility === "hidden") {
            if (delayedDates.length <= 0) {
              clearInterval(interval);
              alert("همه موارد ثبت شد.");
            } else {
              window.location.reload();
            }
          }
        }, 2000);
      }
    },
  );
};

export { runRequestLeave };

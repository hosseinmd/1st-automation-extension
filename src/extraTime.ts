import { ExtraItem } from "./types";
import { setValue, sleep } from "./utils";

const runExtraTime = async () => {
  chrome.storage.sync.get(
    {
      extraDates: "",
    },
    async function ({ extraDates: ـextraDates }) {
      const tds: string[] = [];
      let extraDates: ExtraItem[] =
        (ـextraDates && JSON.parse(ـextraDates)) || [];
      extraDates = extraDates.filter(Boolean);

      if (extraDates.length <= 0) {
        return;
      }
      const listOfPageValue = document.getElementById(
        "ctl00_ctl00_ctl00_C_C_C_grdRequest_ctl00_ctl03_ctl01_PageSizeComboBox_Input",
      ) as HTMLInputElement;
      if (listOfPageValue) {
        if (listOfPageValue.value !== "50") {
          const listOfPageAction = document.querySelector(
            ".rcbActionButton",
          ) as HTMLButtonElement;
          if (listOfPageAction) {
            listOfPageAction.click();
            await sleep(500);
            const listOfPageActionList = document.querySelector(".rcbSlide");
            if (listOfPageActionList) {
              const main = listOfPageActionList.querySelector(
                "#ctl00_ctl00_ctl00_C_C_C_grdRequest_ctl00_ctl03_ctl01_PageSizeComboBox_DropDown",
              );
              if (main) {
                const children = main?.querySelector(".rcbScroll");
                if (children) {
                  const ul = children?.querySelector(".rcbList");
                  const li = ul?.querySelectorAll("li");
                  if (li) {
                    li[2].click();
                    await sleep(5000);
                    const getTable = document.getElementById(
                      "ctl00_ctl00_ctl00_C_C_C_grdRequest",
                    );
                    if (getTable) {
                      const table = getTable.querySelector("table");
                      if (table) {
                        const tbody = table.querySelector("tbody");
                        if (tbody) {
                          const trs = tbody.querySelectorAll("tr");
                          if (trs) {
                            trs.forEach((tr) => {
                              const startDate = tr.querySelectorAll("td")[1]
                                ?.textContent;
                              tds.push(String(startDate));
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      await sleep(1000);
      const iframe = document.getElementsByName("myPopupWindow")?.[0] as
        | HTMLIFrameElement
        | undefined;
      const item = extraDates.pop() as ExtraItem;
      chrome.storage.sync.set({
        extraDates: JSON.stringify(extraDates),
      });
      const isSet = tds.includes(item.date);
      if (isSet) {
        return;
      }

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

      await sleep(1000);
      if (!iDocument.getElementById("ctl00_C_rdtpStartTime_dateInput")) {
        await sleep(2000);
      }

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
        const interval = setInterval(() => {
          const visibility = document.getElementById(
            "RadWindowWrapper_ctl00_ctl00_ctl00_C_C_C_myPopupWindow",
          )?.style.visibility;

          if (visibility === "hidden") {
            if (extraDates.length <= 0) {
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

export { runExtraTime };

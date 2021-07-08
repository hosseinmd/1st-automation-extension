import { sleep } from "./utils";

const runMyCardTable = async () => {
  await sleep(1000);
  const timeout = setTimeout(runMyCardTable, 3000);

  const iframe = document.getElementsByClassName("Boxes_nb")?.[0] as
    | HTMLDivElement
    | undefined;

  if (!iframe) {
    return;
  }

  const rwTitleWrapper = document.querySelector(".pagetitle") as
    | HTMLDivElement
    | undefined;
  //   console.log({ rwTitleWrapper });
  if (!rwTitleWrapper) {
    clearTimeout(timeout);
    await sleep(1000);
    runMyCardTable();

    return;
  }

  const addExtra = document.createElement("a");
  addExtra.innerText = "   پذیرش اضافه کاری   ";
  addExtra.style.paddingRight = "10px";

  addExtra.onclick = async () => {
    await sleep(300);

    await sleep(300);

    const iDocument = iframe.querySelector(
      "#ctl00_ctl00_ctl00_C_C_C_grdRequest",
    );
    // console.log({ iDocument });

    if (!iDocument) {
      console.log("WindowShowDialog not found");
      return;
    }

    const trs = iDocument.querySelectorAll(
      "#ctl00_ctl00_ctl00_C_C_C_grdRequest_ctl00 tbody tr",
    );

    while (trs.length > 0) {
      await sleep(1000);
      const tr = trs[0];

      if (!tr) {
        return;
      }
      const td = tr.querySelectorAll("td")[5] as HTMLTableDataCellElement;
      const a = td.querySelector("a");
      a?.click();
      await sleep(1000);

      const _iframe = document.getElementsByName("myPopupWindow")?.[0] as
        | HTMLIFrameElement
        | undefined;

      if (!_iframe) {
        return;
      }

      _iframe.focus();
      await sleep(3000);

      const _iDocument = _iframe.contentWindow?.document;

      _iDocument?.getElementById("ctl00_C_btnAccept")?.click();
      await sleep(3000);
    }
  };

  rwTitleWrapper.innerText = "";
  rwTitleWrapper.appendChild(addExtra);
};

export { runMyCardTable };

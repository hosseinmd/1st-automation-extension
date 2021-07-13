import { sleep } from "./utils";

const runMyActivity = async () => {
  await sleep(1000);
  const timeout = setTimeout(runMyActivity, 3000);

  const iframe = document.getElementsByName("WindowShowDialog")?.[0] as
    | HTMLIFrameElement
    | undefined;

  if (!iframe) {
    return;
  }

  const rwTitleWrapper = document.querySelector(".rwTitleWrapper .rwTitle") as
    | HTMLHeadingElement
    | undefined;
  if (!rwTitleWrapper) {
    clearTimeout(timeout);
    await sleep(1000);
    runMyActivity();

    return;
  }

  const addExtra = document.createElement("a");
  addExtra.innerText = "   ذخیره اضافه کاری   ";
  addExtra.style.paddingRight = "10px";

  addExtra.onclick = addExtraTimes;

  const requestLeave = document.createElement("a");
  requestLeave.innerText = "   درخواست مرخصی   ";
  requestLeave.style.paddingRight = "10px";

  requestLeave.onclick = requestLeaveTime;

  const removeStorage = document.createElement("a");
  removeStorage.innerText = "    پاک کردن کش    ";
  removeStorage.style.paddingRight = "10px";

  removeStorage.onclick = () => {
    chrome.storage.sync.clear();
    alert("کش افزونه خالی گردید.");
  };

  rwTitleWrapper.innerText = "";
  rwTitleWrapper.appendChild(addExtra);
  rwTitleWrapper.appendChild(requestLeave);
  rwTitleWrapper.appendChild(removeStorage);
};

const addExtraTimes = async () => {
  const iframe = document.getElementsByName(
    "WindowShowDialog",
  )?.[0] as HTMLIFrameElement;

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

    const exitTime = timeEntries[timeEntries.length - 1]?.[1];

    const isAfter =
      new Date(`2020/1/1 ${exitTime}`).getTime() -
      new Date(`2020/1/1 5:30 PM`).getTime();

    if (isAfter < 0) {
      return;
    }

    if (exitTime?.includes("PM")) {
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

const requestLeaveTime = async () => {
  const iframe = document.getElementsByName(
    "WindowShowDialog",
  )?.[0] as HTMLIFrameElement;

  await sleep(300);

  iframe.focus();
  await sleep(300);

  const iDocument = iframe.contentWindow?.document;

  if (!iDocument) {
    console.log("WindowShowDialog not found");
    return;
  }

  const trs = iDocument.querySelectorAll(
    "#C_timeSheetTotalView_gridviewReport tr",
  );

  const result: { date: string; startTime: string }[] = [];

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

    const timeMatrix = timeArray.slice(1).map((v) =>
      v
        .trim()
        .split("-")
        .map((t) => t.trim().replace("پ", "").replace("ش", "").trim()),
    );

    const startTime = timeMatrix?.[0]?.[0];

    if (!startTime) {
      return;
    }

    const hasDelay =
      new Date(`2020/1/1 10:30 AM`).getTime() -
      new Date(`2020/1/1 ${startTime}`).getTime();

    if (hasDelay < 0) {
      result.push({ startTime, date });
    }
  });

  if (result.length === 0) {
    alert("هیچ مرخصی برای شما ثبت نشد.");

    return;
  }

  chrome.storage.sync.set(
    {
      delayedDates: JSON.stringify(result.filter(Boolean)),
    },
    () => {
      location.href =
        "http://automation.1st.co.com:8888/Account/RequestLeaveList.aspx";
    },
  );
};

export { runMyActivity };

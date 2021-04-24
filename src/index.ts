import { runExtraTime } from "./extraTime";
import { runMyActivity } from "./myActivity";
import { runMyCardTable } from "./myCardTable";
import { runRequestLeave } from "./requestLeave";

if (location.href.includes("RequestExtraWorkList")) {
  console.log("RequestExtraWorkList");
  runExtraTime();
}

if (location.href.includes("MyActivity")) {
  runMyActivity();
}

if (location.href.includes("MyCardTable")) {
  runMyCardTable();
}

if (location.href.includes("RequestLeaveList")) {
  console.log("RequestLeaveList");
  runRequestLeave();
}

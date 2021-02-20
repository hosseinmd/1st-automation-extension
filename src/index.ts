import { runExtraTime } from "./extraTime";
import { runMyActivity } from "./myActivity";
import { runRequestLeave } from "./requestLeave";

if (location.href.includes("RequestExtraWorkList")) {
  console.log("RequestExtraWorkList");
  runExtraTime();
}

if (location.href.includes("MyActivity")) {
  console.log("MyActivity");
  runMyActivity();
}

if (location.href.includes("RequestLeaveList")) {
  console.log("RequestLeaveList");
  runRequestLeave();
}

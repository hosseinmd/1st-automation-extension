import { runExtraTime } from "./extraTime";
import { runMyActivity } from "./myActivity";

if (location.href.includes("RequestExtraWorkList")) {
  console.log("RequestExtraWorkList");
  runExtraTime();
}

if (location.href.includes("MyActivity")) {
  console.log("ok");
  runMyActivity();
}

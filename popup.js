document.addEventListener(
    "DOMContentLoaded",
    async function() {
        chrome.storage.sync.get({
                username: "",
                password: "",
                url: "",
            },
            async function(item) {
                document.getElementById(
                    "container"
                ).innerHTML = document.getElementById("formSave").innerHTML;
                changeSelectTaskType();

                await main();
            }
        );
    },
    false
);

async function main() {
    var particles = document.getElementById("particles");
    var np = document.documentElement.clientWidth / 29;
    particles.innerHTML = "";
    for (var i = 0; i < np; i++) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var rndw = Math.floor(Math.random() * w) + 1;
        var rndh = Math.floor(Math.random() * h) + 1;
        var widthpt = Math.floor(Math.random() * 8) + 3;
        var opty = Math.floor(Math.random() * 5) + 2;
        var anima = Math.floor(Math.random() * 12) + 8;

        var div = document.createElement("div");
        div.classList.add("particle");
        div.style.marginLeft = rndw + "px";
        div.style.marginTop = rndh + "px";
        div.style.width = widthpt + "px";
        div.style.height = widthpt + "px";
        div.style.background = "white";
        div.style.opacity = opty;
        div.style.animation = "move " + anima + "s ease-in infinite ";
        particles.appendChild(div);
    }

    chrome.runtime.sendMessage({ type: "GetTaskTypes", data: undefined },
        function(response) {
            if (response) {
                if (response.success) {
                    var data = handleResponseFromBackend("GetTaskTypes", response.result);
                } else {
                    console.log(response.result);
                }
            }
        }
    );
}

function handleResponseFromBackend(type, data) {
    resp = "";
    switch (type) {
        case "GetTaskTypes":
            handleGetTaskTypes(data);
            return resp;
        default:
            return resp;
    }
}

function handleGetTaskTypes(data) {
    var option = `<option value="">انتخاب نوع وظیفه</option>`;
    data.forEach(item => {
        option += `<option value="${item.id}">${item.name}</option>`;
    });

    document.getElementById("taskTypesSelected").innerHTML = option;

    chrome.storage.sync.get({
            taskTypeId: "",
        },
        function(item) {
            document.getElementById("taskTypesSelected").value = item.taskTypeId;
        }
    );
}

function changeSelectTaskType() {
    document
        .getElementById("taskTypesSelected")
        .addEventListener("change", function(e) {
            if (e.target.value) {
                chrome.storage.sync.set({
                        taskTypeId: e.target.value,
                    },
                    function() {}
                );
            }
        });
}
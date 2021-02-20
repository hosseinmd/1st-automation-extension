var onMessageListener = function(message, sender, sendResponse) {
    switch (message.type) {
        case "GetTaskTypes":
            GetTaskTypes(sendResponse);
            break;
        case "StartTask":
            CreateTask(message.data, sendResponse);
            break;
        default:
            break;
    }

    return true;
};

function CreateTask(data, sendResponse) {
    try {
        fetch("http://localhost:7253/api/Task/CreateTask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "omit",
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => sendResponse({ success: true, result: data }))
            .catch(error => sendResponse({ success: false, result: error.message }));
    } catch (error) {
        sendResponse({ success: false, result: error.message });
    }
}

function GetTaskTypes(sendResponse) {
    try {
        fetch("http://localhost:7253/api/Task/GetTaskTypes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "omit",
            })
            .then(response => response.json())
            .then(data => sendResponse({ success: true, result: data }))
            .catch(error => sendResponse({ success: false, result: error.message }));
    } catch (error) {
        sendResponse({ success: false, result: error.message });
    }
}

chrome.runtime.onMessage.addListener(onMessageListener);
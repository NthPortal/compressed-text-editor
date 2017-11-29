const settingsModal = $("#settings-modal");
const linkShortenerSetting = $("#settings-link-shortener");
const linkShortenerKey = "paste-setting-link-shortener";
const defaultLinkShortener = null; // Set to an appropriate link shortener URL if desired
var linkShortener = defaultLinkShortener;

const helpModal = $("#help-modal");
const deflateOpts = {to: "string"};
var storeTextToURLTimeout;

/* misc functions */
function saveText() {
    saveAs(blob, "untitled.txt");
    let blob = new Blob([editor.getValue()], {type: "text/plain;charset=utf-8"});
    editor.focus();
}

function showHelp() {
    helpModal[0].style.display = "block";
}

function hideHelp() {
    helpModal[0].style.display = "none";
    editor.focus();
}

function loadSettings() {
    let shortener = window.localStorage.getItem(linkShortenerKey);
    if (shortener === null) {
        shortener = defaultLinkShortener;
    }
    linkShortener = shortener;
    linkShortenerSetting.val(linkShortener);
}

function showSettings() {
    settingsModal[0].style.display = "block";
}

function hideSettings() {
    settingsModal[0].style.display = "none";
    loadSettings();
    editor.focus();
}

function saveSettings() {
    linkShortener = linkShortenerSetting.val().trim();
    window.localStorage.setItem(linkShortenerKey, linkShortener);
    hideSettings();
}

function doUndo() {
    editor.undo();
    editor.focus();
}

function doRedo() {
    editor.redo();
    editor.focus();
}

function clearText() {
    if (editor.getValue() !== "") {
        editor.setValue("");
    } else {
        editor.clearHistory();
        let h = window.location.hash;
        if (h !== "") {
            window.location.hash = "";
        }
    }
    editor.focus();
}

function encodeBase64(s) {
    return btoa(s).replace(/[+\/=]/g, function (c) {
        switch (c) {
            case "+": return "-";
            case "/": return "_";
            case "=": return "~";
        }
    });
}

function decodeBase64(s) {
    return atob(s.replace(/[-_~]/g, function (c) {
        switch (c) {
            case "-": return "+";
            case "_": return "/";
            case "~": return "=";
        }
    }));
}

function loadTextFromURL() {
    let h = window.location.hash;
    if (h !== "" && h !== "#") {
        let loadingToast = null;
        let loadingTimeout = setTimeout(function () {
            loadingToast = toastr.info("Loading text...");
        }, 5);
        try {
            editor.setValue(pako.inflateRaw(decodeBase64(h.slice(1)), deflateOpts));
        } catch (err) {
            console.error(err);
            toastr.error("See console for details", "Error loading text");
        }
        clearTimeout(loadingTimeout);
        if (loadingToast !== null) {
            toastr.clear(loadingToast);
        }
    }
}

function storeTextToURL() {
    let text = editor.getValue();
    if (text !== "") {
        let compressed = pako.deflateRaw(editor.getValue(), deflateOpts);
        window.location.hash = encodeBase64(compressed);
    } else {
        window.location.hash = "";
    }
}

function maybeOpenLinkShortener() {
    if (linkShortener !== null && linkShortener !== "") {
        window.open(linkShortener, "_blank");
    }
}

function copyLink() {
    storeTextToURL();
    if (document.queryCommandSupported("copy")) {
        let textArea = document.createElement("textarea");
        textArea.style.position = "fixed";
        textArea.style.zIndex = -1;
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toastr.success("Copied link to clipboard");
        setTimeout(maybeOpenLinkShortener, 1000);
    } else {
        if (prompt("Copy the URL, then click 'OK'.", window.location.href)) {
            maybeOpenLinkShortener();
        }
    }
    editor.focus();
}

function updateURL() {
    clearTimeout(storeTextToURLTimeout);
    storeTextToURLTimeout = setTimeout(storeTextToURL, 1000);
}

function toggleLightDarkStyle() {
    if (getLightDarkStyle() === styleLight) {
        setStyleDark();
    } else {
        setStyleLight();
    }
    editor.focus();
}

/* handle click events */
$("#copy-link").click(copyLink);
$("#toggle-light-dark").click(toggleLightDarkStyle);
$("#undo").click(doUndo);
$("#redo").click(doRedo);
$("#clear-text").click(clearText);

$("#settings").click(showSettings);
$("#settings-modal-close").click(hideSettings);
$("#settings-save").click(saveSettings);
$("#help").click(showHelp);
$("#help-modal-close").click(hideHelp);

/* store data on editor update */
editor.on("change", updateURL);

/* capture Ctrl+S */
document.addEventListener("keydown", function (event) {
    if ((event.keyCode === 115 || event.keyCode === 83) && (event.ctrlKey || event.metaKey)) {
        saveText();
        event.preventDefault();
        return false;
    } else {
        return true;
    }
});

/* capture dropped file */
document.addEventListener("drop", function (event) {
    event.preventDefault();
    event.stopPropagation();

    let reader = new FileReader();
    reader.onload = function () {
        editor.setValue(reader.result);
    };
    reader.readAsText(event.dataTransfer.files[0]);
});

/* Hide modals when clicking outside of them */
window.onclick = function (event) {
    if (event.target === helpModal[0]) {
        hideHelp();
    } else if (event.target === settingsModal[0]) {
        hideSettings();
    }
};

/* set toastr options */
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "300",
    "timeOut": "5000",
    "extendedTimeOut": "5000",
    "showEasing": "linear",
    "hideEasing": "linear",
    "showMethod": "slideDown",
    "hideMethod": "slideUp"
};

/* load stuff */
loadSettings();
loadTextFromURL();

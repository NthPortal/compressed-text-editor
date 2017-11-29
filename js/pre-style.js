const lightDarkStyleKey = "editor-style";
const styleDark = "dark";
const styleLight = "light";

function getLightDarkStyle() {
    let style = window.localStorage.getItem(lightDarkStyleKey);
    if (style === styleLight) {
        return styleLight;
    } else {
        return styleDark;
    }
}

function deleteOldStyle() {
    let prev = $("#style-link")[0];
    if (prev !== null && prev !== undefined) {
        prev.remove();
    }
}

function setStyleDark() {
    window.localStorage.setItem(lightDarkStyleKey, styleDark);
    deleteOldStyle();
    $("head").append("<link id='style-link' rel='stylesheet' href='css/style-dark.css'>");
}

function setStyleLight() {
    window.localStorage.setItem(lightDarkStyleKey, styleLight);
    deleteOldStyle();
    $("head").append("<link id='style-link' rel='stylesheet' href='css/style-light.css'>");
}

if (getLightDarkStyle() === styleDark) {
    setStyleDark();
} else {
    setStyleLight();
}

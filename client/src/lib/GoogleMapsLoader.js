/* global google */  // <— google değişkeninin global olduğunu ESLint'e bildirir. KOD DEĞİL, YORUMDUR.

let googleLoaded = false;

/**
 * Google Maps API yükler + importLibrary döner
 */
export async function importLibrary(libName) {
    if (!googleLoaded) {
        await loadGoogleMaps();
        googleLoaded = true;
    }
    return google.maps.importLibrary(libName);
}

/**
 * Google Maps scriptini DOM'a ekler
 */
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google) return resolve(); // zaten yüklüyse tekrar yükleme

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=🚨API_KEY🚨&libraries=places`;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

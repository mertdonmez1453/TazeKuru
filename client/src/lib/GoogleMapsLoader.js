import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
    apiKey: "AIzaSyCBBpt9QuOOG7K581Thjrggq7zitrQFmgs", // User needs to replace this
    version: "weekly",
    libraries: ["places"]
});

export { importLibrary };

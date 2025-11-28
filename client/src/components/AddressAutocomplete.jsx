import React, { useEffect, useRef, useState } from 'react';
import { importLibrary } from "../lib/GoogleMapsLoader";

export default function AddressAutocomplete({ onSelect }) {

    const inputRef = useRef(null);
    const [value, setValue] = useState("");

    useEffect(() => {
        let autocomplete;

        const init = async () => {
            const { Autocomplete } = await importLibrary("places");

            autocomplete = new Autocomplete(inputRef.current, {
                componentRestrictions: { country: "tr" },
                fields: ["geometry", "formatted_address"]
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address;

                setValue(address);
                onSelect({ lat, lng, address });
            });
        };

        init();

        return () => autocomplete && window.google.maps.event.clearInstanceListeners(autocomplete);
    }, []);

    return (
        <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Adres yaz..."
            className="p-3 border rounded w-full"
        />
    );
}

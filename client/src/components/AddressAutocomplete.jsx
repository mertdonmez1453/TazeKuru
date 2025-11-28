import React, { useEffect, useRef, useState } from 'react';
import { importLibrary } from '../lib/GoogleMapsLoader';

const AddressAutocomplete = ({ onSelect }) => {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        let autocompleteInstance = null;

        const initAutocomplete = async () => {
            try {
                const { Autocomplete } = await importLibrary("places");

                autocompleteInstance = new Autocomplete(inputRef.current, {
                    types: ['geocode'],
                    componentRestrictions: { country: 'tr' }
                });

                autocompleteInstance.addListener('place_changed', () => {
                    const place = autocompleteInstance.getPlace();
                    if (place.geometry) {
                        const lat = place.geometry.location.lat();
                        const lon = place.geometry.location.lng();
                        const address = place.formatted_address;

                        setInputValue(address);
                        onSelect({ lat, lon, address });
                    }
                });
            } catch (error) {
                console.error("Google Maps Load Error:", error);
            }
        };

        initAutocomplete();

        return () => {
            if (autocompleteInstance) {
                window.google.maps.event.clearInstanceListeners(autocompleteInstance);
            }
        };
    }, [onSelect]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                placeholder="Adresinizi girin..."
                className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
        </div>
    );
};

export default AddressAutocomplete;

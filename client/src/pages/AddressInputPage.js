import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../lib/supabase";

const GOOGLE_MAPS_API_KEY = "AIzaSyCBBpt9QuOOG7K581Thjrggq7zitrQFmgs";

export default function AddressInputPage() {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);
  }, []);

  function initMap() {
    const center = { lat: 41.015137, lng: 28.97953 }; // İstanbul default
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
    });

    markerRef.current = new window.google.maps.Marker({
      map: map,
      draggable: true,
    });

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "tr" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const location = place.geometry.location;
      map.setCenter(location);
      map.setZoom(16);
      markerRef.current.setPosition(location);

      setCoords({ lat: location.lat(), lng: location.lng() });
      setSelectedAddress(place.formatted_address);
    });

    markerRef.current.addListener("dragend", async () => {
      const pos = markerRef.current.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();

      setCoords({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      const res = await geocodeLatLng(geocoder, lat, lng);

      setSelectedAddress(res);
      inputRef.current.value = res;
    });
  }

  function geocodeLatLng(geocoder, lat, lng) {
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results) => {
        if (results[0]) resolve(results[0].formatted_address);
        else resolve("Adres bulunamadı");
      });
    });
  }

const saveAddress = async () => {
  if (!coords || !selectedAddress) {
    alert("Lütfen adres seçin.");
    return;
  }

  // Supabase auth ile giriş yapan kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Kullanıcı bulunamadı, tekrar giriş yapın.");
    navigate("/login");
    return;
  }

  // Backend'e POST ile gönderiyoruz, INT user_id ile
  try {
    const res = await axios.post("http://localhost:8081/api/save-address", {
      user_id: user.user_metadata.user_id, // MySQL INT id (Supabase metadata ile eşleştirilmiş)
      lat: coords.lat,
      lng: coords.lng,
      address: selectedAddress,
    });

    alert(res.data.message);
    navigate("/home");
  } catch (err) {
    console.error(err);
    alert("Adres kaydedilemedi.");
  }
};



  return (
    <div style={{ padding: 20 }}>
      <h2>Adres Seç</h2>

      <input
        ref={inputRef}
        type="text"
        placeholder="Adres yazmaya başla..."
        style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 15 }}
      />

      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px", borderRadius: 10, border: "1px solid #ccc" }}
      />

      <div style={{ marginTop: 15 }}>
        <strong>Seçilen Adres:</strong> {selectedAddress || "—"}
        <br />
        <strong>Koordinatlar:</strong> {coords ? `${coords.lat}, ${coords.lng}` : "—"}
      </div>

      <button
        onClick={saveAddress}
        style={{ marginTop: 20, padding: "10px 20px", fontSize: 16, cursor: "pointer" }}
      >
        Adresi Kaydet
      </button>
    </div>
  );
}

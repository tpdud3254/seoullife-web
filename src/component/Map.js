import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";

const containerStyle = {
    width: "1000px",
    height: "400px",
};
const center = {
    lat: Number(process.env.REACT_APP_LAT),
    lng: Number(process.env.REACT_APP_LNG),
};

function Map() {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        const marker = new window.google.maps.Marker({
            position: center,
        });

        marker.setMap(map);
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);
    return (
        <div>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                ></GoogleMap>
            ) : (
                <></>
            )}
        </div>
    );
}

export default Map;

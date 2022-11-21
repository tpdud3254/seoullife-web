import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import { useIsNotMobile } from "../hooks/mediaQueryHooks";

const center = {
    lat: Number(process.env.REACT_APP_LAT),
    lng: Number(process.env.REACT_APP_LNG),
};

const containerStyle = {
    width: "1000px",
    height: "400px",
};

const mobileContainerStyle = {
    width: "300px",
    height: "400px",
};

function Map() {
    const isNotMobile = useIsNotMobile();
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
                    mapContainerStyle={
                        isNotMobile ? containerStyle : mobileContainerStyle
                    }
                    center={center}
                    zoom={18}
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

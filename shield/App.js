import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import MapboxGl from "@rnmapbox/maps";
import * as turf from "@turf/turf"; // Import turf

MapboxGl.setAccessToken(
  "sk.eyJ1Ijoic2l2YXJhbWFuNyIsImEiOiJjbTBqaXB6c3IwbTRyMmlzYXdhNDE1eXY3In0.zE8Q2Z_e70_nRF_kgvzZUA"
);
MapboxGl.setTelemetryEnabled(false);

const MapScreen = () => {
  // Set default location and safe location
  const [defaultLocation] = useState({
    latitude: 12.963829,
    longitude: 77.505777,
  });
  const [safeLocation] = useState({
    latitude: 12.950706,
    longitude: 77.500332, // Safe location coordinates
  });
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);
  const [route, setRoute] = useState(null); // State to store the route
  const [distance, setDistance] = useState(null); // State to store the distance

  // Function to calculate distance between two locations
  const calculateDistance = () => {
    const from = turf.point([
      defaultLocation.longitude,
      defaultLocation.latitude,
    ]);
    const to = turf.point([
      currentLocation.longitude,
      currentLocation.latitude,
    ]);
    const options = { units: "kilometers" };

    const dist = turf.distance(from, to, options); // Calculate the distance
    setDistance(dist.toFixed(2)); // Set the distance state with 2 decimal places
  };

  // Function to fetch the route using Mapbox Directions API
  const fetchRoute = async () => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${currentLocation.longitude},${currentLocation.latitude};${safeLocation.longitude},${safeLocation.latitude}?geometries=geojson&access_token=sk.eyJ1Ijoic2l2YXJhbWFuNyIsImEiOiJjbTBqaXB6c3IwbTRyMmlzYXdhNDE1eXY3In0.zE8Q2Z_e70_nRF_kgvzZUA`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const routeGeoJSON = data.routes[0].geometry; // Extract the route geometry (GeoJSON)
        setRoute(routeGeoJSON); // Set the route state to the fetched GeoJSON
      } else {
        Alert.alert("Error", "Failed to fetch route");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred: " + error.message);
    }
  };
  // Function to handle the SOS button press
  const handleSOSPress = async () => {
    try {
      const response = await fetch("http://192.168.103.4:5000/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "user123",
          name: "Abhinaya",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Emergency", "An alert sent to the control room.");
        await fetchRoute(); // Fetch route to safe location after sending alert
        calculateDistance(); // Calculate distance after the SOS is sent
      } else {
        Alert.alert("Error", data.message || "Failed to send SOS alert");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Get Safe with Shield</Text>
      </View>

      {/* Map View */}
      <MapboxGl.MapView
        style={styles.map}
        zoomEnabled={true}
        styleURL="mapbox://styles/mapbox/streets-v12"
        rotateEnabled={true}
      >
        <MapboxGl.Camera
          zoomLevel={15}
          centerCoordinate={[
            currentLocation.longitude,
            currentLocation.latitude,
          ]}
          pitch={60}
          animationMode={"flyTo"}
          animationDuration={6000}
        />
        <MapboxGl.PointAnnotation
          id="marker"
          coordinate={[currentLocation.longitude, currentLocation.latitude]}
        >
          <View style={styles.customMarker}>
            <Text style={styles.markerText}>📍</Text>
          </View>
        </MapboxGl.PointAnnotation>

        {/* Draw Route if Available */}
        {route && (
          <MapboxGl.ShapeSource id="routeSource" shape={route}>
            <MapboxGl.LineLayer
              id="routeLayer"
              style={{
                lineColor: "green",
                lineWidth: 5,
              }}
            />
          </MapboxGl.ShapeSource>
        )}
      </MapboxGl.MapView>

      {/* Footer with controls */}
      <View style={styles.footer}>
        {/* Display Distance */}
        {distance && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}></Text>
          </View>
        )}
        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <Text style={styles.sosButtonText}>Emergency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Define the styles using StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
    marginBottom: 0,
  },
  header: {
    marginTop: 40,
    height: 55,
    backgroundColor: "#181C14",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerText: {
    color: "#3E8E41",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ff0000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  markerText: {
    fontSize: 30,
  },
  footer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181C14",
    height: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  distanceContainer: {
    marginBottom: 10,
  },
  distanceText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sosButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ff0000",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sosButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default MapScreen;

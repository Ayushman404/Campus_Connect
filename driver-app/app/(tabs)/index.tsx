import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.130:5000";

const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true
});

export default function HomeScreen() {

  const trackingRef = useRef<any>(null);

  const [status, setStatus] = useState("Connecting...");
  const [coords, setCoords] = useState<any>(null);
  const [timestamp, setTimestamp] = useState("");

  async function startTracking() {

    if (trackingRef.current) return;

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setStatus("Location Permission Denied");
      return;
    }

    setStatus("Sending Location");

    trackingRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0
      },
      (location) => {

        const payload = {
          busId: "BR01PM6850", // Matches Bus 01 in the real schedule
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: new Date().toISOString()
        };

        setCoords({
          lat: payload.lat,
          lng: payload.lng
        });

        setTimestamp(payload.timestamp);

        console.log("Sending:", payload);

        socket.emit("driverLocationUpdate", payload);
      }
    );
  }

  useEffect(() => {
    startTracking();
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Driver Tracking App</Text>

      <Text style={styles.status}>
        Status: {status}
      </Text>

      {coords && (
        <>
          <Text style={styles.coords}>
            Latitude: {coords.lat}
          </Text>

          <Text style={styles.coords}>
            Longitude: {coords.lng}
          </Text>

          <Text style={styles.time}>
            Last Update: {timestamp}
          </Text>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#f4f6f8"
  },

  title: {
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
  },

  status: {
    fontSize:18,
    color:"green",
    marginBottom:15
  },

  coords: {
    fontSize:16,
    marginBottom:5
  },

  time: {
    fontSize:14,
    color:"gray",
    marginTop:10
  }
});
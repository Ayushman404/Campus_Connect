import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.172.3.69:5000";

const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true
});

export default function HomeScreen() {
  const trackingRef = useRef<any>(null);

  const [busId, setBusId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [coords, setCoords] = useState<any>(null);

  async function toggleTracking() {
    if (isTracking) {
      // Stop tracking
      if (trackingRef.current) {
        trackingRef.current.remove();
        trackingRef.current = null;
      }
      setIsTracking(false);
      setStatus("Tracking Stopped");
      return;
    }

    if (!busId.trim()) {
      setStatus("Please enter your Bus Number");
      return;
    }

    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== "granted") {
      setStatus("Location Permission Denied");
      return;
    }

    setIsTracking(true);
    setStatus("Sending Live Location...");

    trackingRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5
      },
      (location) => {
        const payload = {
          busId: busId.trim().toUpperCase(),
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: new Date().toISOString()
        };

        setCoords({ lat: payload.lat, lng: payload.lng });
        socket.emit("driverLocationUpdate", payload);
      }
    );
  }

  // Cleanup to prevent memory leaks if app closes
  useEffect(() => {
    return () => {
      if (trackingRef.current) {
        trackingRef.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transit Telemetry</Text>
      
      {!isTracking && (
        <TextInput 
          style={styles.input}
          placeholder="Enter Bus Number (e.g. BR01PM6850)"
          value={busId}
          onChangeText={setBusId}
          autoCapitalize="characters"
        />
      )}

      <TouchableOpacity 
        style={[styles.button, isTracking ? styles.stopButton : styles.startButton]} 
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>{isTracking ? "Stop Tracking" : "Start Tracking"}</Text>
      </TouchableOpacity>

      <Text style={[styles.status, { color: isTracking ? "green" : "gray" }]}>
        Status: {status}
      </Text>

      {coords && isTracking && (
        <View style={styles.coordsContainer}>
          <Text style={styles.coords}>Lat: {coords.lat.toFixed(5)}</Text>
          <Text style={styles.coords}>Lng: {coords.lng.toFixed(5)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f8", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#ccc" },
  button: { width: "100%", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  startButton: { backgroundColor: "#007BFF" },
  stopButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  status: { fontSize: 16, marginBottom: 15 },
  coordsContainer: { marginTop: 20, alignItems: "center" },
  coords: { fontSize: 16, color: "#555", marginVertical: 2 }
});
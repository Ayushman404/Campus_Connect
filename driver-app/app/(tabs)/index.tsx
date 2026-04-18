import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.172.3.69:5000";

const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true
});

export default function HomeScreen() {
  const trackingRef = useRef<any>(null);

  // Auth/Registration State
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBus, setRegBus] = useState("");
  
  // Bus Selection State
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  // Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [coords, setCoords] = useState<any>(null);

  useEffect(() => {
    loadDriverInfo();
  }, []);

  async function loadDriverInfo() {
    try {
      const savedInfo = await AsyncStorage.getItem("driver_profile");
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setDriverInfo(parsed);
        setIsRegistered(true);
        setSelectedBus(parsed.busNumber);
      }
    } catch (e) {
      console.error("Failed to load driver info", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!regName || !regPhone || !regBus) {
      Alert.alert("Error", "Please fill name, phone, and bus number");
      return;
    }
    const info = { 
        name: regName, 
        phone: regPhone, 
        busNumber: regBus.trim().toUpperCase() 
    };
    await AsyncStorage.setItem("driver_profile", JSON.stringify(info));
    setDriverInfo(info);
    setIsRegistered(true);
    setSelectedBus(info.busNumber);
  }

  async function toggleTracking() {
    if (isTracking) {
      if (trackingRef.current) {
        trackingRef.current.remove();
        trackingRef.current = null;
      }
      setIsTracking(false);
      setStatus("Tracking Stopped");
      return;
    }

    if (!selectedBus) {
      setStatus("Bus number missing");
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
          busId: selectedBus,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          driverName: driverInfo.name,
          driverPhone: driverInfo.phone,
          timestamp: new Date().toISOString()
        };

        setCoords({ lat: payload.lat, lng: payload.lng });
        socket.emit("driverLocationUpdate", payload);
      }
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // 1. REGISTRATION VIEW
  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Driver Registration</Text>
        <TextInput 
          style={styles.input}
          placeholder="Your Full Name"
          value={regName}
          onChangeText={setRegName}
        />
        <TextInput 
          style={styles.input}
          placeholder="Phone Number"
          value={regPhone}
          onChangeText={setRegPhone}
          keyboardType="phone-pad"
        />
        <TextInput 
          style={styles.input}
          placeholder="Bus Number (e.g. BR01PM6850)"
          value={regBus}
          onChangeText={setRegBus}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register & Proceed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. TRACKING VIEW
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transit Telemetry</Text>
      <Text style={styles.userName}>{driverInfo.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={styles.subtitle}>Bus: <Text style={{ fontWeight: 'bold', color: '#007BFF' }}>{selectedBus}</Text></Text>
          {!isTracking && (
              <TouchableOpacity 
                style={{ marginLeft: 10 }}
                onPress={() => {
                    setRegName(driverInfo.name);
                    setRegPhone(driverInfo.phone);
                    setRegBus(driverInfo.busNumber);
                    setIsRegistered(false);
                }}
              >
                <Text style={{ color: '#666', fontSize: 12 }}>(Edit Profile)</Text>
              </TouchableOpacity>
          )}
      </View>

      <TouchableOpacity 
        style={[styles.button, isTracking ? styles.stopButton : styles.startButton]} 
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>{isTracking ? "Stop Tracking" : "Start Tracking"}</Text>
      </TouchableOpacity>

      <Text style={[styles.status, { color: isTracking ? "green" : "gray" }]}>
        Status: {status}
      </Text>

      {isTracking && (
         <View style={styles.coordsContainer}>
          {coords ? (
            <>
              <Text style={styles.coords}>Lat: {coords.lat.toFixed(5)}</Text>
              <Text style={styles.coords}>Lng: {coords.lng.toFixed(5)}</Text>
            </>
          ) : (
            <Text style={styles.coords}>Waiting for GPS...</Text>
          )}
        </View>
      )}

      {!isTracking && (
          <TouchableOpacity 
            style={{ marginTop: 20 }}
            onPress={async () => {
                await AsyncStorage.removeItem("driver_profile");
                setIsRegistered(false);
                setDriverInfo(null);
                setSelectedBus(null);
            }}
          >
            <Text style={{ color: 'red' }}>Logout Completely</Text>
          </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f8", padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  userName: { fontSize: 20, color: "#333", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#ccc" },
  button: { width: "100%", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  startButton: { backgroundColor: "#007BFF" },
  stopButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  status: { fontSize: 16, marginBottom: 15 },
  coordsContainer: { marginTop: 20, alignItems: "center" },
  coords: { fontSize: 16, color: "#555", marginVertical: 2 },
  busItem: { width: '100%', padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  busItemText: { fontSize: 18, fontWeight: '600' }
});
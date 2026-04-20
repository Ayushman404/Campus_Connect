import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import * as Location from "expo-location";
import { io } from "socket.io-client";
import { useRef, useState } from "react";

const socket = io(process.env.EXPO_PUBLIC_API_URL, {
  transports: ["websocket"],
  reconnection: true
});

const BUS_OPTIONS = [
  "BR01PM6850",
  "BR01PM6779",
  "BR01PM6757",
  "BR01PM6782",
  "INST-BUS-01",
  "INST-BUS-02"
];

export default function HomeScreen() {

  const trackingRef = useRef<any>(null);

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [status, setStatus] = useState("Select a bus to begin");
  const [coords, setCoords] = useState<any>(null);
  const [timestamp, setTimestamp] = useState("");

  async function startTracking(busId: string) {
    if (trackingRef.current) {
        // If already tracking another bus, stop it first
        trackingRef.current.remove();
        trackingRef.current = null;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setStatus("Location Permission Denied");
      return;
    }

    setStatus(`Sending Location for ${busId}`);

    trackingRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0
      },
      (location) => {
        const payload = {
          busId: busId,
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

  function handleSelectBus(busId: string) {
    setSelectedBus(busId);
    startTracking(busId);
  }

  function handleStopTracking() {
      if (trackingRef.current) {
          trackingRef.current.remove();
          trackingRef.current = null;
      }
      setSelectedBus(null);
      setCoords(null);
      setTimestamp("");
      setStatus("Select a bus to begin");
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Driver Tracking App</Text>

      {!selectedBus ? (
          <>
            <Text style={styles.subtitle}>Which bus are you driving?</Text>
            <ScrollView style={styles.busList}>
                {BUS_OPTIONS.map((bus) => (
                    <TouchableOpacity 
                        key={bus} 
                        style={styles.busButton}
                        onPress={() => handleSelectBus(bus)}
                    >
                        <Text style={styles.busButtonText}>{bus}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
          </>
      ) : (
          <View style={styles.trackingContainer}>
              <Text style={styles.status}>
                Status: {status}
              </Text>

              {coords && (
                <View style={styles.coordsCard}>
                  <Text style={styles.coordsTitle}>Current coordinates ({selectedBus})</Text>
                  <Text style={styles.coords}>
                    Latitude: {coords.lat.toFixed(6)}
                  </Text>
                  <Text style={styles.coords}>
                    Longitude: {coords.lng.toFixed(6)}
                  </Text>
                  <Text style={styles.time}>
                    Updated: {new Date(timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                  style={styles.stopButton}
                  onPress={handleStopTracking}
              >
                  <Text style={styles.stopButtonText}>Stop Tracking</Text>
              </TouchableOpacity>
          </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#f4f6f8"
  },
  trackingContainer: {
    alignItems: "center",
    width: '100%'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20
  },
  busList: {
      width: '80%',
      maxHeight: 400
  },
  busButton: {
      backgroundColor: "#228b22",
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center"
  },
  busButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16
  },
  status: {
    fontSize: 18,
    color: "green",
    marginBottom: 15,
    fontWeight: "bold"
  },
  coordsCard: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      width: '80%',
      marginBottom: 30
  },
  coordsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333"
  },
  coords: {
    fontSize: 16,
    marginBottom: 5,
    color: "#444"
  },
  time: {
    fontSize: 14,
    color: "gray",
    marginTop: 10
  },
  stopButton: {
      backgroundColor: "#d9534f",
      padding: 15,
      borderRadius: 10,
      width: '80%',
      alignItems: "center"
  },
  stopButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16
  }
});
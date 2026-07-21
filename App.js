import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { EventsProvider } from "./src/context/EventsContext";
import Navigation from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <EventsProvider>
        <StatusBar style="auto" />
        <Navigation />
      </EventsProvider>
    </SafeAreaProvider>
  );
}

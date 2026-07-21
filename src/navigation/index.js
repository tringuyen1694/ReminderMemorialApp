import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ListScreen from "../screens/ListScreen";
import CalendarScreen from "../screens/CalendarScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#111",
          tabBarInactiveTintColor: "#999",
          tabBarIcon: ({ color, size }) => {
            const name = route.name === "Danh sách" ? "list" : "calendar";
            return <Ionicons name={name} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Danh sách" component={ListScreen} />
        <Tab.Screen name="Lịch" component={CalendarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

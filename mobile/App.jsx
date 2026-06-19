import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WebAppScreen } from "@/screens/WebAppScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Campus"
        component={WebAppScreen}
        options={{ title: "CampusNav", headerShown: false }}
      />
      <Tab.Screen name="About" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export { App as default };

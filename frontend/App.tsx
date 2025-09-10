import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import SignUpScreen from './src/screens/SignUp';
import SignInScreen from './src/screens/SignIn';
import HomeScreen from './src/screens/Home';
import AccountScreen from './src/screens/Account';
import AboutScreen from './src/screens/About';
import SplashScreen from './src/Splash';

export type RootParamList = {
  SignUp: undefined;
  SignIn: undefined;
  Home: undefined;
  Splash: undefined;
  Account: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

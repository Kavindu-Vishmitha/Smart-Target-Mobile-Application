import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Image,
  Pressable,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../App";

const { width, height } = Dimensions.get("window");
const logo = require("../assets/img/logo.png");

type SplashNavigation = NativeStackNavigationProp<RootParamList, "Splash">;

export default function SplashScreen({ onAnimationEnd = () => {}}) {

  const navigator = useNavigation<SplashNavigation>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
    ]).start(() => {
      if (onAnimationEnd) onAnimationEnd();
    });
  }, [fadeAnim, scaleAnim, onAnimationEnd]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >

        <Image source={logo} style={styles.appIconImage} />

        <Text style={styles.subText}>
          <Text style={styles.smart}>Smart</Text>{" "}
          <Text style={styles.target}>Target</Text>
        </Text>

        <Text style={styles.subText}>Developed By NEX-K</Text>

        <Pressable
          style={({ pressed }) => [
            styles.getStartedButton,
            { opacity: pressed ? 0.7 : 1 },
          ]} onPress={() => navigator.navigate("Home")}
      
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconContainer: {
    alignItems: "center",
    width: "90%",
  },
  subText: {
    fontSize: width * 0.04,
    color: "#A0A0A0",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 1,
    marginTop: 4,
  },
  smart: {
    fontSize: width * 0.086,
    color: "#ef8d0e",
    fontWeight: "bold",
  },
  target: {
    fontSize: width * 0.086,
    color: "#243f6c",
    fontWeight: "bold",
  },
  appIconImage: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
    marginBottom: 0, 
  },
  getStartedButton: {
    marginTop: height * 0.03,
    backgroundColor: "#ef8d0e",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.08,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  getStartedText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "center",
  },
});

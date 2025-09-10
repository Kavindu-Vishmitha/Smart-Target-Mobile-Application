import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
const logo = require("../../assets/img/logo.png");
const PUBLIC_URL = "https://8d73587b4703.ngrok-free.app";

const isTablet = width >= 768;
const isSmallDevice = width < 375;

interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  profile_image: string;
  created_at: string;
}

type SignInNavigation = NativeStackNavigationProp<RootParamList, "SignIn">;

export default function SignInScreen() {
  const navigator = useNavigation<SignInNavigation>();

  const [getEmail, setEmail] = useState("");
  const [getPassword, setPassword] = useState("");

  const handleSuccessfulLogin = async (userObject: User) => {
    try {
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(userObject));
    } catch (e) {
      console.log('Error saving user data:', e);
    }
    
    setTimeout(() => {
      navigator.navigate('Home');
    }, 2000);
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <StatusBar hidden />
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.appIconImage} />
              <Text style={styles.appName}>
                <Text style={styles.smart}>Smart</Text>{" "}
                <Text style={styles.target}>Target</Text>
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.subText}>Please Sign In your Account</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={setEmail}
                  value={getEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={setPassword}
                  value={getPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.loginButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={async () => {
                    const loginetails = {
                      email: getEmail,
                      password: getPassword,
                    };

                    const dataJSON = JSON.stringify(loginetails);
                    const response = await fetch(PUBLIC_URL + "/Smart_Target/SignIn", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: dataJSON,
                    });

                    if (response.ok) {
                      const responseObject = await response.json();
                      if (responseObject.status) {
                        Toast.show({
                          type: ALERT_TYPE.SUCCESS,
                          title: "Success",
                          textBody: responseObject.message,
                        });
                        handleSuccessfulLogin(responseObject.loggeduser);
                      } else {
                        Toast.show({
                          type: ALERT_TYPE.WARNING,
                          title: "Warning",
                          textBody: responseObject.message,
                        });
                      }
                    }
                  }}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.createAccountButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => navigator.navigate("SignUp")}
                >
                  <Text style={styles.createAccountButtonText}>Create Account</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.05,
  },
  logoContainer: {
    alignItems: "center",
  },
  appIconImage: {
    width: isTablet ? width * 0.2 : isSmallDevice ? width * 0.28 : width * 0.31,
    height: isTablet ? width * 0.2 : isSmallDevice ? width * 0.28 : width * 0.31,
    resizeMode: "contain",
  },
  appName: {
    marginBottom: height * 0.01,
  },
  smart: {
    fontSize: isTablet ? width * 0.05 : isSmallDevice ? width * 0.065 : width * 0.07,
    color: "#ef8d0e",
    fontWeight: "bold",
  },
  target: {
    fontSize: isTablet ? width * 0.05 : isSmallDevice ? width * 0.065 : width * 0.07,
    color: "#243f6c",
    fontWeight: "bold",
  },
  subText: {
    fontSize: isTablet ? width * 0.035 : isSmallDevice ? width * 0.042 : width * 0.045,
    color: "#A0A0A0",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  formContainer: {
    width: isTablet ? "65%" : "85%",
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: isTablet ? width * 0.03 : isSmallDevice ? width * 0.038 : width * 0.04,
    color: "#1a2b4c",
    fontWeight: "500",
    marginBottom: height * 0.008,
    marginLeft: width * 0.02,
  },
  textInput: {
    width: "100%",
    height: isTablet ? height * 0.07 : height * 0.06,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.04,
    fontSize: isTablet ? width * 0.03 : isSmallDevice ? width * 0.038 : width * 0.04,
    color: "#333",
    backgroundColor: "#FAFAFA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    width: "100%",
    marginTop: height * 0.01,
    gap: height * 0.015,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#ef8d0e",
    paddingVertical: height * 0.018,
    borderRadius: width * 0.03,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: isTablet ? width * 0.035 : isSmallDevice ? width * 0.042 : width * 0.045,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  createAccountButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#243f6c",
    paddingVertical: height * 0.016,
    borderRadius: width * 0.03,
  },
  createAccountButtonText: {
    color: "#243f6c",
    fontSize: isTablet ? width * 0.035 : isSmallDevice ? width * 0.042 : width * 0.045,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
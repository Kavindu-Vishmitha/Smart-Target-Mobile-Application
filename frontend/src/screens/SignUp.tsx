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
import * as ImagePicker from "expo-image-picker";
import { ALERT_TYPE, AlertNotificationRoot, Dialog, Toast } from "react-native-alert-notification";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";

const { width, height } = Dimensions.get("window");
const logo = require("../../assets/img/logo.png");
const PUBLIC_URL = "https://8d73587b4703.ngrok-free.app";

const isLandscape = width > height;
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
const isLargeDevice = width >= 414;
const isUltraWide = width >= 1200;

type SignUpNavigation = NativeStackNavigationProp<RootParamList, "SignUp">;

export default function SignUpScreen() {

    const navigator = useNavigation<SignUpNavigation>();

    const [image, setImage] = useState<string | null>(null);
    const [getFullName, setFullName] = useState("");
    const [getuserName, setUserName] = useState("");
    const [getEmail, setEmail] = useState("");
    const [getPassword, setPassword] = useState("");
    const [getConfirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSuccessfulSignUp = () => {

        setFullName('');
        setUserName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setImage(null);

        setTimeout(() => {
            navigator.navigate('SignIn');
        }, 3000);
    };

    return (
        <AlertNotificationRoot>
            <View style={styles.container}>
                <StatusBar hidden />
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "android" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "android" ? 20 : 0}
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
                                <Text style={styles.smart}>Smart</Text> <Text style={styles.target}>Target</Text>
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.subText}>Please create your Account</Text>

                            {/* Profile Image Section */}
                            <View style={styles.profileImageSection}>
                                <Pressable onPress={pickImage} style={styles.profileImageContainer}>
                                    <View style={styles.profileImageBorder} />
                                    <Image
                                        source={image ? { uri: image } : require("../../assets/img/user.png")}
                                        style={styles.profileImage}
                                    />
                                </Pressable>
                                <Text style={styles.profileImageText}>Tap to add photo</Text>
                            </View>

                            {/* Full Name */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#A0A0A0"
                                    onChangeText={setFullName}
                                    value={getFullName}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* User Name */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>User Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your username"
                                    placeholderTextColor="#A0A0A0"
                                    value={getuserName}
                                    onChangeText={setUserName}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Email */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#A0A0A0"
                                    value={getEmail}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Password */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#A0A0A0"
                                        onChangeText={setPassword}
                                        value={getPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                    />
                                    <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                        <Image
                                            source={
                                                showPassword
                                                    ? require("../../assets/img/closed-eye.png")
                                                    : require("../../assets/img/visible.png")
                                            }
                                            style={styles.eyeIconImage}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm your password"
                                        placeholderTextColor="#A0A0A0"
                                        onChangeText={setConfirmPassword}
                                        value={getConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                    />
                                    <Pressable
                                        style={styles.eyeIcon}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Image
                                            source={
                                                showConfirmPassword
                                                    ? require("../../assets/img/closed-eye.png")
                                                    : require("../../assets/img/visible.png")
                                            }
                                            style={styles.eyeIconImage}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                {/* Create Account */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.createAccountButton,
                                        { opacity: pressed ? 0.7 : 1 },
                                    ]}
                                    onPress={async () => {
                                        let formData = new FormData();
                                        formData.append("fullName", getFullName);
                                        formData.append("username", getuserName);
                                        formData.append("email", getEmail);
                                        formData.append("password", getPassword);
                                        formData.append("confirmPassword", getConfirmPassword);

                                        if (image) {
                                            formData.append("profileImage", {
                                                uri: image,
                                                name: "profile.jpg",
                                                type: "image/jpg",
                                            } as any);
                                        }

                                        try {
                                            const response = await fetch(PUBLIC_URL + "/Smart_Target/SignUp", {
                                                method: "POST",
                                                body: formData,
                                            });

                                            const responseObject = await response.json();

                                            if (responseObject.status) {
                                                Toast.show({
                                                    type: ALERT_TYPE.SUCCESS,
                                                    title: "Success",
                                                    textBody: responseObject.message

                                                });
                                                handleSuccessfulSignUp();
                                            } else {
                                                Toast.show({
                                                    type: ALERT_TYPE.WARNING,
                                                    title: "Warning",
                                                    textBody: responseObject.message
                                                });
                                            }
                                        } catch (error) {
                                            Toast.show({
                                                type: ALERT_TYPE.DANGER,
                                                title: "Network Error",
                                                textBody: "Cannot connect to the server. Please check your connection."
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.createAccountButtonText}>Create Account</Text>
                                </Pressable>

                                {/* Login Button with navigation */}
                                <Pressable
                                    style={({ pressed }) => [styles.loginButton, { opacity: pressed ? 0.7 : 1 }]}
                                    onPress={() => navigator.navigate("SignIn")}
                                >
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                {/* bottom bar*/}
                <View style={styles.bottomBar}>
                </View>
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
        width: isUltraWide ? width * 0.15 :
            isLargeTablet ? width * 0.18 :
                isTablet ? width * 0.2 :
                    isSmallDevice ? width * 0.28 :
                        width * 0.31,
        height: isUltraWide ? width * 0.15 :
            isLargeTablet ? width * 0.18 :
                isTablet ? width * 0.2 :
                    isSmallDevice ? width * 0.28 :
                        width * 0.31,
        resizeMode: "contain",
    },
    appName: {
        marginBottom: height * 0.010,
    },
    smart: {
        fontSize: isUltraWide ? width * 0.025 :
            isLargeTablet ? width * 0.035 :
                isTablet ? width * 0.05 :
                    isSmallDevice ? width * 0.065 :
                        width * 0.07,
        color: "#ef8d0e",
        fontWeight: "bold",
    },
    target: {
        fontSize: isUltraWide ? width * 0.025 :
            isLargeTablet ? width * 0.035 :
                isTablet ? width * 0.05 :
                    isSmallDevice ? width * 0.065 :
                        width * 0.07,
        color: "#243f6c",
        fontWeight: "bold",
    },
    subText: {
        fontSize: isUltraWide ? width * 0.02 :
            isLargeTablet ? width * 0.025 :
                isTablet ? width * 0.035 :
                    isSmallDevice ? width * 0.042 :
                        width * 0.045,
        color: "#A0A0A0",
        textAlign: "center",
        fontWeight: "300",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    formContainer: {
        width: isUltraWide ? "45%" :
            isLargeTablet ? "55%" :
                isTablet ? "65%" :
                    "85%",
        alignItems: "center",
    },
    profileImageSection: {
        alignItems: "center",
        marginBottom: height * 0.018,
        width: "100%",
        paddingTop: height * 0.005,
    },
    profileImageContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: isUltraWide ? width * 0.12 :
            isLargeTablet ? width * 0.15 :
                isTablet ? width * 0.18 :
                    width * 0.25,
        height: isUltraWide ? width * 0.12 :
            isLargeTablet ? width * 0.15 :
                isTablet ? width * 0.18 :
                    width * 0.25,
        marginBottom: height * 0.012,
    },
    profileImageBorder: {
        position: "absolute",
        width: isUltraWide ? width * 0.12 :
            isLargeTablet ? width * 0.15 :
                isTablet ? width * 0.18 :
                    width * 0.25,
        height: isUltraWide ? width * 0.12 :
            isLargeTablet ? width * 0.15 :
                isTablet ? width * 0.18 :
                    width * 0.25,
        borderRadius: isUltraWide ? width * 0.06 :
            isLargeTablet ? width * 0.075 :
                isTablet ? width * 0.09 :
                    width * 0.125,
        borderWidth: 3,
        borderColor: "#ef8d0e",
    },
    profileImage: {
        width: isUltraWide ? width * 0.10 :
            isLargeTablet ? width * 0.13 :
                isTablet ? width * 0.16 :
                    width * 0.22,
        height: isUltraWide ? width * 0.10 :
            isLargeTablet ? width * 0.13 :
                isTablet ? width * 0.16 :
                    width * 0.22,
        borderRadius: isUltraWide ? width * 0.05 :
            isLargeTablet ? width * 0.065 :
                isTablet ? width * 0.08 :
                    width * 0.11,
        backgroundColor: "#f3f4f6",
    },
    profileImageText: {
        fontSize: isUltraWide ? width * 0.02 :
            isLargeTablet ? width * 0.025 :
                isTablet ? width * 0.035 :
                    width * 0.035,
        color: "#A0A0A0",
        fontWeight: "500",
        letterSpacing: 0.5,
    },
    inputContainer: {
        width: "100%",
        marginBottom: height * 0.025,
    },
    label: {
        fontSize: isUltraWide ? width * 0.018 :
            isLargeTablet ? width * 0.022 :
                isTablet ? width * 0.03 :
                    isSmallDevice ? width * 0.038 :
                        width * 0.04,
        color: "#1a2b4c",
        fontWeight: "500",
        marginBottom: height * 0.008,
        marginLeft: width * 0.02,
    },
    textInput: {
        width: "100%",
        height: isUltraWide ? height * 0.05 :
            isLargeTablet ? height * 0.06 :
                isTablet ? height * 0.07 :
                    height * 0.06,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: width * 0.03,
        paddingHorizontal: width * 0.04,
        fontSize: isUltraWide ? width * 0.018 :
            isLargeTablet ? width * 0.022 :
                isTablet ? width * 0.03 :
                    isSmallDevice ? width * 0.038 :
                        width * 0.04,
        color: "#333",
        backgroundColor: "#FAFAFA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    passwordContainer: {
        position: "relative",
        width: "100%",
    },
    passwordInput: {
        width: "100%",
        height: isUltraWide ? height * 0.05 :
            isLargeTablet ? height * 0.06 :
                isTablet ? height * 0.07 :
                    height * 0.06,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: width * 0.03,
        paddingHorizontal: width * 0.04,
        paddingRight: width * 0.12,
        fontSize: isUltraWide ? width * 0.018 :
            isLargeTablet ? width * 0.022 :
                isTablet ? width * 0.03 :
                    isSmallDevice ? width * 0.038 :
                        width * 0.04,
        color: "#333",
        backgroundColor: "#FAFAFA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    eyeIcon: {
        position: "absolute",
        right: width * 0.04,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        width: width * 0.08,
        height: isUltraWide ? height * 0.05 :
            isLargeTablet ? height * 0.06 :
                isTablet ? height * 0.07 :
                    height * 0.06,
    },
    eyeIconImage: {
        width: width * 0.05,
        height: width * 0.05,
        tintColor: "#A0A0A0",
    },
    buttonContainer: {
        width: "100%",
        marginTop: height * 0.01,
        gap: height * 0.015,
        marginBottom:10
    },
    createAccountButton: {
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
    createAccountButtonText: {
        color: "#fff",
        fontSize: isUltraWide ? width * 0.02 :
            isLargeTablet ? width * 0.025 :
                isTablet ? width * 0.035 :
                    isSmallDevice ? width * 0.042 :
                        width * 0.045,
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 0.5,
    },
    loginButton: {
        width: "100%",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#243f6c",
        paddingVertical: height * 0.016,
        borderRadius: width * 0.03,
    },
    loginButtonText: {
        color: "#243f6c",
        fontSize: isUltraWide ? width * 0.02 :
            isLargeTablet ? width * 0.025 :
                isTablet ? width * 0.035 :
                    isSmallDevice ? width * 0.042 :
                        width * 0.045,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: 0.5,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.05,
        backgroundColor: '#ffffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#fff',
    },
   
});
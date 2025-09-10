import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    Pressable,
    StatusBar,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation,useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { RootParamList } from "../../App";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
const logo = require("../../assets/img/logo.png");
const PUBLIC_URL = "https://8d73587b4703.ngrok-free.app";

type AccountNavigation = NativeStackNavigationProp<RootParamList, "Account">;

interface User {
    id: number;
    fullname: string;
    username: string;
    email: string;
    profile_image: string;
    created_at: string;
    password?: string;
}

export default function AccountScreen() {
    const navigator = useNavigation<AccountNavigation>();

    const [activeTab, setActiveTab] = useState("Account");
    const [screenData, setScreenData] = useState(Dimensions.get("window"));

    const [getfullName, setFullName] = useState("");
    const [getuserName, setUserName] = useState("");
    const [getemail, setEmail] = useState("");
    const [getpassword, setPassword] = useState("");
    const [getconfirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [image, setImage] = useState<string | null>(null);
    const [getLoggedInUser, setLoggedInUser] = useState<User | null>(null);

    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogType, setDialogType] = useState<"success" | "error" | "warning">("success");

    const showDialog = (message: string, type: "success" | "error" | "warning") => {
        setDialogMessage(message);
        setDialogType(type);
        setShowCustomDialog(true);
    };

    const showErrorDialog = (message: string) => showDialog(message, 'error');
    const showSuccessDialog = (message: string) => showDialog(message, 'success');
    const showWarningDialog = (message: string) => showDialog(message, 'warning');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const fetchLoggedInUser = useCallback(async (): Promise<User | null> => {
        try {
            const response = await fetch(PUBLIC_URL + "/Smart_Target/LoggedUser");
            const data = await response.json();

            if (data.status && data.user) {
                const user: User = data.user;
                setLoggedInUser(user);
                setFullName(user.fullname);
                setUserName(user.username);
                setEmail(user.email);

                if (user.password && user.password.length > 0) {
                    setPassword(user.password);
                    setConfirmPassword(user.password);
                } else {
                    setPassword('');
                    setConfirmPassword('');
                }

                if (data.user.profile_image_base64) {
                    setImage(`data:image/png;base64,${data.user.profile_image_base64}`);
                } else {
                    setImage(require("../../assets/img/user.png"));
                }

                return user;
            } else {
                setUserName('');
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch logged-in user:', error);
            setUserName('Your');
            return null;
        }
    }, []);

    const handleLogout = useCallback(() => {
        showDialog("Are you sure you want to log out?", "warning");
    }, []);

    const confirmLogout = useCallback(async () => {
        try {
            const response = await fetch(`${PUBLIC_URL}/Smart_Target/LogoutUser`);

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();

                if (data.status) {
                    await AsyncStorage.removeItem('user');
                    console.log("User logged out successfully");
                    setShowCustomDialog(false);
                    navigator.replace("SignIn");
                } else {
                    console.error("Logout failed:", data.message);
                    showErrorDialog("Logout failed. Please try again.");
                }
            } else {
                const errorText = await response.text();
                console.error("Server returned non-JSON response:", errorText);
                showErrorDialog("A server error occurred. Please check your server logs for more details.");
            }

        } catch (error) {
            console.error("Server error during logout:", error);
            showErrorDialog("A server error occurred. Please try again later.");
        }
    }, [navigator]);

    useEffect(() => {
        const onChange = ({ window }: { window: typeof screenData }) => {
            setScreenData(window);
        };
        const subscription = Dimensions.addEventListener("change", onChange);
        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        fetchLoggedInUser();
    }, [fetchLoggedInUser]);

    const handleSaveChanges = async () => {
        if (!getLoggedInUser?.id) {
            showErrorDialog("User ID is not available. Please try again.");
            return;
        }

        const formData = new FormData();
        formData.append("id", getLoggedInUser.id.toString());
        formData.append("fullName", getfullName);
        formData.append("username", getuserName);
        formData.append("email", getemail);
        formData.append("password", getpassword);
        formData.append("confirmPassword", getconfirmPassword);

        if (image && image.startsWith('file://')) {
            const filename = image.split('/').pop() || 'profile.jpg';
            const match = /\.(jpg|jpeg|png)$/i.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('profileImage', {
                uri: image,
                name: filename,
                type: type,
            } as any);
        }

        try {
            const response = await fetch(PUBLIC_URL + "/Smart_Target/UpdateAccount", {
                method: "POST",
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseObject = await response.json();

            if (responseObject.status) {
                showSuccessDialog(responseObject.message);
                await fetchLoggedInUser();
            } else {
                showWarningDialog(responseObject.message);
            }
        } catch (error) {
            console.error("Error updating account:", error);
            showErrorDialog("An unexpected error occurred. Please check your connection and try again.");
        }
    };

    const { width, height } = screenData;

    const navItems = [
        { name: "Home", icon: require('../../assets/img/home.png') },
        { name: "Account", icon: require('../../assets/img/account.png') },
        { name: 'About', icon: require('../../assets/img/about.png') },
    ];

    const handleNavPress = async (name: string) => {
        setActiveTab(name);
        if (name === 'Account') {
            const user = await fetchLoggedInUser();
            if (!user) {
                showWarningDialog('Please log in to Smart Target first');
            } else {
                navigator.navigate('Account');
            }
        } else if (name === 'Home') {
            navigator.navigate('Home');
        } else if (name === 'About') {
            navigator.navigate('About');
        }
    };

    const isFocused = useIsFocused();
    
    useEffect(() => {
        if (isFocused) {
            const currentRoute = navigator.getState().routes[navigator.getState().index].name;
            if (currentRoute !== activeTab) {
                setActiveTab(currentRoute);
            }
        }
    }, [isFocused, navigator, activeTab]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#243f6c" />

            {/* Enhanced Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <Image source={logo} style={styles.logo} />
                    </View>
                    <Text style={styles.headerText}>
                        <Text style={styles.smart}>Smart </Text>
                        <Text style={styles.target}>Target</Text>
                    </Text>
                </View>
                <View style={styles.headerAccent} />
            </View>

            <SafeAreaView style={styles.contentAndNavContainer}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "android" ? "padding" : "height"}
                >
                    {/* Fixed "My Account" Card - DOES NOT SCROLL */}
                    <View style={styles.accountInfoCard}>
                        <View style={styles.accountInfoContent}>
                            <Text style={styles.accountNameText}>
                                <Text style={styles.accountNameHighlight}>
                                    {getuserName ? getuserName : "Your"}'s
                                </Text>
                                <Text style={styles.accountNameHighlight}> Account</Text>
                            </Text>
                            <View style={styles.accountActionsContainer}>
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => navigator.navigate("SignUp")}
                                >
                                    <Image
                                        source={require("../../assets/img/add-account.png")}
                                        style={styles.actionIcon}
                                    />
                                    <Text style={styles.actionText}>Add Account</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={handleLogout}
                                >
                                    <Image
                                        source={require("../../assets/img/logout.png")}
                                        style={styles.actionIcon}
                                    />
                                    <Text style={styles.actionText}>Logout</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Main Content - SCROLLABLE */}
                    <View style={styles.mainContent}>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollViewContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.profileFrame}>
                                {/* Profile Image Section */}
                                <View style={styles.profileImageSection}>
                                    <Pressable
                                        onPress={pickImage}
                                        style={[styles.profileImageContainer, {
                                            width: width * 0.28,
                                            height: width * 0.28
                                        }]}
                                    >
                                        <View style={[styles.profileImageBorder, {
                                            width: width * 0.28,
                                            height: width * 0.28,
                                            borderRadius: (width * 0.28) / 2
                                        }]} />
                                        <Image
                                            source={
                                                typeof image === "string"
                                                    ? { uri: image }
                                                    : image || require("../../assets/img/user.png")
                                            }
                                            style={[
                                                styles.profileImage,
                                                {
                                                    width: width * 0.25,
                                                    height: width * 0.25,
                                                    borderRadius: (width * 0.25) / 2,
                                                },
                                            ]}
                                        />
                                    </Pressable>
                                    <Text style={[styles.profileImageText, {
                                        fontSize: width * 0.035,
                                        marginTop: 12
                                    }]}>Tap to change photo</Text>
                                </View>

                                {/* Form Fields */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, {
                                            fontSize: width * 0.04,
                                            marginBottom: 8
                                        }]}>Full Name</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                fontSize: width * 0.045,
                                                minHeight: 52
                                            }]}
                                            placeholder="Enter your full name..."
                                            placeholderTextColor="#9ca3af"
                                            value={getfullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, {
                                            fontSize: width * 0.04,
                                            marginBottom: 8
                                        }]}>User Name</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                fontSize: width * 0.045,
                                                minHeight: 52
                                            }]}
                                            placeholder="Enter username..."
                                            placeholderTextColor="#9ca3af"
                                            value={getuserName}
                                            onChangeText={setUserName}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, {
                                            fontSize: width * 0.04,
                                            marginBottom: 8
                                        }]}>Email</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                fontSize: width * 0.045,
                                                minHeight: 52
                                            }]}
                                            placeholder="Enter your email..."
                                            placeholderTextColor="#9ca3af"
                                            value={getemail}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, {
                                            fontSize: width * 0.04,
                                            marginBottom: 8
                                        }]}>Password</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={[styles.passwordInput, {
                                                    fontSize: width * 0.045,
                                                    minHeight: 52
                                                }]}
                                                placeholder="Enter password..."
                                                placeholderTextColor="#9ca3af"
                                                value={getpassword}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                            />
                                            <Pressable
                                                style={styles.eyeIcon}
                                                onPress={() => setShowPassword(!showPassword)}
                                            >
                                                <Image
                                                    source={
                                                        showPassword ? require("../../assets/img/closed-eye.png") : require("../../assets/img/visible.png")
                                                    }
                                                    style={styles.eyeIconImage}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, {
                                            fontSize: width * 0.04,
                                            marginBottom: 8
                                        }]}>Confirm Password</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={[styles.passwordInput, {
                                                    fontSize: width * 0.045,
                                                    minHeight: 52
                                                }]}
                                                placeholder="Confirm password..."
                                                placeholderTextColor="#9ca3af"
                                                value={getconfirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={!showConfirmPassword}
                                                autoCapitalize="none"
                                            />
                                            <Pressable
                                                style={styles.eyeIcon}
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)
                                                }
                                            >
                                                <Image
                                                    source={
                                                        showConfirmPassword ? require("../../assets/img/closed-eye.png") : require("../../assets/img/visible.png")
                                                    }
                                                    style={styles.eyeIconImage}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>

                                    <Pressable
                                        style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.7 : 1, paddingVertical: 18, marginTop: 8 }]}
                                        onPress={handleSaveChanges}
                                    >
                                        <Text style={[styles.saveButtonText, { fontSize: width * 0.045 }]}>Save Changes</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    {/* Custom Dialog Modal */}
                    <Modal
                        visible={showCustomDialog}
                        transparent={true}
                        animationType="fade"
                    >
                        <View style={styles.customDialogOverlay}>
                            <View style={styles.customDialogContent}>
                                {/* Icon based on dialog type */}
                                <View style={[
                                    styles.dialogIconContainer,
                                    dialogType === 'warning' && styles.warningIconContainer,
                                    dialogType === 'success' && styles.successIconContainer,
                                    dialogType === 'error' && styles.errorIconContainer
                                ]}>
                                    <Text style={styles.dialogIconText}>
                                        {dialogType === 'warning' && '!'}
                                        {dialogType === 'success' && '✓'}
                                        {dialogType === 'error' && '✕'}
                                    </Text>
                                </View>
                                <Text style={styles.customDialogTitle}>
                                    {dialogType === 'warning' && 'Warning'}
                                    {dialogType === 'success' && 'Success'}
                                    {dialogType === 'error' && 'Error'}
                                </Text>
                                <Text style={styles.customDialogText}>{dialogMessage}</Text>

                                {dialogMessage === 'Are you sure you want to log out?' ? (
                                    <View style={styles.dialogButtonsContainer}>
                                        <Pressable
                                            style={[styles.customDialogButton, styles.cancelDeleteButton]}
                                            onPress={() => {
                                                setShowCustomDialog(false);
                                            }}
                                        >
                                            <Text style={styles.customDialogButtonText}>No</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.customDialogButton, styles.deleteConfirmButton]}
                                            onPress={confirmLogout}
                                        >
                                            <Text style={styles.customDialogButtonText}>Yes</Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Pressable
                                        style={[
                                            styles.customDialogButton,
                                            dialogType === 'warning' && styles.warningButton,
                                            dialogType === 'success' && styles.successButton,
                                            dialogType === 'error' && styles.errorButton
                                        ]}
                                        onPress={() => {
                                            setShowCustomDialog(false);
                                        }}
                                    >
                                        <Text style={styles.customDialogButtonText}>Okay</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </Modal>

                    {/* Bottom Navigation */}
                    <View style={[styles.bottomNav, { height: height * 0.08 }]}>
                        <View style={styles.bottomNavAccent} />
                        {navItems.map((item) => (
                            <Pressable key={item.name} style={styles.navItem} onPress={() => handleNavPress(item.name)}>
                                <Image
                                    source={item.icon}
                                    style={[
                                        styles.navIcon,
                                        { tintColor: activeTab === item.name ? "#ef8d0e" : "#9ca3af", width: width * 0.07, height: width * 0.07 }
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.navText,
                                        { fontSize: width * 0.03, marginTop: 4 },
                                        activeTab === item.name && styles.activeNavText
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa"
    },
    contentAndNavContainer: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        backgroundColor: "#243f6c",
        paddingTop: 30,
        paddingBottom: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerAccent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "#ef8d0e",
    },
    logoContainer: {
        backgroundColor: "#ffffff",
        borderRadius: (Dimensions.get("window").width * 0.12) / 2,
        padding: 4,
        marginRight: Dimensions.get("window").width * 0.03,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    logo: {
        width: Dimensions.get("window").width * 0.1,
        height: Dimensions.get("window").width * 0.1,
        resizeMode: "contain",
    },
    headerText: {
        fontSize: Dimensions.get("window").width * 0.08,
        fontWeight: "800",
    },
    smart: { color: "#ef8d0e" },
    target: { color: "#ffffff" },
    accountInfoCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: Dimensions.get("window").width * 0.05,
        marginBottom: 10,
        marginTop: -10,
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    accountInfoContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    accountNameText: {
        fontSize: Dimensions.get("window").width * 0.05,
        fontWeight: "700",
        color: "#1a2b4c",
        flex: 1,
    },
    accountNameHighlight: {
        color: "#1a2b4c",
    },
    accountActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        width: 32,
        height: 32,
        marginBottom: 4,
        tintColor: '#ef8d0e',
    },
    actionText: {
        fontSize: Dimensions.get("window").width * 0.028,
        color: '#1a2b4c',
        fontWeight: '600',
        textAlign: 'center',
    },
    mainContent: { flex: 1 },
    keyboardAvoidingView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 9,
        paddingBottom: 19
    },
    profileFrame: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 24,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb"
    },
    profileImageSection: { alignItems: "center", marginBottom: 20, paddingTop: 5 },
    profileImageContainer: {
        alignItems: "center",
        justifyContent: "center"
    },
    profileImageBorder: {
        position: "absolute",
        borderWidth: 3,
        borderColor: "#ef8d0e"
    },
    profileImage: {
        backgroundColor: "#f3f4f6",
        position: "absolute"
    },
    profileImageText: {
        color: "#6b7280",
        fontWeight: "500"
    },
    formContainer: { gap: 18 },
    inputGroup: { marginBottom: 0 },
    inputLabel: {
        fontWeight: "600",
        color: "#1a2b4c"
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 16,
        color: "#1a2b4c",
        backgroundColor: "#ffffff"
    },
    passwordContainer: { position: "relative", width: "100%" },
    passwordInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 16,
        paddingRight: 50,
        color: "#1a2b4c",
        backgroundColor: "#ffffff",
        width: "100%"
    },
    eyeIcon: {
        position: "absolute",
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        width: 40
    },
    eyeIconImage: { width: 24, height: 24, tintColor: "#6b7280" },
    saveButton: {
        backgroundColor: "#ef8d0e",
        borderRadius: 12,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#ef8d0e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4
    },
    saveButtonText: { color: "#ffffff", fontWeight: "700" },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: Dimensions.get("window").height * 0.08,
        backgroundColor: "#243f6c"
    },
    bottomNavAccent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "#ef8d0e"
    },
    navItem: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12
    },
    navIcon: {
        width: Dimensions.get("window").width * 0.07,
        height: Dimensions.get("window").width * 0.07,
    },
    navText: {
        fontSize: Dimensions.get("window").width * 0.03,
        color: "#9ca3af",
        marginTop: 4,
        fontWeight: "500"
    },
    customDialogOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    customDialogContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
        width: width * 0.8,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    dialogIconContainer: {
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
    },
    warningIconContainer: {
        backgroundColor: '#ffc107',
        borderColor: '#ff9800',
    },
    successIconContainer: {
        backgroundColor: '#4caf50',
        borderColor: '#388e3c',
    },
    errorIconContainer: {
        backgroundColor: '#f44336',
        borderColor: '#d32f2f',
    },
    dialogIconText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 45,
    },
    customDialogTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    customDialogText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    customDialogButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    warningButton: {
        backgroundColor: '#ef8d0e',
    },
    successButton: {
        backgroundColor: '#4caf50',
    },
    errorButton: {
        backgroundColor: '#f44336',
    },
    customDialogButtonText: {
        color: '#ffffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: "center",
    },
    dialogButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 10,
    },
    cancelDeleteButton: {
        backgroundColor: '#285fb3ff',
        flex: 1,
    },
    deleteConfirmButton: {
        backgroundColor: '#ef4444',
        flex: 1,
    },
    activeNavText: { color: "#ef8d0e", fontWeight: "600" }
});
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
    Linking,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";

const { width, height } = Dimensions.get("window");
const logo = require("../../assets/img/logo.png");
const PUBLIC_URL = "https://8d73587b4703.ngrok-free.app";

interface User {
    id: number;
    fullname: string;
    username: string;
    email: string;
    profile_image: string;
    created_at: string;
}

type AboutNavigation = NativeStackNavigationProp<RootParamList, "About">;

export default function AboutScreen(): React.JSX.Element {
    const navigator = useNavigation<AboutNavigation>();

    const [activeTab, setActiveTab] = useState<string>('About');
    const [getuserName, setUserName] = useState<string>('');

    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogType, setDialogType] = useState<"success" | "error" | "warning">("success");

    const showDialog = (message: string, type: "success" | "error" | "warning") => {
        setDialogMessage(message);
        setDialogType(type);
        setShowCustomDialog(true);
    };

    const showWarningDialog = (message: string) => showDialog(message, 'warning');

    const fetchLoggedInUser = useCallback(async (): Promise<User | null> => {
        try {
            const response = await fetch(PUBLIC_URL + "/Smart_Target/LoggedUser");
            const data = await response.json();

            if (data.status && data.user) {
                setUserName(data.user.username);
                return data.user;
            } else {
                setUserName('');
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch logged-in user:', error);
            setUserName('');
            return null;
        }
    }, []);

    useEffect(() => {
        fetchLoggedInUser();
    }, [fetchLoggedInUser]);

    const navItems = [
        { name: 'Home', icon: require('../../assets/img/home.png') },
        { name: 'Account', icon: require('../../assets/img/account.png') },
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

    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
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
                {/* About Info Card */}
                <View style={styles.aboutInfoCard}>
                    <View style={styles.aboutInfoContent}>
                        <Text style={styles.aboutNameText}>
                            <Text style={styles.aboutNameHighlight}>About </Text>
                            <Text style={styles.aboutNameHighlight}>Smart Target</Text>
                        </Text>
                        <View style={styles.aboutIconWrapper}>
                            <Image
                                source={require('../../assets/img/about.png')}
                                style={styles.aboutIcon}
                            />
                        </View>
                    </View>
                    <Text style={styles.aboutSubtitle}>
                        Your personal goal tracking companion
                    </Text>
                </View>

                {/* Main Content */}
                <View style={styles.contentContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* App Description Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Image
                                        source={require('../../assets/img/logo.png')}
                                        style={styles.cardIcon}
                                    />
                                </View>
                                <Text style={styles.cardTitle}>What is Smart Target?</Text>
                            </View>
                            <Text style={styles.cardDescription}>
                                Smart Target is a powerful and intuitive goal-tracking application designed to help you organize, monitor, and achieve your personal and professional objectives. Whether you're a student tracking study goals, a professional managing project deadlines, or someone working on personal development, Smart Target provides the tools you need to stay organized and motivated.
                            </Text>
                        </View>

                        {/* Features Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Text style={styles.featureIcon}>⭐</Text>
                                </View>
                                <Text style={styles.cardTitle}>Key Features</Text>
                            </View>
                            <View style={styles.featuresList}>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Create and organize targets by subject</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Set target dates with calendar integration</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Track completion status with checkboxes</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Add detailed notes and descriptions</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Secure user account management</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Clean and modern user interface</Text>
                                </View>
                            </View>
                        </View>

                        {/* Version Info Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Text style={styles.versionIcon}>ℹ️</Text>
                                </View>
                                <Text style={styles.cardTitle}>App Information</Text>
                            </View>
                            <View style={styles.versionInfo}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Version:</Text>
                                    <Text style={styles.infoValue}>1.0.0</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Release Date:</Text>
                                    <Text style={styles.infoValue}>2025</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Platform:</Text>
                                    <Text style={styles.infoValue}>React Native</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Compatibility:</Text>
                                    <Text style={styles.infoValue}>iOS & Android</Text>
                                </View>
                            </View>
                        </View>

                        {/* Developer Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Text style={styles.developerIcon}>👨‍💻</Text>
                                </View>
                                <Text style={styles.cardTitle}>Developer</Text>
                            </View>
                            <Text style={styles.cardDescription}>
                                Smart Target is developed with passion for helping people achieve their goals. Our focus is on creating user-friendly applications that make productivity and goal-tracking accessible to everyone.
                            </Text>
                        </View>

                        {/* Support Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Text style={styles.supportIcon}>📞</Text>
                                </View>
                                <Text style={styles.cardTitle}>Support & Contact</Text>
                            </View>
                            <Text style={styles.cardDescription}>
                                Have questions, feedback, or need help? We're here to assist you in making the most of Smart Target.
                            </Text>
                            <View style={styles.contactButtons}>
                                <Pressable
                                    style={styles.contactButton}
                                    onPress={() => openLink('mailto:support@smarttarget.com')}
                                >
                                    <Text style={styles.contactButtonText}>📧 Email Support</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.contactButton}
                                    onPress={() => openLink('https://smarttarget.com/help')}
                                >
                                    <Text style={styles.contactButtonText}>🌐 Help Center</Text> 
                                </Pressable>
                            </View>
                        </View>

                        {/* Thank You Message */}
                        <View style={styles.thankYouCard}>
                            <Text style={styles.thankYouTitle}>Thank You for Using Smart Target!</Text>
                            <Text style={styles.thankYouMessage}>
                                Your success is our success. We hope Smart Target helps you achieve all your goals and dreams. Stay motivated and keep tracking your progress!
                            </Text>
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
                        </View>
                    </View>
                </Modal>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <View style={styles.bottomNavAccent} />
                    {navItems.map((item) => (
                        <Pressable
                            key={item.name}
                            style={styles.navItem}
                            onPress={() => handleNavPress(item.name)}
                        >
                            <Image
                                source={item.icon}
                                style={[
                                    styles.navIcon,
                                    { tintColor: activeTab === item.name ? '#ef8d0e' : '#9ca3af' }
                                ]}
                            />
                            <Text style={[
                                styles.navText,
                                activeTab === item.name && styles.activeNavText
                            ]}>
                                {item.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
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
        borderRadius: (width * 0.12) / 2,
        padding: 4,
        marginRight: width * 0.03,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    logo: {
        width: width * 0.1,
        height: width * 0.1,
        resizeMode: "contain",
    },
    headerText: {
        fontSize: width * 0.08,
        fontWeight: "800",
    },
    smart: { color: "#ef8d0e" },
    target: { color: "#ffffff" },
    aboutInfoCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: width * 0.05,
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
    aboutInfoContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    aboutNameText: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#1a2b4c"
    },
    aboutNameHighlight: {
        color: "#1a2b4c",
    },
    aboutIconWrapper: {
        backgroundColor: "#fef3e2",
        borderRadius: 20,
        padding: 8,
        marginLeft: width * 0.03,
    },
    aboutIcon: {
        width: width * 0.06,
        height: width * 0.06,
        tintColor: "#ef8d0e",
    },
    aboutSubtitle: {
        fontSize: width * 0.04,
        color: "#6b7280",
        textAlign: "center",
        fontStyle: "italic",
    },
    contentContainer: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: height * 0.01 + 9,
        paddingTop: 10,
    },
    infoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    cardIconContainer: {
        backgroundColor: "#fef3e2",
        borderRadius: 12,
        padding: 8,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    cardIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    featureIcon: {
        fontSize: 20,
        color: "#ef8d0e",
    },
    versionIcon: {
        fontSize: 20,
    },
    developerIcon: {
        fontSize: 20,
    },
    supportIcon: {
        fontSize: 20,
    },
    cardTitle: {
        fontSize: width * 0.045,
        fontWeight: "700",
        color: "#1a2b4c",
        flex: 1,
    },
    cardDescription: {
        fontSize: width * 0.04,
        color: "#4b5563",
        lineHeight: width * 0.055,
    },
    featuresList: {
        marginTop: 8,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    featureBullet: {
        fontSize: width * 0.05,
        color: "#ef8d0e",
        marginRight: 12,
        fontWeight: "600",
    },
    featureText: {
        fontSize: width * 0.04,
        color: "#4b5563",
        flex: 1,
        lineHeight: width * 0.05,
    },
    versionInfo: {
        marginTop: 8,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    infoLabel: {
        fontSize: width * 0.04,
        color: "#6b7280",
        fontWeight: "500",
    },
    infoValue: {
        fontSize: width * 0.04,
        color: "#1a2b4c",
        fontWeight: "600",
    },
    contactButtons: {
        marginTop: 16,
        gap: 12,
    },
    contactButton: {
        backgroundColor: "#ef8d0e",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    contactButtonText: {
        color: "#ffffff",
        fontSize: width * 0.04,
        fontWeight: "600",
    },
    thankYouCard: {
        backgroundColor: "#fef3e2",
        borderRadius: 16,
        padding: 24,
        borderWidth: 2,
        borderColor: "#ef8d0e",
        alignItems: "center",
    },
    thankYouTitle: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#1a2b4c",
        textAlign: "center",
        marginBottom: 12,
    },
    thankYouMessage: {
        fontSize: width * 0.04,
        color: "#4b5563",
        textAlign: "center",
        lineHeight: width * 0.055,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: height * 0.08,
        backgroundColor: "#243f6c",
    },
    bottomNavAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "#ef8d0e",
    },
    navItem: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    navIcon: {
        width: width * 0.07,
        height: width * 0.07,
    },
    navText: {
        fontSize: width * 0.03,
        color: "#9ca3af",
        marginTop: 4,
        fontWeight: "500",
    },
    activeNavText: {
        color: "#ef8d0e",
        fontWeight: "600",
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
});
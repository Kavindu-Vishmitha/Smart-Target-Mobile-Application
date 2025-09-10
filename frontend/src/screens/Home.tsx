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
    Modal,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_URL = "https://8d73587b4703.ngrok-free.app";

const { width, height } = Dimensions.get("window");
const logo = require("../../assets/img/logo.png");

interface Target {
    id: number;
    subject_name: string;
    target_date: string;
    note: string;
    completed: boolean;
}

interface User {
    id: number;
    fullname: string;
    username: string;
    email: string;
    profile_image: string;
    created_at: string;
}

type HomeNavigation = NativeStackNavigationProp<RootParamList, "Home">;

export default function HomeScreen(): React.JSX.Element {
    
    const navigator = useNavigation<HomeNavigation>();

    const bottomNavHeight = height * 0.08;
    const [activeTab, setActiveTab] = useState<string>('Home');

    const [targets, setTargets] = useState<Target[]>([]);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [getsubjectName, setSubjectName] = useState<string>('');
    const [getnote, setNote] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [getselectedDate, setSelectedDate] = useState<Date | null>(null);

    const [getuserName, setUserName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState<'warning' | 'success' | 'error'>('warning');
    const [activityIndicatorVisible, setActivityIndicatorVisible] = useState(false);
    const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);

    const getDaysInMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const showWarningDialog = (message: string) => {
        setDialogType('warning');
        setDialogMessage(message);
        setShowCustomDialog(true);
    };

    const showSuccessDialog = (message: string) => {
        setDialogType('success');
        setDialogMessage(message);
        setShowCustomDialog(true);
    };

    const showErrorDialog = (message: string) => {
        setDialogType('error');
        setDialogMessage(message);
        setShowCustomDialog(true);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = getselectedDate &&
                getselectedDate.getDate() === day &&
                getselectedDate.getMonth() === currentDate.getMonth() &&
                getselectedDate.getFullYear() === currentDate.getFullYear();
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <Pressable
                    key={day}
                    style={[
                        styles.calendarDay,
                        isSelected && styles.selectedDay,
                        isToday && !isSelected && styles.todayDay
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    <Text style={[
                        styles.calendarDayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayDayText
                    ]}>
                        {day}
                    </Text>
                </Pressable>
            );
        }

        return days;
    };

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
        } else if (name === 'About') {
            navigator.navigate('About');
        }
    };

    const addTarget = async () => {
        const loggedInUser = await fetchLoggedInUser();
        if (!loggedInUser) {
            showWarningDialog('Please log in to Smart Target first');
        } else {
            setShowAddForm(true);
        }
    };
    const resetForm = () => {
        setSubjectName('');
        setSelectedDate(null);
        setNote('');
    };

    const handleDeleteTarget = useCallback(async (id: number) => {
        const loggedInUser = await fetchLoggedInUser();
        if (!loggedInUser) {
            showWarningDialog('Please log in to Smart Target first');
        } else {
            setTargetIdToDelete(id);
            showWarningDialog('Are you sure you want to delete this target?');
        }
    }, [showWarningDialog]);

    const confirmDelete = async () => {
        if (targetIdToDelete === null) return;

        setActivityIndicatorVisible(true);
        setShowCustomDialog(false);

        try {
            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch(PUBLIC_URL + "/Smart_Target/DeleteMyTarget", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ targetId: targetIdToDelete }),
            });

            const responseObject = await response.json();

            if (responseObject.status) {
                setTargets(targets.filter(target => target.id !== targetIdToDelete));
                showSuccessDialog(responseObject.message);
            } else {
                showErrorDialog(responseObject.message);
            }
        } catch (error) {
            console.error("Error deleting target:", error);
            showErrorDialog("Cannot connect to the server. Please check your connection.");
        } finally {
            setActivityIndicatorVisible(false);
            setTargetIdToDelete(null);
        }
    };

    const handleToggleComplete = async (targetId: number) => {
        const loggedInUser = await fetchLoggedInUser();
        if (!loggedInUser) {
            showWarningDialog('Please log in to Smart Target first');
            return;
        }

        setTargets(prevTargets => {
            const updatedTargets = prevTargets.map(target =>
                target.id === targetId ? { ...target, completed: !target.completed } : target
            );
            return updatedTargets;
        });
    };

    useEffect(() => {
        const saveCompletionStatus = async () => {
            if (!getuserName) return;

            try {
                const completedIds = targets.reduce((acc: Record<number, boolean>, target) => {
                    if (target.completed) {
                        acc[target.id] = true;
                    }
                    return acc;
                }, {} as Record<number, boolean>);
                const jsonValue = JSON.stringify(completedIds);
                await AsyncStorage.setItem(`@completedTargets_${getuserName}`, jsonValue);
            } catch (e) {
                console.error('Failed to save completed targets to AsyncStorage:', e);
            }
        };

        if (getuserName) {
            saveCompletionStatus();
        }
    }, [targets, getuserName]);

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

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            const currentRoute = navigator.getState().routes[navigator.getState().index].name;
            if (currentRoute !== activeTab) {
                setActiveTab(currentRoute);
            }
        }
    }, [isFocused, navigator, activeTab]);

    const fetchTargets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(PUBLIC_URL + "/Smart_Target/MyTarget");
            if (!response.ok) {
                const text = await response.text();
                console.error("Server response was not OK:", response.status, text);
                throw new Error('Server returned an error');
            }
            const data = await response.json();

            if (response.ok && Array.isArray(data)) {
                let targetsWithStatus = data.map(target => ({ ...target, completed: false }));

                const loggedInUser = await fetchLoggedInUser();

                if (loggedInUser) {
                    const jsonValue = await AsyncStorage.getItem(`@completedTargets_${loggedInUser.username}`);
                    const completedIds = jsonValue != null ? JSON.parse(jsonValue) : {};

                    targetsWithStatus = targetsWithStatus.map(target => ({
                        ...target,
                        completed: !!completedIds[target.id]
                    }));
                }

                setTargets(targetsWithStatus);
            } else {
                showErrorDialog(data.message || 'Failed to fetch targets.');
                setTargets([]);
            }
        } catch (error) {
            console.error("Error fetching targets:", error);
            showErrorDialog("Cannot connect to the server. Please check your connection.");
            setTargets([]);
        } finally {
            setIsLoading(false);
        }
    }, [fetchLoggedInUser]);

    useEffect(() => {
        fetchTargets();
    }, [fetchTargets]);

    return (
        <AlertNotificationRoot>
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
                    <View style={styles.myTargetCard}>
                        <View style={styles.myTargetContainer}>
                            {getuserName ? (
                                <Text style={styles.myText}>
                                    <Text>{getuserName}'s</Text> Targets
                                </Text>
                            ) : (
                                <Text style={styles.myText}>Your Targets</Text>
                            )}
                            <View style={styles.iconWrapper}>
                                <Image
                                    source={require('../../assets/img/pen.png')}
                                    style={styles.myTargetIcon}
                                />
                            </View>
                        </View>
                        <Text style={styles.motivationText}>
                            Keep going! You're doing great! 🌟
                        </Text>
                    </View>

                    {/* Main Content */}
                    <View style={styles.contentContainer}>
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                                paddingHorizontal: 20,
                                paddingBottom: bottomNavHeight + 40,
                            }}
                            showsVerticalScrollIndicator={false}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#ef8d0e" />
                                    <Text style={styles.loadingText}>Loading targets...</Text>
                                </View>
                            ) : (
                                targets.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <View style={styles.iconCircle}>
                                            <Image
                                                source={require('../../assets/img/book.png')}
                                                style={styles.centerIcon}
                                            />
                                        </View>
                                        <Text style={styles.emptyTitle}>No Targets Yet</Text>
                                        <Text style={styles.emptySubtitle}>
                                            Tap the + button to add your first target
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.targetsContainer}>
                                        {targets.map((target: Target) => (
                                            <View key={target.id} style={styles.targetCard}>
                                                {/* Top Row - Subject Name and Date */}
                                                <View style={styles.targetHeader}>
                                                    <Text style={styles.subjectNameText}>
                                                        {target.subject_name || "General"}
                                                    </Text>
                                                    <View style={styles.dateContainer}>
                                                        <Text style={styles.targetDateText}>
                                                            {target.target_date.split(' 12:00:00 AM')[0] || "No Date"}
                                                        </Text>
                                                        <Pressable
                                                            style={styles.deleteButton}
                                                            onPress={() => handleDeleteTarget(target.id)}
                                                        >
                                                            <Text style={styles.deleteText}>×</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {/* Main Title Row with Checkbox */}
                                                <View style={styles.targetContent}>
                                                    <Pressable
                                                        style={styles.checkbox}
                                                        onPress={() => handleToggleComplete(target.id)}
                                                    >
                                                        {target.completed ? (
                                                            <View style={styles.checkedBox}>
                                                                <Text style={styles.checkmark}>✓</Text>
                                                            </View>
                                                        ) : (
                                                            <View style={styles.uncheckedBox} />
                                                        )}
                                                    </Pressable>
                                                    <Text style={[
                                                        styles.targetText,
                                                        target.completed && styles.completedText
                                                    ]}>
                                                        {target.note}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )
                            )}
                        </ScrollView>

                        {/* Floating Add Button */}
                        <View style={[styles.addButton, { bottom: bottomNavHeight + 20 }]}>
                            <Pressable
                                style={styles.addButtonInner}
                                onPress={addTarget}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Add Target Modal */}
                    <Modal
                        visible={showAddForm}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowAddForm(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {/* Close Button */}
                                <Pressable
                                    style={styles.modalCloseButton}
                                    onPress={() => {
                                        setShowAddForm(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.modalCloseText}>×</Text>
                                </Pressable>

                                <Text style={styles.modalTitle}>Add New Target</Text>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Subject Name */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Subject Name</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter subject name..."
                                            placeholderTextColor="#9ca3af"
                                            value={getsubjectName}
                                            onChangeText={setSubjectName}
                                        />
                                    </View>

                                    {/* Target Date */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Target Date</Text>
                                        <Pressable
                                            style={styles.datePickerButton}
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Text style={[styles.datePickerText, !getselectedDate && styles.placeholderText]}>
                                                {getselectedDate ? formatDate(getselectedDate) : "Select target date"}
                                            </Text>
                                            <Text style={styles.dropdownArrow}>📅</Text>
                                        </Pressable>
                                    </View>

                                    <View style={styles.scheduleFrame}>

                                        {/* Note */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Note</Text>
                                            <TextInput
                                                style={[styles.textInput, styles.noteInput]}
                                                placeholder="Add description or notes..."
                                                placeholderTextColor="#9ca3af"
                                                value={getnote}
                                                onChangeText={setNote}
                                                multiline={true}
                                                numberOfLines={3}
                                            />
                                        </View>
                                    </View>

                                    {/* Modal Buttons */}
                                    <View style={styles.modalButtons}>
                                        <Pressable
                                            style={[styles.modalButton, styles.cancelButton]}
                                            onPress={() => {
                                                setShowDatePicker(false);
                                                setShowAddForm(false);
                                                resetForm();
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.modalButton, styles.saveButton]}
                                            onPress={async () => {
                                                let formData = new FormData();
                                                formData.append("subjectName", getsubjectName);
                                                formData.append("targetDate", formatDate(getselectedDate));
                                                formData.append("note", getnote);

                                                try {
                                                    const response = await fetch(PUBLIC_URL + "/Smart_Target/Home", {
                                                        method: "POST",
                                                        body: formData,
                                                    });
                                                    const responseObject = await response.json();

                                                    if (responseObject.status) {
                                                        resetForm();
                                                        showSuccessDialog(responseObject.message);
                                                        if (responseObject.savedTarget) {
                                                            const newTarget = { ...responseObject.savedTarget, completed: false };
                                                            setTargets(prevTargets => [...prevTargets, newTarget]);
                                                        }
                                                    } else {
                                                        if (responseObject.message === "User is not logged in") {
                                                            showWarningDialog('Please log in to Smart Target first');
                                                            navigator.navigate('SignIn');
                                                        } else {
                                                            showWarningDialog(responseObject.message);
                                                        }
                                                    }
                                                } catch (error) {
                                                    showErrorDialog("Cannot connect to the server. Please check your connection.");
                                                }
                                            }}
                                        >
                                            <Text style={styles.saveButtonText}>Target Confirm</Text>
                                        </Pressable>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>

                        {/* Date Picker Modal - Calendar */}
                        <Modal
                            visible={showDatePicker}
                            transparent={true}
                            animationType="fade"
                        >
                            <View style={styles.pickerOverlay}>
                                <View style={styles.calendarContent}>
                                    <Text style={styles.pickerTitle}>Select Target Date</Text>

                                    {/* Calendar Header */}
                                    <View style={styles.calendarHeader}>
                                        <Pressable
                                            style={styles.calendarNavButton}
                                            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                                        >
                                            <Text style={styles.calendarNavText}>‹</Text>
                                        </Pressable>
                                        <Text style={styles.calendarHeaderText}>
                                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                        </Text>
                                        <Pressable
                                            style={styles.calendarNavButton}
                                            onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                                        >
                                            <Text style={styles.calendarNavText}>›</Text>
                                        </Pressable>
                                    </View>

                                    {/* Days of Week */}
                                    <View style={styles.daysOfWeek}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                            <Text key={day} style={styles.dayOfWeekText}>{day}</Text>
                                        ))}
                                    </View>

                                    {/* Calendar Grid */}
                                    <View style={styles.calendarGrid}>
                                        {renderCalendar()}
                                    </View>

                                    {/* Calendar Buttons */}
                                    <View style={styles.calendarButtons}>
                                        <Pressable
                                            style={styles.calendarCancelButton}
                                            onPress={() => setShowDatePicker(false)}
                                        >
                                            <Text style={styles.calendarCancelText}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.calendarConfirmButton}
                                            onPress={() => {
                                                setShowDatePicker(false);
                                            }}
                                        >
                                            <Text style={styles.calendarConfirmText}>Confirm</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </Modal>

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

                                {/* Conditional Buttons based on the message */}
                                {dialogMessage === 'Are you sure you want to delete this target?' ? (
                                    <View style={styles.dialogButtonsContainer}>
                                        <Pressable
                                            style={[styles.customDialogButton, styles.cancelDeleteButton]}
                                            onPress={() => {
                                                setShowCustomDialog(false);
                                                setTargetIdToDelete(null);
                                            }}
                                        >
                                            <Text style={styles.customDialogButtonText}>No</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.customDialogButton, styles.deleteConfirmButton]}
                                            onPress={confirmDelete}
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
                                            if (dialogMessage === 'Please log in to Smart Target first' || dialogMessage === "Server session expired. Please log in again.") {
                                                navigator.navigate('SignIn');
                                            }
                                        }}
                                    >
                                        <Text style={styles.customDialogButtonText}>Okay</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </Modal>

                    {/* Bottom Navigation - Fixed with About icon */}
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
        </AlertNotificationRoot>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: width * 0.04,
        color: "#6b7280",
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

    myTargetCard: {
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
    welcomeText: {
        fontSize: width * 0.055,
        fontWeight: "bold",
        color: "#1a2b4c",
        textAlign: "center",
        marginBottom: 10,
    },
    myTargetContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    myText: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#1a2b4c"
    },
    iconWrapper: {
        backgroundColor: "#fef3e2",
        borderRadius: 20,
        padding: 8,
        marginLeft: width * 0.03,
    },
    myTargetIcon: {
        width: width * 0.06,
        height: width * 0.06,
    },
    motivationText: {
        fontSize: width * 0.04,
        color: "#6b7280",
        textAlign: "center",
        fontStyle: "italic",
    },
    contentContainer: { flex: 1 },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40,
    },
    iconCircle: {
        backgroundColor: "#ef8d0e",
        borderRadius: 50,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#ef8d0e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    centerIcon: {
        width: width * 0.15,
        height: width * 0.15,
    },
    emptyTitle: {
        fontSize: width * 0.06,
        fontWeight: "700",
        color: "#1a2b4c",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: width * 0.04,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: width * 0.055,
    },
    targetsContainer: {
        paddingTop: 10,
    },
    targetCard: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    targetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    subjectNameText: {
        fontSize: width * 0.05,
        fontWeight: "600",
        color: "#ef8d0e",
        flex: 1,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    targetDateText: {
        fontSize: width * 0.035,
        color: "#6b7280",
        marginRight: 8,
        fontWeight: "500",
    },
    targetContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        marginBottom: 12,
    },
    checkbox: {
        marginRight: 12,
        padding: 4,
    },
    checkedBox: {
        width: 24,
        height: 24,
        backgroundColor: "#10b981",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#10b981",
    },
    uncheckedBox: {
        width: 24,
        height: 24,
        backgroundColor: "#ffffff",
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#d1d5db",
    },
    checkmark: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 16,
    },
    targetText: {
        fontSize: width * 0.045,
        color: "#1a2b4c",
        flex: 1,
        lineHeight: width * 0.06,
    },
    completedText: {
        textDecorationLine: "line-through",
        color: "#9ca3af",
    },
    deleteButton: {
        backgroundColor: "#ef4444",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "bold",
        lineHeight: 14,
    },
    addButton: {
        position: "absolute",
        right: width * 0.07,
        zIndex: 10,
    },
    addButtonInner: {
        backgroundColor: "#ef8d0e",
        width: width * 0.16,
        height: width * 0.16,
        borderRadius: (width * 0.16) / 2,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#ef8d0e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontSize: width * 0.08,
        fontWeight: "300",
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 24,
        paddingTop: 50,
        width: width * 0.9,
        maxWidth: 450,
        maxHeight: height * 0.85,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        position: "relative",
    },
    modalCloseButton: {
        position: "absolute",
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    modalCloseText: {
        fontSize: width * 0.05,
        color: "#6b7280",
        fontWeight: "600",
        lineHeight: width * 0.05,
    },
    modalTitle: {
        fontSize: width * 0.055,
        fontWeight: "700",
        color: "#1a2b4c",
        textAlign: "center",
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: width * 0.04,
        fontWeight: "600",
        color: "#1a2b4c",
        marginBottom: 8,
    },
    scheduleFrame: {
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 16,
        fontSize: width * 0.045,
        color: "#1a2b4c",
        backgroundColor: "#ffffff",
        minHeight: 50,
    },
    noteInput: {
        minHeight: 80,
        maxHeight: 120,
        textAlignVertical: "top",
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    datePickerText: {
        fontSize: width * 0.045,
        color: "#1a2b4c",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    dropdownArrow: {
        fontSize: width * 0.045,
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    calendarContent: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        width: width * 0.9,
        maxWidth: 400,
    },
    pickerTitle: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#1a2b4c",
        textAlign: "center",
        marginBottom: 20,
    },
    calendarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    calendarNavButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
    },
    calendarNavText: {
        fontSize: width * 0.05,
        fontWeight: "600",
        color: "#1a2b4c",
    },
    calendarHeaderText: {
        fontSize: width * 0.045,
        fontWeight: "700",
        color: "#1a2b4c",
    },
    daysOfWeek: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    dayOfWeekText: {
        fontSize: width * 0.035,
        fontWeight: "600",
        color: "#6b7280",
        width: width * 0.1,
        textAlign: "center",
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    emptyDay: {
        width: width * 0.1,
        height: width * 0.1,
    },
    calendarDay: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 5,
    },
    selectedDay: {
        backgroundColor: "#ef8d0e",
    },
    todayDay: {
        backgroundColor: "#e5e7eb",
    },
    calendarDayText: {
        fontSize: width * 0.04,
        color: "#1a2b4c",
        fontWeight: "500",
    },
    selectedDayText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    todayDayText: {
        color: "#1a2b4c",
        fontWeight: "700",
    },
    calendarButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    calendarCancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    calendarConfirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#ef8d0e",
    },
    calendarCancelText: {
        color: "#6b7280",
        fontSize: width * 0.04,
        fontWeight: "600",
        textAlign: "center",
    },
    calendarConfirmText: {
        color: "#ffffff",
        fontSize: width * 0.04,
        fontWeight: "600",
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 10
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    saveButton: {
        backgroundColor: "#ef8d0e",
    },
    cancelButtonText: {
        color: "#6b7280",
        fontSize: width * 0.04,
        fontWeight: "600",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: width * 0.04,
        fontWeight: "600",
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
import React, { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Switch } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Mail } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from '../../firebase';
import { Button as PaperButton } from 'react-native-paper';
import { signOut } from "firebase/auth";
import { sendPasswordResetEmail } from 'firebase/auth';
import { ThemeContext } from "../../theme/ThemeContext";

const SettingsTab = () => {
    
    const navigation = useNavigation();
    const { theme, isDarkTheme, toggleTheme } = useContext(ThemeContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const fetchUserInfo = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "User not found. Please log in again.");
          navigation.navigate('Login');
          return;
        }
  
        setUser(currentUser);
      };
  
      fetchUserInfo();
    }, []);

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigation.navigate('Login');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    const handleChangePassword = async () => {
      if (user && user.email) {
        try {
          await sendPasswordResetEmail(auth, user.email);
          Alert.alert("Password Reset", "Check your email for password reset instructions.");
        } catch (error) {
          Alert.alert("Error", "Unable to send password reset email.");
        }
      }
    };

    return (
        <SafeAreaView style={styles.container}
          backgroundColor={theme.colors.background}
        >

          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

          <TouchableOpacity style={styles.mailIcon} onPress={() => navigation.navigate('Notifications')}>
            <Mail size={40} color={theme.colors.icon} />
          </TouchableOpacity>

          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={[styles.settingOption, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('Notification Settings')}>
              <Text style={styles.settingText}>Notification Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingOption, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('Profile Privacy Settings')}>
              <Text style={styles.settingText}>Profile Privacy Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingOption, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('General Settings')}>
              <Text style={styles.settingText}>General Settings</Text>
            </TouchableOpacity>
          </View>

          <PaperButton
            mode="contained"
            onPress={handleChangePassword}
            style={{ marginVertical: 10 }}
          >
            Change Password
          </PaperButton>

          <PaperButton
            mode="outlined"
            onPress={handleLogout}
            style={{ marginBottom: 20 }}
          >
            Logout
          </PaperButton>

          <View style={styles.switchContainer}>
            <Text style={[styles.settingText, { color: theme.colors.text }]}>Dark Mode</Text>
            <Switch value={isDarkTheme} onValueChange={toggleTheme} style={styles.switch}/>
          </View>

        </SafeAreaView>
    );
};
    
export default SettingsTab;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    mailIcon: {
        position: 'absolute',
        top: 45,
        right: 15,
    },
    settingsContainer: {
        flex: 1,
    },
    settingOption: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: '#000',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20
    }
});
    

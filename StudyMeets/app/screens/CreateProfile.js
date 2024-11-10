import { View, Text, Button, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react'
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from '../../firebase';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MaterialIcons } from '@expo/vector-icons';


const CreateProfile = () => {

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState(null);
    const navigation = useNavigation();
    const currentUser = auth.currentUser;
    const [imageUri, setImageUri] = useState(null);
    const [university, setUniversity] = useState(null);
    const [major, setMajor] = useState(null);
    const [year, setYear] = useState(null);
    const [bio, setBio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [interests, setInterests] = useState([]);
    // const placeholderImage = 'https://via.placeholder.com/80';

    useEffect(() => {
        setUser(currentUser);
    }, [currentUser]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        try {
            const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUsername(userDoc.data()?.username || 'No username found');
              setImageUri(userDoc.data()?.photoURL || 'https://via.placeholder.com/80');
            } else {
              console.log('No user document found!');
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCreateProfile = async () => {
        if (!imageUri || !university || !major || !year || !bio || interests.length === 0) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const storage = getStorage();
            const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
            
            const response = await fetch(imageUri);
            const blob = await response.blob();
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);

            const userRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userRef, {
                createdProfile: true,
                profileImage: downloadURL,
                university,
                major,
                year,
                bio,
                interests,
            });
            
            navigation.navigate('Main');
        } catch (error) {
            console.error("Error Creating Profile: ", error);
            alert('Error creating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addInterest = (interest) => {
        if (interest.trim() && !interests.includes(interest.trim())) {
            setInterests([...interests, interest.trim()]);
        }
    };

    const removeInterest = (index) => {
        setInterests(interests.filter((_, i) => i !== index));
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Create Profile</Text>

                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                    {imageUri ? (
                        <Image 
                            source={{ uri: imageUri }} 
                            style={styles.imagePlaceholder}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="camera-alt" size={65} color="#757575" />
                        </View>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="University"
                    value={university}
                    onChangeText={setUniversity}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Major"
                    value={major}
                    onChangeText={setMajor}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Grad Year"
                    value={year}
                    onChangeText={setYear}
                    keyboardType="numeric"
                />

                <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Bio"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                />

                <View style={styles.interestsContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add interests"
                        onSubmitEditing={(e) => addInterest(e.nativeEvent.text)}
                    />
                    <View style={styles.interestTags}>
                        {interests.map((interest, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.interestTag}
                                onPress={() => removeInterest(index)}
                            >
                                <Text style={styles.interestText}>{interest} ×</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Button 
                    title={loading ? "Creating Profile..." : "Create Profile"} 
                    onPress={handleCreateProfile} 
                    disabled={loading} 
                />
            </View>
        </ScrollView>
    );
};

export default CreateProfile;

const styles = StyleSheet.create({
  scrollContainer: {
      flexGrow: 1,
      backgroundColor: '#007BFF',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#007BFF',
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: '#000000',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderwidth: 5,
    borderColor: '#000000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '##FFC107',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  interestsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestTag: {
    backgroundColor: '#e1e1e1',
    borderRadius: 15,
    padding: 8,
    margin: 4,
  },
  interestText: {
    fontSize: 14,
  },
});
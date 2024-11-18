import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore, auth } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import CreateNewPost from './CreateNewPost';
import { TextInput as PaperTextInput, IconButton } from 'react-native-paper';
import GroupCard from './GroupCard'; // Import the shared component

const Explore = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    const fetchPosts = () => {
      const postsQuery = query(collection(firestore, 'studymeets'), orderBy('CreatedAt', 'desc'));

      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, []);

  const handleJoinGroup = async (postId) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await addDoc(collection(firestore, 'userGroups'), {
          userId: currentUser.uid,
          postId: postId,
        });
        Alert.alert('Joined', 'You have successfully joined the group.');
      } catch (error) {
        console.error('Error joining group:', error);
        Alert.alert('Error', 'Failed to join the group.');
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 10, paddingTop: 30 }}>
      <PaperTextInput
        mode="outlined"
        placeholder="Search study groups..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 10 }}
      />
      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <GroupCard
            item={item}
            onPrimaryAction={handleJoinGroup}
            primaryActionLabel="Join"
          />
        )}
        keyExtractor={(item) => item.id}
      />
      <CreateNewPost visible={isModalVisible} onClose={closeModal} />
    </View>
  );
};

export default Explore;

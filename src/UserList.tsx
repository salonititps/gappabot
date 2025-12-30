import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { gql, NetworkStatus } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    age
    details {
      address
      phone
    }
  }
`;

const GET_USERS = gql`
  query GetUsers($page: Int!, $limit: Int!) {
    getUsers(page: $page, limit: $limit) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const ADD_USER = gql`
  mutation AddUser(
    $name: String!
    $email: String!
    $age: Int!
    $details: DetailsInput!
  ) {
    addUser(name: $name, email: $email, age: $age, details: $details) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $name: String!
    $email: String!
    $age: Int!
    $details: DetailsInput!
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      age: $age
      details: $details
    ) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

const LIMIT = 10;

export default function UserList() {
  const [currentLimit, setCurrentLimit] = useState(LIMIT);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    address: '',
    phone: '',
  });

  const { data, error, fetchMore, networkStatus, refetch } = useQuery(
    GET_USERS,
    {
      variables: { page: 1, limit: currentLimit },
      notifyOnNetworkStatusChange: true,
    },
  );

  const [addUser] = useMutation(ADD_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: { page: 1, limit: LIMIT } },
    ],
    awaitRefetchQueries: true,
    update(cache, { data }) {
      if (!data?.addUser) return;
      cache.modify({
        fields: {
          getUsers(existing = []) {
            const newUser = cache.writeFragment({
              data: data.addUser,
              fragment: USER_FIELDS,
            });
            return [newUser, ...existing];
          },
        },
      });
    },
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: { page: 1, limit: LIMIT } },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: { page: 1, limit: LIMIT } },
    ],
    awaitRefetchQueries: true,
    update(cache, { data }) {
      if (!data?.deleteUser) return;
      cache.modify({
        fields: {
          getUsers(existing = [], { readField }) {
            return existing.filter(
              (user: any) => readField('id', user) !== data?.deleteUser?.id,
            );
          },
        },
      });
    },
  });

  const loadMore = async () => {
    if (networkStatus === NetworkStatus.fetchMore) return;

    setLoadingMore(true);
    const newLimit = currentLimit + LIMIT;

    await fetchMore({
      variables: {
        page: 1,
        limit: newLimit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.getUsers?.length) return prev;
        return fetchMoreResult;
      },
    });

    setCurrentLimit(newLimit);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentLimit(LIMIT);
    await refetch({ page: 1, limit: LIMIT });
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', age: '', address: '', phone: '' });
    setModalVisible(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      age: String(user.age),
      address: user.details?.address || '',
      phone: user.details?.phone || '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', age: '', address: '', phone: '' });
  };

  const handleSubmit = async () => {
    const age = Number(formData.age);
    if (
      !formData.name ||
      !formData.email ||
      !age ||
      !formData.address ||
      !formData.phone
    ) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const details = {
      address: formData.address,
      phone: formData.phone,
    };

    try {
      if (editingUser) {
        await updateUser({
          variables: {
            id: editingUser.id,
            name: formData.name,
            email: formData.email,
            age,
            details,
          },
        });
      } else {
        await addUser({
          variables: {
            name: formData.name,
            email: formData.email,
            age,
            details,
          },
        });
      }
      closeModal();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteUser({ variables: { id } }),
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: any) => (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.info}>Age: {item.age}</Text>
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Details:</Text>
          <Text style={styles.detailsText}>
            📍 {item.details?.address || 'N/A'}
          </Text>
          <Text style={styles.detailsText}>
            📞 {item.details?.phone || 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [],
  );

  if (networkStatus === NetworkStatus.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.getUsers ?? []}
        keyExtractor={(_, item) => item?.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={() => {
          return (
            <View>
              {!refreshing && loadingMore && (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size={'small'} />
                </View>
              )}
            </View>
          );
        }}
        removeClippedSubviews={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Edit User' : 'Add User'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={t => setFormData({ ...formData, name: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={t => setFormData({ ...formData, email: t })}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              keyboardType="numeric"
              value={formData.age}
              onChangeText={t => setFormData({ ...formData, age: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={t => setFormData({ ...formData, address: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              onChangeText={t => setFormData({ ...formData, phone: t })}
              keyboardType="phone-pad"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 4 },
  info: { fontSize: 14, color: '#666', marginBottom: 8 },
  detailsBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  detailsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  detailsText: { fontSize: 13, color: '#444', marginBottom: 3 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  edit: { color: '#007AFF', fontWeight: '600' },
  delete: { color: '#FF3B30', fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300' },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingWrapper: {
    // paddingVertical: moderateHeight(1),
    alignItems: 'center',
  },
});

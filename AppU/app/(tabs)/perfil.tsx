import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Perfil</Text>

            <View style={styles.options}>
                <View style={styles.optionItem}>
                    <View style={styles.optionIcon}></View>
                    <Text style={styles.optionText}>Meus Dados</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
        color: '#111827',
    },
    options: {
        gap: 16
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    optionIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 16
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827'
    },
    logoutButton: {
        marginTop: 20,
        paddingVertical: 16,
        alignItems: 'center'
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600'
    }
});

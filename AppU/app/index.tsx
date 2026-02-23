import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
// @ts-expect-error - expo-router types reference non-existent src paths
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();

    const handleGuestLogin = () => {
        // Navigate to dashboard as guest
        router.replace('/(tabs)/home');
    };

    const handleGoogleLogin = () => {
        // Mock Google Login for now
        alert('Google Login Mock: Logado com sucesso!');
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Bem-vindo</Text>
                    <Text style={styles.subtitle}>Encontre os melhores salões de beleza perto de você.</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                        <Text style={styles.googleButtonText}>Entrar com Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                        <Text style={styles.guestButtonText}>Entrar como Visitante</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        gap: 40,
    },
    header: {
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    googleButton: {
        backgroundColor: '#EA4335',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#EA4335',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    googleButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    guestButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    guestButtonText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '600',
    },
});

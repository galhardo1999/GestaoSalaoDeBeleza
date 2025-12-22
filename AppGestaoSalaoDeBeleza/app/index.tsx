import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { User, Lock, CheckSquare, Square } from 'lucide-react-native';

export default function LoginScreen() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        loadStoredIdentifier();
    }, []);

    const loadStoredIdentifier = async () => {
        try {
            const storedIdentifier = await AsyncStorage.getItem('saved_identifier');
            if (storedIdentifier) {
                setIdentifier(storedIdentifier);
                setRememberMe(true);
            }
        } catch (error) {
            console.log('Error loading identifier:', error);
        }
    };

    const formatIdentifier = (text: string) => {
        // Remove non-numeric characters
        const numeric = text.replace(/\D/g, '');

        // Limit to 14 characters (CNPJ)
        const limited = numeric.slice(0, 14);

        if (limited.length <= 11) {
            // Format as CPF: 000.000.000-00
            return limited
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // Format as CNPJ: 00.000.000/0000-00
            return limited
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
    };

    const handleIdentifierChange = (text: string) => {
        // Just extract numbers to check length logic if user deletes characters
        const clean = text.replace(/\D/g, '');

        // If deleting, we want to allow standard behavior, but here we enforce format
        // A simpler approach is to always re-format the clean number

        setIdentifier(formatIdentifier(clean));
    };

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Replace with your machine's IP address
            const API_URL = 'http://192.168.0.26:3000/api/mobile';

            // Clean non-numeric chars for CNPJ/CPF before sending, assuming DB validation expects numbers
            // or send raw if your DB stores with formatting. 
            // We'll strip for now as common practice.
            const cleanIdentifier = identifier.replace(/\D/g, '');

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cnpj: cleanIdentifier, // Send strictly numeric 
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (rememberMe) {
                    await AsyncStorage.setItem('saved_identifier', identifier);
                } else {
                    await AsyncStorage.removeItem('saved_identifier');
                }

                // Store user data
                await AsyncStorage.setItem('user_data', JSON.stringify(data.user));

                router.replace('/dashboard');
            } else {
                Alert.alert('Erro', data.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha na conexão com o servidor. Verifique se o IP está correto.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Gestão Salão</Text>
                    <Text style={styles.subtitle}>Faça login para continuar</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="CPF ou CNPJ"
                            value={identifier}
                            onChangeText={handleIdentifierChange}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                            maxLength={18}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        {rememberMe ? (
                            <CheckSquare size={20} color="#0EA5E9" />
                        ) : (
                            <Square size={20} color="#666" />
                        )}
                        <Text style={styles.rememberMeText}>Lembrar CPF/CNPJ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: '#F8FAFC',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    rememberMeText: {
        fontSize: 14,
        color: '#64748B',
    },
    button: {
        backgroundColor: '#0F172A',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

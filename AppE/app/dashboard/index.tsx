import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardHome() {
    const [companyName, setCompanyName] = useState('Carregando...');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('user_data');
            const user = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (user?.empresaNome) {
                setCompanyName(user.empresaNome);
            } else {
                setCompanyName('Empresa não encontrada');
            }
        } catch (e) {
            setCompanyName('Erro ao carregar');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo(a)!</Text>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.subtitle}>Selecione uma opção no menu abaixo.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
    companyName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 8,
    }
});

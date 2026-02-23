import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api, { getImageUrl } from '../../src/services/api';
import { ColaboradorCard } from '../../src/components/ColaboradorCard';

interface Servico {
    id: string;
    nome: string;
    preco: string;
    duracaoMin: number;
}

interface Colaborador {
    id: string;
    nome: string;
    foto: string | null;
}

interface EmpresaDetalhes {
    id: string;
    nome: string;
    endereco: string;
    servicos: Servico[];
    colaboradores: Colaborador[];
    banner: string | null;
}

export default function EmpresaDetalhes() {
    const { id } = useLocalSearchParams();
    const [empresa, setEmpresa] = useState<EmpresaDetalhes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEmpresaDetalhes();
        }
    }, [id]);

    const fetchEmpresaDetalhes = async () => {
        try {
            const response = await api.get(`/dashboard?empresaId=${id}`);
            if (response.data.success) {
                const data = response.data.data;
                setEmpresa({
                    ...data,
                    servicos: data.servicos || [],
                    colaboradores: data.colaboradores || []
                });
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes da empresa:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    if (!empresa) {
        return (
            <View style={styles.container}>
                <Text>Empresa não encontrada</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {empresa.banner && getImageUrl(empresa.banner) ? (
                <Image source={{ uri: getImageUrl(empresa.banner)! }} style={styles.banner} />
            ) : (
                <View style={[styles.banner, { backgroundColor: '#E5E7EB' }]} />
            )}

            <View style={styles.content}>
                <Text style={styles.title}>{empresa.nome}</Text>

                <Text style={styles.sectionTitle}>Serviços</Text>
                <View style={styles.section}>
                    {empresa.servicos?.length > 0 ? (
                        empresa.servicos.map(servico => (
                            <View key={servico.id} style={styles.serviceCard}>
                                <View>
                                    <Text style={styles.serviceName}>{servico.nome}</Text>
                                    <Text style={styles.serviceDuration}>{servico.duracaoMin} min</Text>
                                </View>
                                <Text style={styles.servicePrice}>R$ {servico.preco}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Nenhum serviço disponível.</Text>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Profissionais</Text>
                <View style={styles.section}>
                    {empresa.colaboradores?.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {empresa.colaboradores.map(colaborador => (
                                <ColaboradorCard
                                    key={colaborador.id}
                                    nome={colaborador.nome}
                                    foto={colaborador.foto}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={styles.emptyText}>Nenhum profissional disponível.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    banner: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
        color: '#111827',
    },
    section: {
        marginBottom: 24,
    },
    serviceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    serviceDuration: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    horizontalScroll: {
        flexDirection: 'row',
    },
    profCard: {
        alignItems: 'center',
        marginRight: 20,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
        marginBottom: 8,
        overflow: 'hidden'
    },
    profName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    emptyText: {
        color: '#9CA3AF',
        fontStyle: 'italic'
    }
});

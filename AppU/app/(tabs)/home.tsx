import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import api, { getImageUrl } from '../../src/services/api';

interface Empresa {
    id: string;
    nome: string;
    enderecoCompleto: string;
    logo: string | null;
    banner: string | null;
    latitude: number | null;
    longitude: number | null;
    distancia?: string;
}

interface UserLocation {
    latitude: number;
    longitude: number;
}

// Haversine formula to calculate distance between two coordinates
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function formatarDistancia(distanciaKm: number): string {
    if (distanciaKm < 1) {
        return `${Math.round(distanciaKm * 1000)}m`;
    } else {
        return `${distanciaKm.toFixed(1)}km`;
    }
}

export default function Dashboard() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const router = useRouter();

    useEffect(() => {
        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchEmpresas();
        }
    }, [userLocation]);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            } else {
                // If permission denied, still fetch empresas but without distance
                fetchEmpresas();
            }
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            fetchEmpresas();
        }
    };

    const fetchEmpresas = async () => {
        try {
            const response = await api.get('/empresas');
            if (response.data.success) {
                let empresasList: Empresa[] = response.data.data;

                // Calculate distance if we have user location
                if (userLocation) {
                    empresasList = empresasList.map(empresa => {
                        if (empresa.latitude && empresa.longitude) {
                            const distanciaKm = calcularDistancia(
                                userLocation.latitude,
                                userLocation.longitude,
                                empresa.latitude,
                                empresa.longitude
                            );
                            return {
                                ...empresa,
                                distancia: formatarDistancia(distanciaKm)
                            };
                        }
                        return empresa;
                    });

                    // Sort by distance (closest first)
                    empresasList.sort((a, b) => {
                        if (!a.distancia) return 1;
                        if (!b.distancia) return -1;
                        const distA = parseFloat(a.distancia.replace('km', '').replace('m', '')) * (a.distancia.includes('km') ? 1000 : 1);
                        const distB = parseFloat(b.distancia.replace('km', '').replace('m', '')) * (b.distancia.includes('km') ? 1000 : 1);
                        return distA - distB;
                    });
                }

                setEmpresas(empresasList);
            }
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderEmpresa = ({ item }: { item: Empresa }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/empresa/${item.id}`)}
        >
            <View style={styles.logoContainer}>
                {item.logo && getImageUrl(item.logo) ? (
                    <Image source={{ uri: getImageUrl(item.logo)! }} style={styles.logo} />
                ) : (
                    <View style={[styles.logo, styles.logoPlaceholder]}>
                        <Text style={styles.placeholderText}>{item.nome.charAt(0)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemAddress} numberOfLines={2}>{item.enderecoCompleto}</Text>
            </View>

            <View style={styles.distanceContainer}>
                {item.distancia ? (
                    <Text style={styles.distanceText}>{item.distancia}</Text>
                ) : (
                    <Text style={styles.arrow}>{'>'}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorar</Text>
                <Text style={styles.headerSubtitle}>Salões próximos a você</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000000" />
                </View>
            ) : (
                <FlatList
                    data={empresas}
                    renderItem={renderEmpresa}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 16
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    logoContainer: {
        marginRight: 16,
    },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f3f4f6'
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E7EB',
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9CA3AF'
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    itemAddress: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    distanceContainer: {
        paddingLeft: 8,
        alignItems: 'flex-end',
        minWidth: 50,
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981', // Green color for distance
    },
    arrow: {
        fontSize: 20,
        color: '#D1D5DB',
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 88,
    }
});

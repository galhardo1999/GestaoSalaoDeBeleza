
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

type Appointment = {
    id: string;
    service: string;
    date: string;
    time: string;
    status: string;
    client: string;
    professional: string;
};

export default function AppointmentsScreen() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const jsonValue = await AsyncStorage.getItem('user_data');
            const token = await AsyncStorage.getItem('mobile_token');
            const user = jsonValue != null ? JSON.parse(jsonValue) : null;

            if (!user?.empresaId || !token) {
                setLoading(false);
                return;
            }

            const dateStr = formatDateForApi(selectedDate);
            const API_URL = 'http://192.168.0.26:3000/api/mobile';
            const response = await fetch(`${API_URL}/agendamentos?date=${dateStr}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setAppointments(data.data);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.log(error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const renderHeader = () => (
        <View style={styles.dateHeader}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.iconButton}>
                <ChevronLeft size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.dateDisplay}>
                <Calendar size={20} color="#64748B" style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{formatDateForDisplay(selectedDate)}</Text>
            </View>

            <TouchableOpacity onPress={() => changeDate(1)} style={styles.iconButton}>
                <ChevronRight size={24} color="#0F172A" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            {loading ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color="#0F172A" />
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={fetchAppointments}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.serviceName}>{item.service}</Text>
                                <Text style={[styles.status,
                                item.status === 'CONCLUIDO' ? styles.statusConfirmed :
                                    item.status === 'PENDENTE' ? styles.statusPending :
                                        item.status === 'AGENDADO' ? styles.statusScheduled : styles.statusScheduled
                                ]}>{item.status}</Text>
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={styles.clientName}>{item.client}</Text>
                                <Text style={styles.professionalName}>Prof: {item.professional}</Text>
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.dateTime}>{item.time}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Nenhum agendamento para esta data.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    iconButton: {
        padding: 8,
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardBody: {
        marginBottom: 8,
    },
    clientName: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    professionalName: {
        fontSize: 12,
        color: '#64748B',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusConfirmed: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
    },
    statusPending: {
        backgroundColor: '#FEF9C3',
        color: '#854D0E',
    },
    statusScheduled: {
        backgroundColor: '#E0F2FE',
        color: '#075985',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTime: {
        fontSize: 14,
        color: '#64748B',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94A3B8',
        marginTop: 32,
    },
});

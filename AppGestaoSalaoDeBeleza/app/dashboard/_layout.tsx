import { Tabs, router } from 'expo-router';
import { Home, Calendar, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function DashboardLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#0F172A',
            tabBarInactiveTintColor: '#64748B',
            headerRight: () => (
                <TouchableOpacity onPress={() => router.replace('/')} style={{ marginRight: 16 }}>
                    <LogOut size={24} color="#EF4444" />
                </TouchableOpacity>
            ),
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    headerTitle: 'Painel Inicial'
                }}
            />
            <Tabs.Screen
                name="agendamentos"
                options={{
                    title: 'Agendamentos',
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
                    headerTitle: 'Meus Agendamentos'
                }}
            />
        </Tabs >
    );
}

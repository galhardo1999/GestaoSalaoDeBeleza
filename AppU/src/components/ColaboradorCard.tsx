import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getImageUrl } from '../services/api';

interface ColaboradorCardProps {
    nome: string;
    foto: string | null;
}

export function ColaboradorCard({ nome, foto }: ColaboradorCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {foto ? (
                    <Image source={{ uri: getImageUrl(foto)! }} style={styles.image} />
                ) : (
                    <View style={[styles.image, { backgroundColor: '#E5E7EB' }]} />
                )}
            </View>
            <Text style={styles.name}>{nome}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
        textAlign: 'center',
    }
});

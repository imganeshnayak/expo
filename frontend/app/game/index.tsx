import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GameMap from '../../components/game/GameMap';
import CatchModal from '../../components/game/CatchModal';
import { Spawn, UserCollection } from '../../types/game';
import { gameService } from '../../services/gameService';
import { useUserStore } from '../../store/userStore';
import { ArrowLeft, Backpack, Map as MapIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function GameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();

    const [selectedSpawn, setSelectedSpawn] = useState<Spawn | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isCatching, setIsCatching] = useState(false);
    const [catchResult, setCatchResult] = useState<'success' | 'failed' | null>(null);

    const [collectionCount, setCollectionCount] = useState(0);

    // Initial Rank Check
    useEffect(() => {
        // Mock check? Or strict. Use 'Silver II' logic from userStore if available.
        // Assuming MVP access for now to test.
        loadCollectionStats();
    }, []);

    const loadCollectionStats = async () => {
        const collection = await gameService.getMyCollection();
        setCollectionCount(collection.length);
    };

    const handleSpawnPress = (spawn: Spawn) => {
        setSelectedSpawn(spawn);
        setCatchResult(null);
        setModalVisible(true);
    };

    const handleCatch = async () => {
        if (!selectedSpawn) return;

        setIsCatching(true);

        // Simulate tension delay
        setTimeout(async () => {
            const result = await gameService.catchUtopian(
                selectedSpawn.id,
                selectedSpawn.archetype._id,
                selectedSpawn.location
            );

            setIsCatching(false);

            if (result.success) {
                setCatchResult('success');
                // Don't close immediately, let them celebrate
                loadCollectionStats();
            } else {
                setCatchResult('failed');
                Alert.alert('Escaped!', result.message);
                setModalVisible(false);
            }
        }, 1500);
    };

    const closeAndClear = () => {
        setModalVisible(false);
        setSelectedSpawn(null);
        setCatchResult(null);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <GameMap onSpawnPress={handleSpawnPress} />

            {/* UI Overlay - Top */}
            <View style={[styles.topBar, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <BlurView intensity={50} tint="dark" style={styles.blur}>
                        <ArrowLeft color="#fff" size={24} />
                    </BlurView>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <BlurView intensity={50} tint="dark" style={styles.blur}>
                        <Text style={styles.title}>UTOPIA COLLECT</Text>
                    </BlurView>
                </View>

                <TouchableOpacity style={styles.iconButton}>
                    <BlurView intensity={50} tint="dark" style={styles.blur}>
                        <MapIcon color="#fff" size={24} />
                    </BlurView>
                </TouchableOpacity>
            </View>

            {/* UI Overlay - Bottom (Inventory) */}
            <View style={[styles.bottomBar, { bottom: insets.bottom + 20 }]}>
                <TouchableOpacity onPress={() => router.push('/game/collection')} style={styles.inventoryButton}>
                    <BlurView intensity={80} tint="dark" style={styles.inventoryBlur}>
                        <Backpack color="#FFD700" size={32} />
                        <Text style={styles.inventoryText}>{collectionCount} Caught</Text>
                    </BlurView>
                </TouchableOpacity>
            </View>

            <CatchModal
                visible={modalVisible}
                spawn={selectedSpawn}
                onClose={closeAndClear}
                onCatch={handleCatch}
                catchResult={catchResult}
                isCatching={isCatching}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    titleContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    title: {
        color: '#fff',
        fontWeight: '900',
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        letterSpacing: 2,
    },
    blur: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    bottomBar: {
        position: 'absolute',
        alignSelf: 'center',
    },
    inventoryButton: {
        borderRadius: 30,
        overflow: 'hidden',
        width: 160,
        height: 60,
    },
    inventoryBlur: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    inventoryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Vibration,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Send,
    Mic,
    Sparkles,
    Gift,
    Tag,
    Zap,
    Heart,
    ChevronDown,
    Globe,
    ArrowLeft,
    MapPin,
    Coffee,
    Star,
    Gamepad2,
    Trophy,
    ShoppingBag,
    Check,
    X,
    Smile,
    PartyPopper,
    Volume2,
} from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';

const { width } = Dimensions.get('window');

// Fun personality responses
const PERSONALITIES = {
    greeting: [
        "Hey bestie! 👋 I'm Utopia, your personal deal-hunting sidekick! Ready to save some serious cash today? 💸",
        "Yooo! 🎉 What's good? I've been stalking deals all day so you don't have to. Let's get you some steals!",
        "Welcome to the deal zone! 🔥 I'm basically a bloodhound for discounts. What are we hunting today?",
    ],
    deals: [
        "Ooh ooh! 👀 Found some fire deals:\n\n☕ **Mukka Treats** - 30% off Coffee\n   (Your caffeine addiction approves)\n\n🍕 **Pizza Paradise** - Buy 1 Get 1\n   (Math says that's 50% off, big brain time)\n\nWant me to yeet these into your deals list?",
        "Hold up! 🚨 Just spotted these bad boys:\n\n🍨 **Ice Cream Heaven** - 40% off\n   (Perfect for your 'treat yourself' moment)\n\n🎬 **MovieMax** - 2 tickets for ₹199\n   (Date night secured? 👀)\n\nClaim them before someone else does!",
    ],
    claim: [
        "BOOM! 💥 Deal claimed!\n\n🎫 Your code: UTOPIA-X7K9\n⏰ Valid until tonight\n\nGo flash this at the store and watch the cashier's face when you save money like a pro! 😎",
        "✅ Gotchu fam!\n\nYour deal is locked and loaded. Show this message at the counter and prepare to feel like a money-saving genius! 🧠💰",
    ],
    game: [
        "Ooh, you wanna play? 🎮\n\n🏆 **Arena** - Battle for XP\n🎯 **Missions** - Daily challenges\n🎁 **Spin the Wheel** - Win prizes\n\nYour current XP: 2,450\nRank: Silver Saver 🥈\n\nLet's gooo!",
        "Game time! 🕹️\n\nYou're currently crushing it with:\n• 12-day streak 🔥\n• Top 15% in your city\n• 3 missions available\n\nWanna flex on the leaderboard?",
    ],
    mood: {
        happy: "I can feel the good vibes! 🌟 Since you're in a great mood, might I suggest some celebratory deals? Nothing says 'life is good' like 50% off dessert!",
        hungry: "Fellow hungry human detected! 🍔 Let me find you some food deals ASAP. Hangry is not a personality we want!",
        bored: "Boredom? In MY city? 😤 Let's fix that! Check out these experience deals - escape rooms, movies, arcade games. Adventure awaits!",
        broke: "Ah, the end-of-month vibes. 💸 I gotchu! Here are some FREE deals and loyalty rewards you've earned. Being broke is temporary, being smart is forever!",
    },
    jokes: [
        "Why did the deal go to therapy?\n\nBecause it had too many strings attached! 😂\n\n...Okay I'll stick to finding deals.",
        "Knock knock!\nWho's there?\nDiscount!\nDiscount who?\nDISCOUNT on missing these deals! 🤣\n\n...I tried.",
        "What's a deal hunter's favorite exercise?\n\nRunning... to the store before offers expire! 🏃‍♂️\n\nAlright, enough jokes. Back to saving money!",
    ],
    compliment: [
        "Has anyone told you that you have excellent taste in apps? Because WOW. 💅",
        "Fun fact: People who use Utopia are statistically 100% cooler. Science said so. Probably. 😎",
        "You know what? You're doing amazing sweetie. And so are your savings! 📈",
    ],
    confused: [
        "Hmm, I'm not quite sure what you mean! 🤔\n\nBut here's what I CAN help with:\n• 🏷️ Finding deals near you\n• 🎮 Games & challenges\n• 💝 Gifting deals to friends\n• 🎯 Tracking your missions\n\nTry asking about any of these!",
    ],
    nearby: [
        "Scanning your area... 📡\n\n🔥 **Hot deals near you:**\n\n📍 200m - Cafe Mocha (25% off)\n📍 500m - Spa Bliss (Buy 1 Get 1)\n📍 800m - Tech Store (Extra 10% today)\n\nThese won't last long! The early bird gets the discount worm! 🐛",
    ],
    xp: [
        "Let's talk XP, baby! 📊\n\n🏆 Your stats:\n• Total XP: 2,450\n• This week: +340\n• Streak: 12 days 🔥\n• Rank: Silver Saver\n\nKeep claiming deals and you'll be Gold in no time! Only 550 XP to go! 💪",
    ],
    squad: [
        "Squad goals! 👯‍♂️\n\nYour squad 'Money Savers' has:\n• 5 active members\n• Weekly savings: ₹8,450\n• Rank: #12 in your city\n\nInvite more friends to climb the leaderboard! More friends = more fun = more deals! 🎉",
    ],
};

interface Message { id: string; text: string; isBot: boolean; timestamp: Date; }

export default function UtopiaAIScreen() {
    const theme = useAppTheme();
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const STYLES = getStyles(theme);

    useEffect(() => { startAnimations(); }, []);

    const startAnimations = () => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.15, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(floatAnim, { toValue: -20, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 20, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.2, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();
        Animated.loop(Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -5, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])).start();
    };

    const openChat = () => {
        setShowChat(true);
        setTimeout(() => {
            const greeting = PERSONALITIES.greeting[Math.floor(Math.random() * PERSONALITIES.greeting.length)];
            addBotMessage(greeting);
        }, 500);
    };

    const addBotMessage = (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text, isBot: true, timestamp: new Date() }]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const speakText = (text: string) => {
        // Speech not available - vibrate as feedback instead
        Vibration.vibrate(50);
    };

    const generateFunResponse = (input: string): string => {
        const lower = input.toLowerCase();

        if (lower.includes('deal') || lower.includes('offer') || lower.includes('discount') || lower.includes('save')) {
            return PERSONALITIES.deals[Math.floor(Math.random() * PERSONALITIES.deals.length)];
        }
        if (lower.includes('claim') || lower.includes('yes') || lower.includes('get') || lower.includes('want') || lower.includes('yeet')) {
            return PERSONALITIES.claim[Math.floor(Math.random() * PERSONALITIES.claim.length)];
        }
        if (lower.includes('game') || lower.includes('play') || lower.includes('arena') || lower.includes('mission') || lower.includes('challenge')) {
            return PERSONALITIES.game[Math.floor(Math.random() * PERSONALITIES.game.length)];
        }
        if (lower.includes('near') || lower.includes('around') || lower.includes('close') || lower.includes('location') || lower.includes('nearby')) {
            return PERSONALITIES.nearby[0];
        }
        if (lower.includes('xp') || lower.includes('points') || lower.includes('level') || lower.includes('rank') || lower.includes('stats')) {
            return PERSONALITIES.xp[0];
        }
        if (lower.includes('squad') || lower.includes('friend') || lower.includes('team') || lower.includes('group')) {
            return PERSONALITIES.squad[0];
        }
        if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh') || lower.includes('lol')) {
            return PERSONALITIES.jokes[Math.floor(Math.random() * PERSONALITIES.jokes.length)];
        }
        if (lower.includes('happy') || lower.includes('great') || lower.includes('awesome') || lower.includes('good')) {
            return PERSONALITIES.mood.happy;
        }
        if (lower.includes('hungry') || lower.includes('food') || lower.includes('eat') || lower.includes('starving')) {
            return PERSONALITIES.mood.hungry;
        }
        if (lower.includes('bored') || lower.includes('boring') || lower.includes('nothing')) {
            return PERSONALITIES.mood.bored;
        }
        if (lower.includes('broke') || lower.includes('money') || lower.includes('poor') || lower.includes('budget')) {
            return PERSONALITIES.mood.broke;
        }
        if (lower.includes('thank') || lower.includes('love') || lower.includes('amazing') || lower.includes('best')) {
            return PERSONALITIES.compliment[Math.floor(Math.random() * PERSONALITIES.compliment.length)];
        }
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('sup')) {
            return PERSONALITIES.greeting[Math.floor(Math.random() * PERSONALITIES.greeting.length)];
        }

        return PERSONALITIES.confused[0];
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const userText = inputText;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, isBot: false, timestamp: new Date() }]);
        setInputText('');
        setIsThinking(true);
        Vibration.vibrate(25);

        await new Promise(r => setTimeout(r, 600 + Math.random() * 500));

        const response = generateFunResponse(userText);
        setIsThinking(false);
        addBotMessage(response);
    };

    const handleRefresh = () => {
        setMessages([]);
        setShowChat(false);
    };

    const renderOrb = () => {
        const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        const glow = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

        return (
            <Animated.View style={[STYLES.orbBox, { transform: [{ translateY: floatAnim }] }]}>
                {/* Cute sparkle particles */}
                <Animated.View style={[STYLES.sparkleRing, { transform: [{ rotate: rotation }] }]}>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                        <View key={i} style={[STYLES.sparkle, { transform: [{ rotate: `${deg}deg` }, { translateX: 65 }] }]}>
                            <Sparkles size={i % 2 === 0 ? 14 : 10} color={i % 2 === 0 ? '#FFD700' : '#FF69B4'} />
                        </View>
                    ))}
                </Animated.View>
                {/* Glow ring */}
                <Animated.View style={[STYLES.glowRing, { opacity: glow, transform: [{ scale: pulseAnim }] }]} />
                {/* Main orb */}
                <Animated.View style={[STYLES.mainOrb, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFCD00']} style={STYLES.orbGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
                            <Gift size={42} color="#FFF" />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>
                {/* Cute face */}
                <View style={STYLES.face}>
                    <View style={STYLES.eyes}>
                        <View style={STYLES.eye}><View style={STYLES.pupil} /></View>
                        <View style={STYLES.eye}><View style={STYLES.pupil} /></View>
                    </View>
                    <View style={STYLES.smile} />
                </View>
            </Animated.View>
        );
    };

    const renderMsg = (m: Message) => (
        <View key={m.id} style={[STYLES.msgRow, m.isBot ? STYLES.botRow : STYLES.userRow]}>
            {m.isBot && (
                <View style={STYLES.avatar}>
                    <LinearGradient colors={['#FF6B6B', '#FFCD00']} style={STYLES.avatarGrad}>
                        <Gift size={12} color="#FFF" />
                    </LinearGradient>
                </View>
            )}
            <View style={[STYLES.bubble, m.isBot ? STYLES.botBubble : STYLES.userBubble]}>
                <Text style={[STYLES.msgText, m.isBot && { color: theme.colors.text }]}>{m.text}</Text>
                {m.isBot && <TouchableOpacity style={STYLES.speakBtn} onPress={() => speakText(m.text)}><Volume2 size={11} color={theme.colors.textTertiary} /></TouchableOpacity>}
            </View>
        </View>
    );

    // ========== WELCOME ==========
    if (!showChat) {
        return (
            <SafeAreaView style={STYLES.container} edges={['top']}>
                <View style={STYLES.header}>
                    <TouchableOpacity onPress={() => router.back()} style={STYLES.backBtn}><ArrowLeft size={22} color={theme.colors.text} /></TouchableOpacity>
                    <Text style={STYLES.headerT}>Utopia AI</Text>
                    <View style={{ width: 30 }} />
                </View>
                <View style={STYLES.welcome}>
                    <TouchableOpacity onPress={openChat} activeOpacity={0.85}>
                        {renderOrb()}
                    </TouchableOpacity>
                    <Text style={STYLES.welcomeT}>Your Deal-Hunting Bestie! 🎉</Text>
                    <Text style={STYLES.welcomeS}>I find deals, tell jokes, and help you save money like a boss. Tap me to chat!</Text>
                    <View style={STYLES.funFacts}>
                        <View style={STYLES.fact}><Text style={STYLES.factEmoji}>🔥</Text><Text style={STYLES.factText}>12 hot deals today</Text></View>
                        <View style={STYLES.fact}><Text style={STYLES.factEmoji}>💰</Text><Text style={STYLES.factText}>₹1,240 saved</Text></View>
                        <View style={STYLES.fact}><Text style={STYLES.factEmoji}>🏆</Text><Text style={STYLES.factText}>Silver rank</Text></View>
                    </View>
                    <TouchableOpacity style={STYLES.startBtn} onPress={openChat}>
                        <PartyPopper size={18} color="#FFF" />
                        <Text style={STYLES.startText}>Let's Goooo!</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ========== CHAT ==========
    return (
        <SafeAreaView style={STYLES.container} edges={['top']}>
            <View style={STYLES.header}>
                <TouchableOpacity onPress={handleRefresh} style={STYLES.backBtn}><ArrowLeft size={22} color={theme.colors.text} /></TouchableOpacity>
                <View style={STYLES.headerCenter}>
                    <LinearGradient colors={['#FF6B6B', '#FFCD00']} style={STYLES.headerIcon}><Gift size={14} color="#FFF" /></LinearGradient>
                    <Text style={STYLES.headerT}>Utopia AI</Text>
                    <Text style={STYLES.headerS}>Your bestie 💝</Text>
                </View>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView ref={scrollViewRef} style={STYLES.msgs} contentContainerStyle={STYLES.msgsContent}>
                {messages.map(renderMsg)}
                {isThinking && (
                    <View style={STYLES.thinking}>
                        <View style={STYLES.thinkingBubble}>
                            <Text style={STYLES.thinkingEmoji}>🤔</Text>
                            <View style={STYLES.dots}>{[0, 1, 2].map(i => <Animated.View key={i} style={[STYLES.dot, { opacity: glowAnim }]} />)}</View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Fun Quick Actions */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={STYLES.quick}>
                {[
                    { emoji: '🔥', text: 'Hot Deals', action: 'Show me hot deals!' },
                    { emoji: '📍', text: 'Nearby', action: 'What\'s near me?' },
                    { emoji: '🎮', text: 'Games', action: 'I wanna play!' },
                    { emoji: '😂', text: 'Joke', action: 'Tell me a joke!' },
                    { emoji: '👥', text: 'Squad', action: 'Show my squad stats' },
                ].map(({ emoji, text, action }) => (
                    <TouchableOpacity key={text} style={STYLES.quickBtn} onPress={() => { setInputText(action); setTimeout(() => handleSend(), 50); }}>
                        <Text style={STYLES.quickEmoji}>{emoji}</Text>
                        <Text style={STYLES.quickText}>{text}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={STYLES.inputBox}>
                <View style={STYLES.inputRow}>
                    <TextInput style={STYLES.input} placeholder="Say something fun..." placeholderTextColor={theme.colors.textTertiary} value={inputText} onChangeText={setInputText} onSubmitEditing={handleSend} />
                    <TouchableOpacity style={STYLES.sendBtn} onPress={handleSend} disabled={!inputText.trim()}>
                        <LinearGradient colors={inputText.trim() ? ['#FF6B6B', '#FFCD00'] : [theme.colors.surfaceLight, theme.colors.surfaceLight]} style={STYLES.sendGrad}>
                            <Send size={14} color={inputText.trim() ? '#FFF' : theme.colors.textTertiary} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight },
    backBtn: { padding: 4 },
    headerCenter: { alignItems: 'center' },
    headerIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
    headerT: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    headerS: { fontSize: 10, color: theme.colors.textSecondary },

    welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
    welcomeT: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginTop: 28, textAlign: 'center' },
    welcomeS: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 19, paddingHorizontal: 10 },
    funFacts: { flexDirection: 'row', marginTop: 24, gap: 12 },
    fact: { alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
    factEmoji: { fontSize: 20, marginBottom: 4 },
    factText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '500' },
    startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 25, marginTop: 28, overflow: 'hidden', backgroundColor: '#FF6B6B' },
    startText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

    orbBox: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },
    sparkleRing: { position: 'absolute', width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
    sparkle: { position: 'absolute' },
    glowRing: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#FFD70050' },
    mainOrb: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
    orbGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    face: { position: 'absolute', bottom: 35 },
    eyes: { flexDirection: 'row', gap: 18, marginBottom: 6 },
    eye: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    pupil: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
    smile: { width: 20, height: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderWidth: 2, borderTopWidth: 0, borderColor: '#FFF', alignSelf: 'center' },

    msgs: { flex: 1 },
    msgsContent: { padding: 12, paddingBottom: 50 },
    msgRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    userRow: { justifyContent: 'flex-end' },
    avatar: { width: 26, height: 26, borderRadius: 13, marginRight: 6, overflow: 'hidden' },
    avatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '80%', padding: 10, borderRadius: 14 },
    botBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    userBubble: { backgroundColor: '#FF6B6B', borderBottomRightRadius: 4 },
    msgText: { fontSize: 13, lineHeight: 18, color: '#FFF' },
    speakBtn: { position: 'absolute', bottom: 4, right: 6 },

    thinking: { paddingLeft: 32, marginBottom: 10 },
    thinkingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, padding: 10, borderRadius: 14, alignSelf: 'flex-start' },
    thinkingEmoji: { fontSize: 18 },
    dots: { flexDirection: 'row', gap: 3 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B' },

    quick: { paddingHorizontal: 10, paddingVertical: 8, maxHeight: 50 },
    quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    quickEmoji: { fontSize: 14 },
    quickText: { fontSize: 11, color: theme.colors.text, fontWeight: '500' },

    inputBox: { padding: 10, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    sendBtn: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
    sendGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

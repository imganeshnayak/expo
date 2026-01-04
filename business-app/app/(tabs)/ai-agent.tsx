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
import {
    Send,
    Mic,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
    ChevronDown,
    Globe,
    Bot,
    Rocket,
    BarChart3,
    Bell,
    Calendar,
    RefreshCw,
    Check,
    Volume2,
    MessageCircle,
    X,
    Keyboard,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/authStore';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

// Complete language data with full response templates
const LANGUAGES: Record<string, any> = {
    en: {
        code: 'en', name: 'English', native: 'English', locale: 'en-US',
        greeting: "Hello! I'm Nova, your AI business assistant. I can help with campaigns, analytics, customer insights, and any business questions. What would you like to explore?",
        thinking: "Thinking...",
        ready: "Nova is ready",
        subtitle: "Your intelligent business partner",
        placeholder: "Ask anything...",
        tapToChat: "Start Chatting",
        voiceHint: "Speak in English",
        responses: {
            sales: (biz: string) => `📊 **${biz} Sales Report:**\n\n• Today: ₹8,450 (+12% vs yesterday)\n• This week: ₹45,200 (+18%)\n• This month: ₹1,82,000\n• Peak hours: 6-8 PM\n• Top item: Cold Coffee (₹150)\n\nWould you like me to create a campaign to boost sales further?`,
            insights: (biz: string) => `📊 **${biz} Business Insights:**\n\n• Revenue: ₹45,200 this week (+18%)\n• Customers: 847 total, 48 new this month\n• Peak time: 6-8 PM\n• Top seller: Cold Coffee\n• Repeat rate: 67%\n\nAnything specific you'd like to know?`,
            campaign: () => `I can create these campaigns for you:\n\n🔥 **Flash Discount** - Instant sales boost\n🎫 **Stamp Card** - Build loyalty\n🎁 **Combo Deal** - Increase order value\n\nWhich would you like? Or say "create discount" for my recommendation.`,
            create: () => `✅ Done! Campaign launched!\n\n🎯 **Happy Hour Discount**\n• 40% off from 2-4 PM\n• Valid for 7 days\n• Target: All customers\n\nCheck the Campaigns tab to manage it!`,
            customers: (biz: string) => `👥 **${biz} Customer Overview:**\n\n• Total: 847 customers\n• VIPs (5+ visits): 124\n• At-risk (inactive 2 weeks): 56\n• New this month: 48\n• Avg. spend: ₹285\n\nWant me to send a re-engagement offer to at-risk customers?`,
            hello: (biz: string) => `Hello! 👋 Great to see you!\n\nI'm Nova, your AI assistant for ${biz}.\n\n**I can help with:**\n• 📊 Sales & Analytics\n• 🚀 Campaign Creation\n• 👥 Customer Insights\n• 📅 Smart Scheduling\n\nWhat would you like to explore?`,
            help: () => `I'm Nova, your AI business assistant! 🤖\n\n**My capabilities:**\n• 📊 Real-time analytics\n• 🚀 Auto-create campaigns\n• 👥 Customer management\n• 📱 Smart notifications\n• 📅 Best time analysis\n\nJust ask me anything!`,
            thanks: () => `You're welcome! 😊\n\nI'm here 24/7 to help your business grow. Just tap Nova AI whenever you need insights or want to create campaigns!`,
            default: (input: string, biz: string) => `I understand you're asking about "${input}".\n\nAs your business AI for ${biz}, I can help with:\n• 📊 Sales & analytics\n• 🚀 Campaigns\n• 👥 Customer data\n\nWhat would you like to know?`,
        },
    },
    hi: {
        code: 'hi', name: 'Hindi', native: 'हिन्दी', locale: 'hi-IN',
        greeting: "नमस्ते! मैं नोवा हूं, आपका AI बिजनेस असिस्टेंट। मैं कैंपेन, एनालिटिक्स, कस्टमर इनसाइट्स और किसी भी बिजनेस सवाल में मदद कर सकता हूं। आप क्या जानना चाहेंगे?",
        thinking: "सोच रहा हूं...",
        ready: "नोवा तैयार है",
        subtitle: "आपका बुद्धिमान बिजनेस पार्टनर",
        placeholder: "कुछ भी पूछें...",
        tapToChat: "चैट शुरू करें",
        voiceHint: "हिंदी में बोलें",
        responses: {
            sales: (biz: string) => `📊 **${biz} सेल्स रिपोर्ट:**\n\n• आज: ₹8,450 (कल से +12%)\n• इस हफ्ते: ₹45,200 (+18%)\n• इस महीने: ₹1,82,000\n• पीक टाइम: शाम 6-8 बजे\n• टॉप आइटम: कोल्ड कॉफी (₹150)\n\nक्या मैं सेल्स बढ़ाने के लिए कोई कैंपेन बनाऊं?`,
            insights: (biz: string) => `📊 **${biz} बिजनेस इनसाइट्स:**\n\n• रेवेन्यू: इस हफ्ते ₹45,200 (+18%)\n• कस्टमर्स: कुल 847, इस महीने 48 नए\n• पीक टाइम: शाम 6-8 बजे\n• टॉप सेलर: कोल्ड कॉफी\n• रिपीट रेट: 67%\n\nऔर कुछ जानना है?`,
            campaign: () => `मैं ये कैंपेन बना सकता हूं:\n\n🔥 **फ्लैश डिस्काउंट** - तुरंत सेल्स बढ़ाएं\n🎫 **स्टैम्प कार्ड** - लॉयल्टी बनाएं\n🎁 **कॉम्बो डील** - ऑर्डर वैल्यू बढ़ाएं\n\nकौन सा चाहिए? या "डिस्काउंट बनाओ" बोलें!`,
            create: () => `✅ हो गया! कैंपेन लॉन्च हो गई!\n\n🎯 **हैप्पी आवर डिस्काउंट**\n• 2-4 बजे 40% ऑफ\n• 7 दिन के लिए वैलिड\n• टारगेट: सभी कस्टमर्स\n\nCampaigns टैब में देखें!`,
            customers: (biz: string) => `👥 **${biz} कस्टमर ओवरव्यू:**\n\n• कुल: 847 कस्टमर्स\n• VIP (5+ विज़िट): 124\n• रिस्क में (2 हफ्ते इनएक्टिव): 56\n• इस महीने नए: 48\n• औसत खर्च: ₹285\n\nरिस्क वाले कस्टमर्स को ऑफर भेजूं?`,
            hello: (biz: string) => `नमस्ते! 👋 आपसे मिलकर खुशी हुई!\n\nमैं नोवा हूं, ${biz} का AI असिस्टेंट।\n\n**मैं मदद कर सकता हूं:**\n• 📊 सेल्स और एनालिटिक्स\n• 🚀 कैंपेन बनाना\n• 👥 कस्टमर इनसाइट्स\n• 📅 स्मार्ट शेड्यूलिंग\n\nआप क्या जानना चाहते हैं?`,
            help: () => `मैं नोवा हूं, आपका AI बिजनेस असिस्टेंट! 🤖\n\n**मेरी क्षमताएं:**\n• 📊 रियल-टाइम एनालिटिक्स\n• 🚀 ऑटो कैंपेन बनाना\n• 👥 कस्टमर मैनेजमेंट\n• 📱 स्मार्ट नोटिफिकेशन\n• 📅 बेस्ट टाइम एनालिसिस\n\nकुछ भी पूछें!`,
            thanks: () => `धन्यवाद! 😊\n\nमैं 24/7 आपके बिजनेस की मदद के लिए हूं। जब चाहे Nova AI टैप करें!`,
            default: (input: string, biz: string) => `मैं समझ गया आप "${input}" के बारे में पूछ रहे हैं।\n\n${biz} के लिए मैं मदद कर सकता हूं:\n• 📊 सेल्स और एनालिटिक्स\n• 🚀 कैंपेन\n• 👥 कस्टमर डेटा\n\nक्या जानना चाहेंगे?`,
        },
        keywords: {
            sales: ['सेल्स', 'sales', 'बिक्री', 'कमाई', 'revenue', 'earning', 'आज', 'today', 'आज के', 'आज की'],
            insights: ['इनसाइट', 'रिपोर्ट', 'डेटा', 'एनालिटिक्स', 'जानकारी', 'विश्लेषण', 'दिखाओ', 'बताओ'],
            campaign: ['कैंपेन', 'ऑफर', 'डील', 'प्रोमोशन', 'छूट', 'discount'],
            create: ['बनाओ', 'create', 'हां', 'yes', 'शुरू', 'launch', 'चलाओ'],
            customers: ['कस्टमर', 'ग्राहक', 'customer', 'लोग', 'विज़िटर'],
            hello: ['नमस्ते', 'हाय', 'हेलो', 'hello', 'hi', 'hey'],
            help: ['मदद', 'help', 'क्या कर सकते', 'सुविधाएं'],
            thanks: ['धन्यवाद', 'शुक्रिया', 'thanks', 'thank'],
        },
    },
    ta: {
        code: 'ta', name: 'Tamil', native: 'தமிழ்', locale: 'ta-IN',
        greeting: "வணக்கம்! நான் நோவா, உங்கள் AI வணிக உதவியாளர். பிரச்சாரங்கள், பகுப்பாய்வு மற்றும் எந்த கேள்விக்கும் உதவ முடியும். என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?",
        thinking: "யோசிக்கிறேன்...",
        ready: "நோவா தயார்",
        subtitle: "உங்கள் புத்திசாலி வணிக கூட்டாளி",
        placeholder: "எதையும் கேளுங்கள்...",
        tapToChat: "அரட்டை தொடங்கு",
        voiceHint: "தமிழில் பேசுங்கள்",
        responses: {
            sales: (biz: string) => `📊 **${biz} விற்பனை அறிக்கை:**\n\n• இன்று: ₹8,450 (+12%)\n• இந்த வாரம்: ₹45,200 (+18%)\n• இந்த மாதம்: ₹1,82,000\n• உச்ச நேரம்: மாலை 6-8\n\nவிற்பனையை அதிகரிக்க பிரச்சாரம் உருவாக்கவா?`,
            insights: (biz: string) => `📊 **${biz} நுண்ணறிவு:**\n\n• வருவாய்: இந்த வாரம் ₹45,200 (+18%)\n• வாடிக்கையாளர்கள்: மொத்தம் 847\n• உச்ச நேரம்: மாலை 6-8\n\nமேலும் என்ன தெரிந்துகொள்ள வேண்டும்?`,
            campaign: () => `இந்த பிரச்சாரங்களை உருவாக்க முடியும்:\n\n🔥 **ஃபிளாஷ் தள்ளுபடி**\n🎫 **ஸ்டாம்ப் கார்டு**\n🎁 **காம்போ டீல்**\n\nஎது வேண்டும்?`,
            create: () => `✅ முடிந்தது! பிரச்சாரம் தொடங்கியது!\n\n🎯 **ஹேப்பி அவர் தள்ளுபடி**\n• 2-4 மணி 40% தள்ளுபடி\n• 7 நாட்கள் செல்லுபடியாகும்\n\nCampaigns டேப்பில் பாருங்கள்!`,
            hello: (biz: string) => `வணக்கம்! 👋\n\nநான் நோவா, ${biz} க்கான AI உதவியாளர்.\n\n**நான் உதவ முடியும்:**\n• 📊 விற்பனை பகுப்பாய்வு\n• 🚀 பிரச்சாரம் உருவாக்குதல்\n• 👥 வாடிக்கையாளர் நுண்ணறிவு\n\nஎன்ன வேண்டும்?`,
            default: (input: string, biz: string) => `"${input}" பற்றி கேட்கிறீர்கள் என்று புரிகிறது.\n\n${biz} க்கு நான் உதவ முடியும்:\n• 📊 விற்பனை\n• 🚀 பிரச்சாரங்கள்\n• 👥 வாடிக்கையாளர் தரவு`,
        },
        keywords: {
            sales: ['விற்பனை', 'sales', 'இன்று', 'வருமானம்'],
            insights: ['நுண்ணறிவு', 'அறிக்கை', 'தரவு'],
            campaign: ['பிரச்சாரம்', 'தள்ளுபடி', 'ஆஃபர்'],
            create: ['உருவாக்கு', 'ஆம்', 'தொடங்கு'],
            hello: ['வணக்கம்', 'ஹாய்'],
        },
    },
    te: {
        code: 'te', name: 'Telugu', native: 'తెలుగు', locale: 'te-IN',
        greeting: "నమస్కారం! నేను నోవా, మీ AI వ్యాపార సహాయకుడిని. ప్రచారాలు, విశ్లేషణలు మరియు ఏ ప్రశ్నకైనా సహాయం చేయగలను.",
        thinking: "ఆలోచిస్తున్నాను...",
        ready: "నోవా సిద్ధం",
        subtitle: "మీ తెలివైన వ్యాపార భాగస్వామి",
        placeholder: "ఏదైనా అడగండి...",
        tapToChat: "చాట్ ప్రారంభించండి",
        voiceHint: "తెలుగులో మాట్లాడండి",
        responses: {
            sales: (biz: string) => `📊 **${biz} సేల్స్ రిపోర్ట్:**\n\n• ఈరోజు: ₹8,450 (+12%)\n• ఈ వారం: ₹45,200 (+18%)\n• ఈ నెల: ₹1,82,000\n\nసేల్స్ పెంచడానికి ప్రచారం సృష్టించమంటారా?`,
            insights: (biz: string) => `📊 **${biz} అంతర్దృష్టులు:**\n\n• ఆదాయం: ఈ వారం ₹45,200 (+18%)\n• కస్టమర్లు: మొత్తం 847\n\nమరింత తెలుసుకోవాలనుకుంటున్నారా?`,
            hello: (biz: string) => `నమస్కారం! 👋\n\nనేను నోవా, ${biz} కోసం AI సహాయకుడిని.\n\n**నేను సహాయం చేయగలను:**\n• 📊 సేల్స్ విశ్లేషణ\n• 🚀 ప్రచారాలు\n• 👥 కస్టమర్ అంతర్దృష్టులు`,
            default: (input: string, biz: string) => `"${input}" గురించి అడుగుతున్నారని అర్థమైంది.\n\n${biz} కోసం నేను సహాయం చేయగలను:\n• 📊 సేల్స్\n• 🚀 ప్రచారాలు\n• 👥 కస్టమర్ డేటా`,
        },
        keywords: {
            sales: ['సేల్స్', 'అమ్మకాలు', 'ఈరోజు', 'ఆదాయం'],
            insights: ['అంతర్దృష్టులు', 'రిపోర్ట్', 'డేటా'],
            hello: ['నమస్కారం', 'హాయ్'],
        },
    },
};

// Add Kannada with full responses
LANGUAGES.kn = {
    code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನೋವಾ, ನಿಮ್ಮ AI ವ್ಯಾಪಾರ ಸಹಾಯಕ. ಪ್ರಚಾರಗಳು, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಗ್ರಾಹಕ ಒಳನೋಟಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.',
    thinking: 'ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...',
    ready: 'ನೋವಾ ಸಿದ್ಧ',
    subtitle: 'ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ವ್ಯಾಪಾರ ಪಾಲುದಾರ',
    placeholder: 'ಏನಾದರೂ ಕೇಳಿ...',
    tapToChat: 'ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ',
    voiceHint: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ',
    responses: {
        sales: (biz: string) => `📊 **${biz} ಮಾರಾಟ ವರದಿ:**\n\n• ಇಂದು: ₹8,450 (+12%)\n• ಈ ವಾರ: ₹45,200 (+18%)\n• ಈ ತಿಂಗಳು: ₹1,82,000\n• ಪೀಕ್ ಸಮಯ: ಸಂಜೆ 6-8\n• ಟಾಪ್ ಐಟಂ: ಕೋಲ್ಡ್ ಕಾಫಿ (₹150)\n\nಮಾರಾಟ ಹೆಚ್ಚಿಸಲು ಪ್ರಚಾರ ಮಾಡಲೇ?`,
        insights: (biz: string) => `📊 **${biz} ಒಳನೋಟಗಳು:**\n\n• ಆದಾಯ: ಈ ವಾರ ₹45,200 (+18%)\n• ಗ್ರಾಹಕರು: ಒಟ್ಟು 847, 48 ಹೊಸ\n• ಪೀಕ್ ಸಮಯ: ಸಂಜೆ 6-8\n• ಟಾಪ್ ಸೆಲ್ಲರ್: ಕೋಲ್ಡ್ ಕಾಫಿ\n• ಪುನರಾವರ್ತನೆ ದರ: 67%\n\nಇನ್ನೇನಾದರೂ ತಿಳಿಯಬೇಕೇ?`,
        campaign: () => `ಈ ಪ್ರಚಾರಗಳನ್ನು ಮಾಡಬಹುದು:\n\n🔥 **ಫ್ಲ್ಯಾಶ್ ರಿಯಾಯಿತಿ** - ತ್ವರಿತ ಮಾರಾಟ\n🎫 **ಸ್ಟ್ಯಾಂಪ್ ಕಾರ್ಡ್** - ನಿಷ್ಠೆ ನಿರ್ಮಾಣ\n🎁 **ಕಾಂಬೋ ಡೀಲ್** - ಆರ್ಡರ್ ಮೌಲ್ಯ ಹೆಚ್ಚಿಸಿ\n\nಯಾವುದು ಬೇಕು?`,
        create: () => `✅ ಮುಗಿಯಿತು! ಪ್ರಚಾರ ಆರಂಭವಾಯಿತು!\n\n🎯 **ಹ್ಯಾಪಿ ಅವರ್ ರಿಯಾಯಿತಿ**\n• 2-4 PM 40% ರಿಯಾಯಿತಿ\n• 7 ದಿನ ಮಾನ್ಯ\n\nCampaigns ಟ್ಯಾಬ್‌ನಲ್ಲಿ ನೋಡಿ!`,
        customers: (biz: string) => `👥 **${biz} ಗ್ರಾಹಕ ಅವಲೋಕನ:**\n\n• ಒಟ್ಟು: 847 ಗ್ರಾಹಕರು\n• VIP (5+ ಭೇಟಿ): 124\n• ಅಪಾಯದಲ್ಲಿ: 56\n• ಈ ತಿಂಗಳು ಹೊಸ: 48\n\nಅಪಾಯದಲ್ಲಿರುವವರಿಗೆ ಆಫರ್ ಕಳುಹಿಸಲೇ?`,
        hello: (biz: string) => `ನಮಸ್ಕಾರ! 👋\n\nನಾನು ನೋವಾ, ${biz} ಗಾಗಿ AI ಸಹಾಯಕ.\n\n**ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:**\n• 📊 ಮಾರಾಟ ವಿಶ್ಲೇಷಣೆ\n• 🚀 ಪ್ರಚಾರ ರಚನೆ\n• 👥 ಗ್ರಾಹಕ ಒಳನೋಟಗಳು\n\nಏನು ಬೇಕು?`,
        help: () => `ನಾನು ನೋವಾ, ನಿಮ್ಮ AI ಸಹಾಯಕ! 🤖\n\n**ನನ್ನ ಸಾಮರ್ಥ್ಯಗಳು:**\n• 📊 ರಿಯಲ್-ಟೈಮ್ ವಿಶ್ಲೇಷಣೆ\n• 🚀 ಆಟೋ ಪ್ರಚಾರ\n• 👥 ಗ್ರಾಹಕ ನಿರ್ವಹಣೆ\n\nಏನಾದರೂ ಕೇಳಿ!`,
        thanks: () => `ಧನ್ಯವಾದಗಳು! 😊\n\nನಾನು 24/7 ಸಹಾಯಕ್ಕೆ ಇದ್ದೇನೆ!`,
        default: (input: string, biz: string) => `"${input}" ಬಗ್ಗೆ ಕೇಳುತ್ತಿದ್ದೀರಿ ಎಂದು ಅರ್ಥವಾಯಿತು.\n\n${biz} ಗಾಗಿ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• 📊 ಮಾರಾಟ\n• 🚀 ಪ್ರಚಾರಗಳು\n• 👥 ಗ್ರಾಹಕ ಡೇಟಾ`,
    },
    keywords: {
        sales: ['ಮಾರಾಟ', 'ಇಂದು', 'ಆದಾಯ'],
        insights: ['ಒಳನೋಟ', 'ವರದಿ', 'ತೋರಿಸಿ'],
        campaign: ['ಪ್ರಚಾರ', 'ಆಫರ್', 'ರಿಯಾಯಿತಿ'],
        hello: ['ನಮಸ್ಕಾರ', 'ಹಾಯ್'],
    },
};

// Add other languages with English fallback
['bn', 'mr', 'gu', 'ml', 'pa'].forEach(code => {
    const names: Record<string, any> = {
        bn: { name: 'Bengali', native: 'বাংলা', locale: 'bn-IN', greeting: 'নমস্কার! আমি নোভা, আপনার AI ব্যবসায়িক সহায়ক।', thinking: 'ভাবছি...', ready: 'নোভা প্রস্তুত', placeholder: 'কিছু জিজ্ঞাসা করুন...' },
        mr: { name: 'Marathi', native: 'मराठी', locale: 'mr-IN', greeting: 'नमस्कार! मी नोवा, तुमचा AI व्यवसाय सहाय्यक.', thinking: 'विचार करत आहे...', ready: 'नोवा तयार', placeholder: 'काहीही विचारा...' },
        gu: { name: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN', greeting: 'નમસ્તે! હું નોવા છું, તમારો AI બિઝનેસ આસિસ્ટન્ટ.', thinking: 'વિચારી રહ્યું છે...', ready: 'નોવા તૈયાર', placeholder: 'કંઈપણ પૂછો...' },
        ml: { name: 'Malayalam', native: 'മലയാളം', locale: 'ml-IN', greeting: 'നമസ്കാരം! ഞാൻ നോവ, നിങ്ങളുടെ AI ബിസിനസ് അസിസ്റ്റന്റ്.', thinking: 'ചിന്തിക്കുന്നു...', ready: 'നോവ തയ്യാർ', placeholder: 'എന്തും ചോദിക്കൂ...' },
        pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', locale: 'pa-IN', greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨੋਵਾ ਹਾਂ, ਤੁਹਾਡਾ AI ਬਿਜ਼ਨਸ ਅਸਿਸਟੈਂਟ.', thinking: 'ਸੋਚ ਰਿਹਾ ਹਾਂ...', ready: 'ਨੋਵਾ ਤਿਆਰ', placeholder: 'ਕੁਝ ਵੀ ਪੁੱਛੋ...' },
    };
    LANGUAGES[code] = {
        code,
        ...names[code],
        subtitle: LANGUAGES.en.subtitle,
        tapToChat: LANGUAGES.en.tapToChat,
        voiceHint: `Speak in ${names[code].name}`,
        responses: LANGUAGES.en.responses,
        keywords: {},
    };
});


// Intelligent response generator
const generateIntelligentResponse = (input: string, lang: any, businessName: string): string => {
    const lower = input.toLowerCase();
    const responses = lang.responses || LANGUAGES.en.responses;
    const keywords = lang.keywords || {};

    // Check for sales-related queries
    const salesKeywords = keywords.sales || ['sales', 'revenue', 'today', 'earning', 'money', 'income', 'आज', 'सेल्स'];
    if (salesKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.sales ? responses.sales(businessName) : LANGUAGES.en.responses.sales(businessName);
    }

    // Check for insights/analytics
    const insightKeywords = keywords.insights || ['insight', 'analytics', 'data', 'report', 'show', 'performance'];
    if (insightKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.insights ? responses.insights(businessName) : LANGUAGES.en.responses.insights(businessName);
    }

    // Check for campaign
    const campaignKeywords = keywords.campaign || ['campaign', 'deal', 'offer', 'promotion', 'discount'];
    if (campaignKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.campaign ? responses.campaign() : LANGUAGES.en.responses.campaign();
    }

    // Check for create/confirm
    const createKeywords = keywords.create || ['create', 'yes', 'proceed', 'launch', 'confirm', 'do it'];
    if (createKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.create ? responses.create() : LANGUAGES.en.responses.create();
    }

    // Check for customers
    const customerKeywords = keywords.customers || ['customer', 'people', 'visitor', 'crm'];
    if (customerKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.customers ? responses.customers(businessName) : LANGUAGES.en.responses.customers(businessName);
    }

    // Check for greetings
    const helloKeywords = keywords.hello || ['hello', 'hi', 'hey', 'namaste'];
    if (helloKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.hello ? responses.hello(businessName) : LANGUAGES.en.responses.hello(businessName);
    }

    // Check for help
    const helpKeywords = keywords.help || ['help', 'what can', 'capabilities'];
    if (helpKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.help ? responses.help() : LANGUAGES.en.responses.help();
    }

    // Check for thanks
    const thanksKeywords = keywords.thanks || ['thank', 'thanks'];
    if (thanksKeywords.some((kw: string) => lower.includes(kw.toLowerCase()))) {
        return responses.thanks ? responses.thanks() : LANGUAGES.en.responses.thanks();
    }

    // Default response in the selected language
    return responses.default ? responses.default(input, businessName) : LANGUAGES.en.responses.default(input, businessName);
};

interface Message { id: string; text: string; isBot: boolean; timestamp: Date; }

export default function AIAgentScreen() {
    const theme = useAppTheme();
    const { user } = useAuthStore();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES.en);
    const [showLanguages, setShowLanguages] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceInputText, setVoiceInputText] = useState('');

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const waveAnim1 = useRef(new Animated.Value(0)).current;
    const waveAnim2 = useRef(new Animated.Value(0)).current;
    const waveAnim3 = useRef(new Animated.Value(0)).current;
    const voicePulse = useRef(new Animated.Value(1)).current;

    const STYLES = getStyles(theme);
    const businessName = user?.businessName || 'Your Store';

    useEffect(() => { startAnimations(); }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setMessages([]);
            setTimeout(() => addBotMessage(selectedLanguage.greeting), 300);
        }
    }, [selectedLanguage.code]);

    const startAnimations = () => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.12, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(floatAnim, { toValue: -18, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 18, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.25, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })).start();
        [waveAnim1, waveAnim2, waveAnim3].forEach((anim, i) => {
            setTimeout(() => {
                Animated.loop(Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration: 3500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
                ])).start();
            }, i * 1100);
        });
    };

    const startVoicePulse = () => {
        Animated.loop(Animated.sequence([
            Animated.timing(voicePulse, { toValue: 1.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(voicePulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])).start();
    };

    const openChat = () => {
        setShowChat(true);
        setTimeout(() => addBotMessage(selectedLanguage.greeting), 400);
    };

    const addBotMessage = (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text, isBot: true, timestamp: new Date() }]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const speakText = (text: string) => {
        const clean = text.replace(/[✅🎯📊🔥⚡💡👥📱📅💰🤖📈👋😊\*\#]/g, '').replace(/\n/g, '. ');
        Speech.speak(clean, { language: selectedLanguage.locale, rate: 0.85 });
    };

    const handleSend = async (textToSend?: string) => {
        const finalText = textToSend || inputText;
        if (!finalText.trim()) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), text: finalText, isBot: false, timestamp: new Date() }]);
        setInputText('');
        setIsThinking(true);
        Vibration.vibrate(25);

        await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

        const response = generateIntelligentResponse(finalText, selectedLanguage, businessName);
        setIsThinking(false);
        addBotMessage(response);
    };

    // Quick action handler - directly generates response in selected language
    const handleQuickAction = async (action: string) => {
        const responses = selectedLanguage.responses || LANGUAGES.en.responses;

        // Add user message in selected language
        const userMessages: Record<string, Record<string, string>> = {
            en: { insights: 'Show insights', campaign: 'Create campaign', schedule: 'Best time to run campaign?', notify: 'Send notification' },
            hi: { insights: 'इनसाइट्स दिखाओ', campaign: 'कैंपेन बनाओ', schedule: 'कैंपेन कब चलाऊं?', notify: 'नोटिफिकेशन भेजो' },
            ta: { insights: 'நுண்ணறிவு காட்டு', campaign: 'பிரச்சாரம் உருவாக்கு', schedule: 'எப்போது இயக்குவது?', notify: 'அறிவிப்பு அனுப்பு' },
            te: { insights: 'అంతర్దృష్టులు చూపించు', campaign: 'ప్రచారం సృష్టించు', schedule: 'ఎప్పుడు నడపాలి?', notify: 'నోటిఫికేషన్ పంపు' },
            kn: { insights: 'ಒಳನೋಟಗಳನ್ನು ತೋರಿಸಿ', campaign: 'ಪ್ರಚಾರ ಮಾಡಿ', schedule: 'ಯಾವಾಗ ನಡೆಸಬೇಕು?', notify: 'ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಿ' },
        };

        const langCode = selectedLanguage.code;
        const userMsg = userMessages[langCode]?.[action] || userMessages.en[action] || action;

        setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, isBot: false, timestamp: new Date() }]);
        setIsThinking(true);
        Vibration.vibrate(25);

        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

        let response = '';
        switch (action) {
            case 'insights':
                response = responses.insights ? responses.insights(businessName) : LANGUAGES.en.responses.insights(businessName);
                break;
            case 'campaign':
                response = responses.campaign ? responses.campaign() : LANGUAGES.en.responses.campaign();
                break;
            case 'schedule':
                if (selectedLanguage.code === 'hi') {
                    response = `📅 **बेस्ट टाइमिंग:**\n\n• मंगल-गुरु शाम: सबसे ज्यादा एंगेजमेंट\n• वीकेंड 11-1 बजे: फैमिली क्राउड\n• शुक्रवार शाम 6 बजे: वीकेंड शुरू\n\nमैं ऑटो-शेड्यूल कर सकता हूं!`;
                } else if (selectedLanguage.code === 'kn') {
                    response = `📅 **ಉತ್ತಮ ಸಮಯ:**\n\n• ಮಂಗಳ-ಗುರು ಸಂಜೆ: ಹೆಚ್ಚಿನ ಎಂಗೇಜ್‌ಮೆಂಟ್\n• ವಾರಾಂತ್ಯ 11-1: ಫ್ಯಾಮಿಲಿ\n• ಶುಕ್ರವಾರ ಸಂಜೆ 6: ವಾರಾಂತ್ಯ ಆರಂಭ\n\nನಾನು ಆಟೋ-ಶೆಡ್ಯೂಲ್ ಮಾಡಬಲ್ಲೆ!`;
                } else {
                    response = `📅 **Best Times:**\n\n• Tue-Thu evenings: Highest engagement\n• Weekends 11 AM-1 PM: Family crowd\n• Friday 6 PM: Weekend kickoff\n\nI can auto-schedule for maximum impact!`;
                }
                break;
            case 'notify':
                if (selectedLanguage.code === 'hi') {
                    response = `📱 **नोटिफिकेशन ऑप्शन:**\n\n• पास के Utopia यूजर्स को पुश\n• लॉयल्टी मेंबर्स को SMS\n• VIP कस्टमर्स को WhatsApp\n\nक्या मैसेज भेजना चाहेंगे?`;
                } else if (selectedLanguage.code === 'kn') {
                    response = `📱 **ಅಧಿಸೂಚನೆ ಆಯ್ಕೆಗಳು:**\n\n• ಹತ್ತಿರದ Utopia ಬಳಕೆದಾರರಿಗೆ ಪುಶ್\n• ಲಾಯಲ್ಟಿ ಸದಸ್ಯರಿಗೆ SMS\n• VIP ಗ್ರಾಹಕರಿಗೆ WhatsApp\n\nಯಾವ ಸಂದೇಶ ಕಳುಹಿಸಬೇಕು?`;
                } else {
                    response = `📱 **Notification Options:**\n\n• Push to nearby Utopia users\n• SMS to loyalty members\n• WhatsApp to VIP customers\n\nWhat message would you like to send?`;
                }
                break;
            default:
                response = responses.default ? responses.default(action, businessName) : LANGUAGES.en.responses.default(action, businessName);
        }

        setIsThinking(false);
        addBotMessage(response);
    };


    const openVoiceModal = () => {
        setShowVoiceModal(true);
        setVoiceInputText('');
        startVoicePulse();
    };

    const sendVoiceMessage = () => {
        if (voiceInputText.trim()) {
            setShowVoiceModal(false);
            voicePulse.stopAnimation();
            handleSend(voiceInputText);
            setVoiceInputText('');
        }
    };

    const cancelVoice = () => {
        setShowVoiceModal(false);
        setVoiceInputText('');
        voicePulse.stopAnimation();
    };

    const handleRefresh = () => {
        setMessages([]);
        setShowChat(false);
    };

    const renderOrb = (large = true) => {
        const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        const glow = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] });
        const s = large ? 1 : 0.35;
        const renderWave = (anim: Animated.Value) => {
            const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
            const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });
            return <Animated.View style={[STYLES.wave, { transform: [{ scale }], opacity, width: 110 * s, height: 110 * s, borderRadius: 55 * s }]} />;
        };
        return (
            <Animated.View style={[large ? STYLES.orbBox : STYLES.orbBoxSmall, { transform: [{ translateY: large ? floatAnim : 0 }] }]}>
                {renderWave(waveAnim1)}{renderWave(waveAnim2)}{renderWave(waveAnim3)}
                <Animated.View style={[STYLES.orbGlow, { opacity: glow, transform: [{ scale: pulseAnim }], width: 150 * s, height: 150 * s, borderRadius: 75 * s }]}>
                    <LinearGradient colors={[theme.colors.primary + '50', 'transparent']} style={{ flex: 1, borderRadius: 75 * s }} />
                </Animated.View>
                <Animated.View style={[STYLES.particles, { transform: [{ rotate: rotation }], width: 100 * s, height: 100 * s }]}>
                    {[0, 72, 144, 216, 288].map((d, i) => (
                        <View key={i} style={[STYLES.particle, { transform: [{ rotate: `${d}deg` }, { translateX: 45 * s }] }]}>
                            <View style={[STYLES.dot, { width: 5 * s, height: 5 * s, borderRadius: 2.5 * s, backgroundColor: i % 2 === 0 ? theme.colors.primary : '#00D4FF' }]} />
                        </View>
                    ))}
                </Animated.View>
                <Animated.View style={[STYLES.orbCore, { transform: [{ scale: pulseAnim }], width: 80 * s, height: 80 * s, borderRadius: 40 * s }]}>
                    <LinearGradient colors={['#00D4FF', theme.colors.primary, '#8B5CF6']} style={STYLES.orbCoreGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        {isThinking ? <Sparkles size={30 * s} color="#FFF" /> : <Bot size={30 * s} color="#FFF" />}
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        );
    };

    const renderMsg = (m: Message) => (
        <View key={m.id} style={[STYLES.msgRow, m.isBot ? STYLES.botRow : STYLES.userRow]}>
            {m.isBot && <View style={STYLES.avatar}><LinearGradient colors={['#00D4FF', theme.colors.primary]} style={STYLES.avatarGrad}><Bot size={11} color="#FFF" /></LinearGradient></View>}
            <View style={[STYLES.bubble, m.isBot ? STYLES.botBubble : STYLES.userBubble]}>
                <Text style={[STYLES.msgText, m.isBot && { color: theme.colors.text }]}>{m.text}</Text>
                {m.isBot && <TouchableOpacity style={STYLES.speakBtn} onPress={() => speakText(m.text)}><Volume2 size={11} color={theme.colors.textTertiary} /></TouchableOpacity>}
            </View>
        </View>
    );

    const VoiceModal = () => (
        <Modal visible={showVoiceModal} transparent animationType="fade">
            <View style={STYLES.voiceOverlay}>
                <View style={STYLES.voiceCard}>
                    <TouchableOpacity style={STYLES.voiceClose} onPress={cancelVoice}><X size={22} color={theme.colors.text} /></TouchableOpacity>
                    <View style={STYLES.voiceHeader}>
                        <Text style={STYLES.voiceLang}>{selectedLanguage.native}</Text>
                        <Text style={STYLES.voiceTitle}>Voice Input</Text>
                    </View>
                    <View style={STYLES.voiceMicContainer}>
                        <Animated.View style={[STYLES.voiceMicPulse, { transform: [{ scale: voicePulse }] }]} />
                        <View style={STYLES.voiceMicInner}><Mic size={32} color="#FFF" /></View>
                    </View>
                    <Text style={STYLES.voiceHint}>{selectedLanguage.voiceHint}</Text>
                    <View style={STYLES.voiceInputContainer}>
                        <TextInput style={STYLES.voiceInput} placeholder={selectedLanguage.placeholder} placeholderTextColor={theme.colors.textTertiary} value={voiceInputText} onChangeText={setVoiceInputText} multiline autoFocus />
                        <View style={STYLES.voiceInputNote}><Keyboard size={14} color={theme.colors.textTertiary} /><Text style={STYLES.voiceInputNoteText}>Use your keyboard's 🎤 for voice-to-text</Text></View>
                    </View>
                    <TouchableOpacity style={[STYLES.voiceSendBtn, !voiceInputText.trim() && STYLES.voiceSendBtnDisabled]} onPress={sendVoiceMessage} disabled={!voiceInputText.trim()}>
                        <Send size={18} color="#FFF" /><Text style={STYLES.voiceSendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const languageList = Object.values(LANGUAGES);

    if (!showChat) {
        return (
            <SafeAreaView style={STYLES.container} edges={['top']}>
                <View style={STYLES.header}>
                    <View style={STYLES.headerL}><LinearGradient colors={['#00D4FF', theme.colors.primary]} style={STYLES.logo}><Sparkles size={15} color="#FFF" /></LinearGradient><Text style={STYLES.headerT}>Nova AI</Text></View>
                    <TouchableOpacity style={STYLES.langBtn} onPress={() => setShowLanguages(!showLanguages)}><Globe size={13} color={theme.colors.text} /><Text style={STYLES.langText}>{selectedLanguage.native}</Text><ChevronDown size={11} color={theme.colors.textSecondary} /></TouchableOpacity>
                </View>
                {showLanguages && <View style={STYLES.langDrop}><ScrollView style={{ maxHeight: 260 }}>{languageList.map((l: any) => <TouchableOpacity key={l.code} style={[STYLES.langOpt, selectedLanguage.code === l.code && STYLES.langOptActive]} onPress={() => { setSelectedLanguage(l); setShowLanguages(false); }}><Text style={STYLES.langOptText}>{l.native}</Text>{selectedLanguage.code === l.code && <Check size={14} color={theme.colors.primary} />}</TouchableOpacity>)}</ScrollView></View>}
                <View style={STYLES.welcome}>
                    <TouchableOpacity onPress={openChat} activeOpacity={0.85}>{renderOrb(true)}</TouchableOpacity>
                    <Text style={STYLES.welcomeT}>{selectedLanguage.ready}</Text>
                    <Text style={STYLES.welcomeS}>{selectedLanguage.subtitle}</Text>
                    <TouchableOpacity style={STYLES.startBtn} onPress={openChat}><MessageCircle size={16} color="#FFF" /><Text style={STYLES.startText}>{selectedLanguage.tapToChat}</Text></TouchableOpacity>
                    <View style={STYLES.caps}>
                        {[{ i: TrendingUp, c: theme.colors.primary, t: 'Analytics' }, { i: Zap, c: '#F59E0B', t: 'Campaigns' }, { i: Users, c: '#10B981', t: 'CRM' }].map(({ i: I, c, t }) => (
                            <View key={t} style={STYLES.cap}><View style={[STYLES.capIcon, { backgroundColor: c + '20' }]}><I size={15} color={c} /></View><Text style={STYLES.capText}>{t}</Text></View>
                        ))}
                    </View>
                </View>
                <VoiceModal />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={STYLES.container} edges={['top']}>
            <View style={STYLES.header}>
                <View style={STYLES.headerL}><LinearGradient colors={['#00D4FF', theme.colors.primary]} style={STYLES.logo}><Sparkles size={15} color="#FFF" /></LinearGradient><Text style={STYLES.headerT}>Nova AI</Text></View>
                <View style={STYLES.headerR}>
                    <TouchableOpacity style={STYLES.refreshBtn} onPress={handleRefresh}><RefreshCw size={15} color={theme.colors.textSecondary} /></TouchableOpacity>
                    <TouchableOpacity style={STYLES.langBtn} onPress={() => setShowLanguages(!showLanguages)}><Globe size={13} color={theme.colors.text} /><Text style={STYLES.langText}>{selectedLanguage.native}</Text><ChevronDown size={11} color={theme.colors.textSecondary} /></TouchableOpacity>
                </View>
            </View>
            {showLanguages && <View style={STYLES.langDrop}><ScrollView style={{ maxHeight: 260 }}>{languageList.map((l: any) => <TouchableOpacity key={l.code} style={[STYLES.langOpt, selectedLanguage.code === l.code && STYLES.langOptActive]} onPress={() => { setSelectedLanguage(l); setShowLanguages(false); }}><Text style={STYLES.langOptText}>{l.native}</Text>{selectedLanguage.code === l.code && <Check size={14} color={theme.colors.primary} />}</TouchableOpacity>)}</ScrollView></View>}

            <ScrollView ref={scrollViewRef} style={STYLES.msgs} contentContainerStyle={STYLES.msgsContent}>
                {messages.map(renderMsg)}
                {isThinking && <View style={STYLES.thinking}><View style={STYLES.dots}>{[0, 1, 2].map(i => <Animated.View key={i} style={[STYLES.dot, { opacity: glowAnim, backgroundColor: theme.colors.primary }]} />)}</View><Text style={STYLES.thinkingText}>{selectedLanguage.thinking}</Text></View>}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={STYLES.quick}>
                {[{ i: BarChart3, t: 'Insights', key: 'insights' }, { i: Rocket, t: 'Campaign', key: 'campaign' }, { i: Calendar, t: 'Schedule', key: 'schedule' }, { i: Bell, t: 'Notify', key: 'notify' }].map(({ i: I, t, key }) => (
                    <TouchableOpacity key={key} style={STYLES.quickBtn} onPress={() => handleQuickAction(key)}><I size={13} color={theme.colors.primary} /><Text style={STYLES.quickText}>{t}</Text></TouchableOpacity>
                ))}
            </ScrollView>


            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={STYLES.inputBox}>
                <View style={STYLES.inputRow}>
                    <TextInput style={STYLES.input} placeholder={selectedLanguage.placeholder} placeholderTextColor={theme.colors.textTertiary} value={inputText} onChangeText={setInputText} onSubmitEditing={() => handleSend()} />
                    <TouchableOpacity style={STYLES.micBtn} onPress={openVoiceModal}><Mic size={15} color={theme.colors.textSecondary} /></TouchableOpacity>
                    <TouchableOpacity style={STYLES.sendBtn} onPress={() => handleSend()} disabled={!inputText.trim()}><LinearGradient colors={inputText.trim() ? ['#00D4FF', theme.colors.primary] : [theme.colors.surfaceLight, theme.colors.surfaceLight]} style={STYLES.sendGrad}><Send size={13} color={inputText.trim() ? '#FFF' : theme.colors.textTertiary} /></LinearGradient></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <VoiceModal />
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight },
    headerL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerR: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logo: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    headerT: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    refreshBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
    langText: { fontSize: 11, color: theme.colors.text, fontWeight: '500' },
    langDrop: { position: 'absolute', top: 58, right: 14, width: 165, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.surfaceLight, zIndex: 1000, elevation: 20 },
    langOpt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight },
    langOptActive: { backgroundColor: theme.colors.primary + '15' },
    langOptText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },

    welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
    welcomeT: { fontSize: 19, fontWeight: '700', color: theme.colors.text, marginTop: 22, textAlign: 'center' },
    welcomeS: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6, textAlign: 'center' },
    startBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22, marginTop: 20 },
    startText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
    caps: { flexDirection: 'row', marginTop: 28, gap: 14 },
    cap: { alignItems: 'center', gap: 6 },
    capIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    capText: { fontSize: 9, color: theme.colors.textSecondary, fontWeight: '600' },

    orbBox: { width: 190, height: 190, justifyContent: 'center', alignItems: 'center' },
    orbBoxSmall: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    wave: { position: 'absolute', borderWidth: 1.5, borderColor: theme.colors.primary },
    orbGlow: { position: 'absolute', overflow: 'hidden' },
    particles: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    particle: { position: 'absolute' },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
    orbCore: { overflow: 'hidden', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
    orbCoreGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    msgs: { flex: 1 },
    msgsContent: { padding: 10, paddingBottom: 50 },
    msgRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    userRow: { justifyContent: 'flex-end' },
    avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 5, overflow: 'hidden' },
    avatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '82%', padding: 9, borderRadius: 12 },
    botBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 3, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 3 },
    msgText: { fontSize: 12, lineHeight: 17, color: '#FFF' },
    speakBtn: { position: 'absolute', bottom: 3, right: 5 },

    thinking: { flexDirection: 'row', alignItems: 'center', paddingLeft: 29, gap: 6, marginBottom: 8 },
    dots: { flexDirection: 'row', gap: 2 },
    thinkingText: { fontSize: 11, color: theme.colors.textSecondary, fontStyle: 'italic' },

    quick: { paddingHorizontal: 8, paddingVertical: 6, maxHeight: 42 },
    quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surface, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, marginRight: 5, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    quickText: { fontSize: 10, color: theme.colors.text, fontWeight: '500' },

    inputBox: { padding: 8, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    micBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.surfaceLight },
    sendBtn: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
    sendGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    voiceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    voiceCard: { width: width * 0.88, backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, alignItems: 'center' },
    voiceClose: { position: 'absolute', top: 16, right: 16, padding: 4 },
    voiceHeader: { alignItems: 'center', marginBottom: 20 },
    voiceLang: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginBottom: 4 },
    voiceTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    voiceMicContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    voiceMicPulse: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.primary + '30' },
    voiceMicInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    voiceHint: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20 },
    voiceInputContainer: { width: '100%', marginBottom: 16 },
    voiceInput: { width: '100%', backgroundColor: theme.colors.background, borderRadius: 16, padding: 16, fontSize: 16, color: theme.colors.text, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.colors.surfaceLight },
    voiceInputNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 4 },
    voiceInputNoteText: { fontSize: 11, color: theme.colors.textTertiary },
    voiceSendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
    voiceSendBtnDisabled: { backgroundColor: theme.colors.surfaceLight },
    voiceSendText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});

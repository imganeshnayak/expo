import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Store, Bell, Settings, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const merchant = {
    name: "Joe's Coffee Shop",
    businessType: 'Café',
    email: 'joe@coffeeshop.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, San Francisco, CA 94102',
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Store, label: 'Business Information', action: () => {} },
        { icon: User, label: 'Personal Details', action: () => {} },
        { icon: Bell, label: 'Notifications', action: () => {} },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Settings, label: 'App Settings', action: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView>
        {/* Header */}
        <View style={{ backgroundColor: '#2563eb', paddingVertical: 32, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Store color="#2563eb" size={40} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 }}>
              {merchant.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#dbeafe' }}>{merchant.businessType}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={{ backgroundColor: '#ffffff', marginVertical: 16, marginHorizontal: 16, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Contact Information</Text>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Email: {merchant.email}</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Phone: {merchant.phone}</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Address: {merchant.address}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginHorizontal: 20, marginBottom: 8, textTransform: 'uppercase' }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' }}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={item.action}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                      borderBottomColor: '#f3f4f6',
                    }}
                  >
                    <Icon color="#6b7280" size={20} />
                    <Text style={{ flex: 1, fontSize: 16, color: '#111827', marginLeft: 12 }}>{item.label}</Text>
                    <ChevronRight color="#9ca3af" size={20} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            marginBottom: 32,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <LogOut color="#dc2626" size={20} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', marginLeft: 8 }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

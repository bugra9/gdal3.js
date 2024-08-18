import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createBottomSheetNavigator } from '@th3rdwave/react-navigation-bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AboutScreen from './screens/AboutScreen';
import AllFilesScreen from './screens/AllFilesScreen';
import ConvertScreen from './screens/ConvertScreen';
import SelectFilesScreen from './screens/SelectFilesScreen';
import InfoScreen from './screens/InfoScreen';
import LicensesScreen from './screens/Licenses';

const Tab = createBottomTabNavigator();
const BottomSheet = createBottomSheetNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={() => ({
                headerShown: false,
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}>
            <Tab.Screen
                name="SelectFiles"
                component={SelectFilesScreen}
                options={{
                    tabBarLabel: 'Input',
                    tabBarIcon: ({ focused, color, size }) => {
                        return <MaterialCommunityIcons name={focused ? 'upload' : 'upload-outline'} size={size} color={color} />;
                    },
                }}
            />
            <Tab.Screen
                name="Convert"
                component={ConvertScreen}
                options={{
                    tabBarLabel: 'Convert',
                    tabBarIcon: ({ focused, color, size }) => {
                        return <Ionicons name={focused ? 'construct' : 'construct-outline'} size={size} color={color} />;
                    },
                }}
            />
            <Tab.Screen
                name="AllFiles"
                component={AllFilesScreen}
                options={{
                    tabBarLabel: 'Output',
                    tabBarIcon: ({ focused, color, size }) => {
                        return <MaterialCommunityIcons name={focused ? 'download' : 'download-outline'} size={size} color={color} />;
                    },
                }}
            />
            <Tab.Screen
                name="About"
                component={AboutScreen}
                options={{
                    tabBarLabel: 'About',
                    tabBarIcon: ({ focused, color, size }) => {
                        return <MaterialCommunityIcons name={focused ? 'information' : 'information-outline'} size={size} color={color} />;
                    },
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <BottomSheet.Navigator
                        screenOptions={{ snapPoints: ['60%', '90%'] }}>
                        <BottomSheet.Screen
                            name="app"
                            component={TabNavigator}
                        />
                        <BottomSheet.Screen
                            name="InfoScreen"
                            component={InfoScreen}
                        />
                        <BottomSheet.Screen
                            name="Licenses"
                            component={LicensesScreen}
                            options={{ snapPoints: ['60%', '90%'] }}
                        />
                    </BottomSheet.Navigator>
                </NavigationContainer>
                <Toast topOffset={60} />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

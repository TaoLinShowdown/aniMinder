import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SeasonalList from './SeasonalList';
import FollowingList from './FollowingList';
import Settings from './Settings';
import { StoreContext } from '../store/store';
import { RootStackParamList } from '../common/types';

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Index() {
    const { changeFontsLoaded, 
            getSeasonalList, 
            getFollowingList, 
            changeFollowingNeedToReload,
            followingNeedToReload, 
        } = useContext(StoreContext);

    let [ fontsLoaded ] = useFonts({
        'Overpass-Black': require('../assets/fonts/Overpass-Black.ttf'),
        'Overpass-Regular': require('../assets/fonts/Overpass-Regular.ttf'),
        'Overpass-Bold': require('../assets/fonts/Overpass-Bold.ttf'),
        'Overpass-SemiBold': require('../assets/fonts/Overpass-SemiBold.ttf'),
    });
    let [ loaded, setLoaded ] = useState(false); 

    useEffect(() => {
        console.log("fonts were loaded", fontsLoaded);
        changeFontsLoaded(fontsLoaded);
    }, [fontsLoaded])

    useEffect(() => {
        if (!loaded) {
            setLoaded(true);
            getFollowingList();
            getSeasonalList();
        }
    })

    if (fontsLoaded) {
        return (
            <NavigationContainer
                onStateChange={(state) => {
                    if (state && state?.index === 0 && followingNeedToReload) {
                        changeFollowingNeedToReload(false);
                        getFollowingList();
                    }
                }}>
                <Tab.Navigator
                    initialRouteName="Following"
                    tabBarOptions={{
                        activeTintColor: "#324275",
                        labelPosition: 'below-icon',
                        allowFontScaling: false
                    }}
                    sceneContainerStyle={{
                        backgroundColor: "rgb(237,241,245)"
                    }}>
    
                    <Tab.Screen
                        options={{
                            tabBarIcon: ({ focused, color, size }) => {
                                return <Ionicons name={focused ? 'bookmarks' : 'bookmarks-outline'} size={size} color={color} />;
                            }
                        }}
                        name="Following"
                        component={FollowingList}
                    />
    
                    <Tab.Screen
                        options={{
                            tabBarIcon: ({ focused, color, size }) => {
                                return <Ionicons name={focused ? 'tv' : 'tv-outline'} size={size} color={color} />;
                            },
                            title: "Seasonal List"
                        }}
                        name="Seasonal"
                        component={SeasonalList}
                    />
    
                    <Tab.Screen 
                        options={{
                            tabBarIcon: ({ focused, color, size }) => {
                                return <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />;
                            }
                        }}
                        name="Settings"
                        component={Settings}
                    />
                </Tab.Navigator> 
            </NavigationContainer>
        );
    } else {
        return (
            <View></View>
        );
    }
}


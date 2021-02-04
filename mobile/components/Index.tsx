import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';

import SeasonalList from './SeasonalList';
import FollowingList from './FollowingList';
import Settings from './Settings';
import { StoreContext } from '../store/store';
import { RootStackParamList, anime } from '../common/types';

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function Index() {
    const { changeFontsLoaded, 
            getFollowingList, 
            changeFollowingNeedToReload,
            followingNeedToReload, 
            followingData,
        } = useContext(StoreContext);

    let [ fontsLoaded ] = useFonts({
        'Overpass-Black': require('../assets/fonts/Overpass-Black.ttf'),
        'Overpass-Regular': require('../assets/fonts/Overpass-Regular.ttf'),
        'Overpass-Bold': require('../assets/fonts/Overpass-Bold.ttf'),
        'Overpass-SemiBold': require('../assets/fonts/Overpass-SemiBold.ttf'),
    });
    let [ loaded, setLoaded ] = useState(false); 

    useEffect(() => {
        changeFontsLoaded(fontsLoaded);
    }, [fontsLoaded])

    useEffect(() => {
        if (!loaded) {
            console.log("APP STARTED UP, LOADING NOTIFICATIONS");
            setLoaded(true);
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                    allowAnnouncements: true,
                }
            })
            Notifications.setNotificationHandler({
                handleNotification: async (notif) => {
                    let theAnime: anime = followingData.filter(anime => `${anime.id}` === notif.request.identifier)[0];
                    if (theAnime.nextAiringEpisode !== null && (new Date(theAnime.nextAiringEpisode.airingAt * 1000) > (new Date()))) {
                        console.log(`SCHEDULING NEXT NOTIFICATION FOR ${theAnime.title.english}`);
                        Notifications.scheduleNotificationAsync({
                            identifier: notif.request.identifier,
                            content: {
                                title: `${theAnime.title.english} ep ${theAnime.nextAiringEpisode.episode} is airing now!`
                            },
                            trigger: new Date(theAnime.nextAiringEpisode.airingAt * 1000)
                        })
                    }
                    return {
                        shouldShowAlert: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    }
                },
            });
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


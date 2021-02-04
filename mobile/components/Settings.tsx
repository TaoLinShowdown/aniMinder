import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { asyncSettings, anime } from '../common/types';
import { StoreContext } from '../store/store';

export default function Settings() {
    let [ notifToggle, setNotifToggle ] = useState<boolean>(true);
    let [ hideToggle, setHideToggle ] = useState<boolean>(false);
    let [ loaded, setLoaded ] = useState<boolean>(false);

    const { followingData } = useContext(StoreContext);

    useEffect(() => {
        if (!loaded) {
            setLoaded(true);
            (async () => {
                const settings = await AsyncStorage.getItem('aniMinder-settings');
                if (settings === null) {
                    await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                        enableNotif: true,
                        hide: false
                    }));
                } else {
                    let s = JSON.parse(settings);
                    setNotifToggle(s.enableNotif);
                    setHideToggle(s.hide);
                }
            })();
        }
    })

    useEffect(() => {
        if (!notifToggle) {
            console.log("NO NOTIFICATIONS")
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                })
            })
        } else {
            console.log("YES NOTIFICATIONS")
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
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: !s.enableNotif,
                    hide: s.hide
                }));
            }
        })();
    }, [notifToggle])

    const toggleNotif = () => {
        setNotifToggle(!notifToggle);   
    }

    const toggleHide = () => {
        setHideToggle(!hideToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: s.enableNotif,
                    hide: !s.hide
                }));
            }
        })();
    }

    return (
        <View style={{flex: 1, alignItems: 'center'}}>
            <Nav />
            <View style={{
                ...styles.optionContainer,
                marginTop: 170,
            }}>
                <Text style={styles.optionName} >Enable notifications</Text>
                <Switch style={styles.switch} onValueChange={toggleNotif} value={notifToggle} />
            </View>
            <View style={{
                ...styles.optionContainer
            }}>
                <Text style={styles.optionName} >Hide finished shows</Text>
                <Switch style={styles.switch} onValueChange={toggleHide} value={hideToggle} />
            </View>
        </View>
    );
}

const Nav = () => {
    return (
        <View style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 150,
            backgroundColor: '#2b2d42',
        }}>
            <Text style={{
                color: '#fff',
                fontFamily: 'Overpass-Bold',
                position: 'absolute',
                left: 13,
                bottom: 10,
                fontSize: 38,
            }}>
                Settings
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    optionContainer: {
        width: '100%',
        height: 42,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderColor: 'rgb(240, 240, 240)',
    },
    optionName: {
        fontFamily: 'Overpass-Regular',
        fontSize: 16,
        color: 'rgb(110, 110, 110)'
    },
    switch: {
        transform: [{ scaleX: .95 }, { scaleY: .95 }]
    },
})
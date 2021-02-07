import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Switch, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { asyncSettings, anime } from '../common/types';
import { StoreContext } from '../store/store';

export default function Settings() {
    let [ notifToggle, setNotifToggle ] = useState<boolean>(true);
    let [ hideToggle, setHideToggle ] = useState<boolean>(false);
    let [ delayToggle, setDelayToggle ] = useState<boolean>(false);
    let [ delay, setDelay ] = useState<Date>(new Date(1970, 12, 1, 0, 1, 0));
    let [ loaded, setLoaded ] = useState<boolean>(false);

    const { followingData, getFollowingList, scheduleNotification } = useContext(StoreContext);

    useEffect(() => {
        if (!loaded) {
            setLoaded(true);
            (async () => {
                const settings = await AsyncStorage.getItem('aniMinder-settings');
                if (settings === null) {
                    await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                        enableNotif: true,
                        hide: false,
                        enableDelay: false,
                        delay: 0
                    }));
                } else {
                    let s: asyncSettings = JSON.parse(settings);
                    setNotifToggle(s.enableNotif);
                    setHideToggle(s.hide);
                    setDelayToggle(s.enableDelay);
                    let hm = dh(s.delay * 1000);
                    setDelay(new Date(1970, 12, 1, hm[1], hm[2], 0));
                }
            })();
        }
    })

    useEffect(() => {
        if (!notifToggle) {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                })
            })
        } else {
            Notifications.setNotificationHandler({
                handleNotification: async (notif) => {
                    let anime: anime = followingData.filter(anime => `${anime.id}` === notif.request.identifier)[0];
                    scheduleNotification(anime);
                    return {
                        shouldShowAlert: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    }
                },
            });
        }
    }, [notifToggle])

    const handleDelayChange = (date: Date) => {
        let hours = date.getHours(), minutes = date.getMinutes();
        console.log(`Delay set to ${hours} hours and ${minutes} minutes`);
        (async () => {
            let seconds = (hours * 3600) + (minutes * 60);
            setDelay(new Date(1970, 12, 1, hours, minutes, 0));
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: s.enableNotif,
                    hide: s.hide,
                    enableDelay: s.enableDelay,
                    delay: seconds
                }));
                // reschedule all notifications
                await Notifications.cancelAllScheduledNotificationsAsync();
                getFollowingList();
            } 
        })();
    }

    const toggleNotif = () => {
        setNotifToggle(!notifToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: !s.enableNotif,
                    hide: s.hide,
                    enableDelay: s.enableDelay,
                    delay: s.delay
                }));
            }
        })();
    }

    const toggleHide = () => {
        setHideToggle(!hideToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: s.enableNotif,
                    hide: !s.hide,
                    enableDelay: s.enableDelay,
                    delay: s.delay
                }));
            }
        })();
    }

    const toggleDelay = () => {
        setDelayToggle(!delayToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s: asyncSettings = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: s.enableNotif,
                    hide: s.hide,
                    enableDelay: !s.enableDelay,
                    delay: s.delay
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
                <Text style={styles.optionName}>Enable notifications</Text>
                <Switch style={styles.switch} onValueChange={toggleNotif} value={notifToggle} />
            </View>
            <View style={styles.optionContainer}>
                <Text style={styles.optionName}>Hide finished shows</Text>
                <Switch style={styles.switch} onValueChange={toggleHide} value={hideToggle} />
            </View>
            <View style={delayToggle ? styles.optionContainer : {...styles.optionContainer, borderBottomWidth: 1}}>
                <Text style={styles.optionName}>Notification delay</Text>
                <Switch style={styles.switch} onValueChange={toggleDelay} value={delayToggle} />
            </View>
            {delayToggle && <View style={{...styles.dateContainer, borderBottomWidth: 1}}>
                <DateTimePicker style={{flex: 1}} mode="countdown" display="spinner" onChange={(e, date) => {handleDelayChange(date as Date)}} value={delay}/>
            </View>}
            {/* <Button title="show notifications" onPress={() => {
                Notifications.getAllScheduledNotificationsAsync().then(notifs => {
                    if (notifs.length !== 0) {
                        console.log("PRINTING ALL NOTIFICATIONS");
                    } else {
                        console.log("NO NOTIFICATIONS SCHEDULED");
                    }
                    notifs.forEach(n => {
                        let id = n.identifier;
                        let anime: anime = followingData.filter(anime => `${anime.id}` === id)[0];
                        console.log(`   [${id}] ${anime.title.english} in ${n.trigger.seconds/3600} hours`);
                    })
                })
            }}/>
            <Button title="clear notifications" onPress={() => {
                Notifications.cancelAllScheduledNotificationsAsync();
            }} /> */}
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
    dateContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
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

function dh(t: number){
    let cd = 24 * 60 * 60 * 1000,
    ch = 60 * 60 * 1000,
    d = Math.floor(t / cd),
    h = Math.floor( (t - d * cd) / ch),
    m = Math.round( (t - d * cd - h * ch) / 60000)
    if( m === 60 ){
        h++;
        m = 0;
    }
    if( h === 24 ){
        d++;
        h = 0;
    }
    return [d, h, m];
}
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
    let [ notifToggle, setNotifToggle ] = useState<boolean>(true);
    let [ hideToggle, setHideToggle ] = useState<boolean>(false);
    let [ loaded, setLoaded ] = useState<boolean>(false);

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

    const toggleNotif = () => {
        setNotifToggle(!notifToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s = JSON.parse(settings);
                await AsyncStorage.setItem('aniMinder-settings', JSON.stringify({
                    enableNotif: !s.enableNotif,
                    hide: s.hide
                }));
            }
        })();
    }

    const toggleHide = () => {
        setHideToggle(!hideToggle);
        (async () => {
            const settings = await AsyncStorage.getItem('aniMinder-settings');
            if (settings !== null) {
                let s = JSON.parse(settings);
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
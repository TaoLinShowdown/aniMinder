import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { StoreContext } from '../store/store';

export default function Settings() {
    const { followingData } = useContext(StoreContext);

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Nav />
            <View>
                
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
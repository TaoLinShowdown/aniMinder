import React, { useContext, useState } from 'react';
import { View, Button, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import { StoreContext } from '../store/store';
import { anime } from '../common/types';

export default function Settings() {
    const { followingData } = useContext(StoreContext);
    const [ notifs, setNotifs ] = useState<Notifications.NotificationRequest[]>([]);

    const handlePress = () => {
        Notifications.cancelAllScheduledNotificationsAsync();
    }

    const handlePrint = async () => {
        console.log("PRINTING ALL SCHEDULED NOTIFICATIONS")
        let scheduled = await Notifications.getAllScheduledNotificationsAsync();
        setNotifs(scheduled);
        scheduled.forEach(notif => {
            let anime: anime = followingData.filter(anime => notif.identifier === `${anime.id}`)[0];
            console.log(`   [${notif.identifier}] ${anime.title.english} in ${(notif.trigger.seconds/3600).toPrecision(4)} hours`);
        });
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button 
                title="clear scheduled nofications"
                onPress={handlePress}
            />
            <Button 
                title="print all scheduled notifications"
                onPress={handlePrint}
            />
            {notifs.map(notif => {
                let anime: anime = followingData.filter(anime => notif.identifier === `${anime.id}`)[0];
                return (
                    <View key={anime.id}>
                        <Text>{`${anime.title.english?.substring(0, 25)} in ${(notif.trigger.seconds/3600).toPrecision(4)} hours`}</Text>
                    </View>
                )
            })}
        </View>
    );
}
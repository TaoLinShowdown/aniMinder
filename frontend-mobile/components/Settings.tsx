import React, { useContext } from 'react';
import { View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { StoreContext } from '../store/store';
import { anime } from '../common/types';

export default function Settings() {
    const { animeData } = useContext(StoreContext)

    const handlePress = () => {
        Notifications.cancelAllScheduledNotificationsAsync();
    }

    const handlePrint = async () => {
        console.log("PRINTING ALL SCHEDULED NOTIFICATIONS")
        let scheduled = await Notifications.getAllScheduledNotificationsAsync();
        scheduled.forEach(notif => {
            let anime: anime = animeData.filter(anime => notif.identifier === `${anime.id}`)[0];
            console.log(`   [${notif.identifier}] ${anime.title.english} in ${notif.trigger.seconds/3600} hours`);
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
        </View>
    );
}
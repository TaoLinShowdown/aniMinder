import React, { useContext, useRef, useState } from 'react';
import { Animated, View, FlatList, Image, Text } from 'react-native';
import AnimeCard from './AnimeCard';
import { StoreContext } from '../store/store';
import SeasonalListNav from './SeasonalListNav';

export default function SeasonalList() {

    const { animeData, seasonalScrollOffsetY, listLoading, getSeasonalList } = useContext(StoreContext);
    const [ notifAnimeName, setNotifAnimeName ] = useState<String>("");
    let flatListRef = useRef<FlatList | null>(null);

    const headerComponent = () => 
    <Image style={{ width: 60, height: 60 }} source={require('../assets/Spin-1s-200px.gif')}/>

    const emptyComponent = () => 
    <View style={{
        flex: 1,
        paddingTop: 200,
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <Text style={{
            fontFamily: 'Overpass-Bold',
            fontSize: 20,
            color: 'rgb(110,133,158)',
        }}>
            Loading...
        </Text>
    </View>

    const notifTranslateYAnim = useRef<Animated.Value>(new Animated.Value(0));
    const notifAnim = () => {
        Animated.stagger(1500, [
            Animated.sequence([
                Animated.timing(notifTranslateYAnim.current, {
                    toValue: -83,
                    duration: 200,
                    useNativeDriver: false
                }),
                Animated.timing(notifTranslateYAnim.current, {
                    toValue: -80,
                    duration: 50,
                    useNativeDriver: false
                })
            ]),
            Animated.timing(notifTranslateYAnim.current, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            })
        ]).start();
    }

    const Notif = () => {
        return (
            <Animated.View style={{
                position: 'absolute',
                backgroundColor: 'hsl(100, 46%, 44%)',
                width: 300,
                height: 40,
                bottom: -90,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 13,
                marginBottom: 20,
                borderRadius: 30,
                shadowOpacity: 0.3,
                shadowOffset: {
                    width: 0,
                    height: 0
                },
                transform: [
                    { translateY: notifTranslateYAnim.current }
                ],
            }}>
                <Text numberOfLines={1} style={{color: 'white'}}>Added {notifAnimeName}</Text>
            </Animated.View>
        );
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <SeasonalListNav season="Winter" year="2021" flatListRef={flatListRef} />
            <FlatList 
                contentContainerStyle={{
                    backgroundColor: 'rgb(237,241,245)',
                    paddingTop: 20
                }}
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: seasonalScrollOffsetY } } }], { useNativeDriver: false })}
                data={animeData}
                ListHeaderComponent={headerComponent}
                ListHeaderComponentStyle={{ alignItems: 'center', paddingBottom: 70 }}
                ListEmptyComponent={emptyComponent}
                renderItem={item => <AnimeCard type={"Add"} animeData={item.item} startAnimation={notifAnim} setAnimeName={setNotifAnimeName} />}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                updateCellsBatchingPeriod={100}
                keyExtractor={item => item.id.toString()}
                onRefresh={getSeasonalList}
                refreshing={listLoading}
                ref={flatListRef}
            />
            <Notif/>
        </View>
    );
}

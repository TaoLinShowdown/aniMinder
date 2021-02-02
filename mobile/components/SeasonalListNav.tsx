import React, { useContext } from 'react';
import { Animated, ActionSheetIOS, TextInput, NativeSyntheticEvent, TextInputEndEditingEventData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreContext } from '../store/store';
import { H_MAX_HEIGHT, H_MIN_HEIGHT } from '../common/constants';
import { SeasonalListNavProps } from '../common/types';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SeasonalListNav({ flatListRef }: SeasonalListNavProps) {
    const { seasonalScrollOffsetY, 
            seasonYear,
            changeSeasonalOrder,
            changeQuery,
            changeSeasonYear
        } = useContext(StoreContext);

    const headerScrollHeight = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50, 110],
        outputRange: [H_MAX_HEIGHT, H_MAX_HEIGHT, H_MIN_HEIGHT],
        extrapolate: "clamp"
    });
    const fontScale = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50, 110],
        outputRange: [1, 1, 0.7],
        extrapolate: 'clamp'
    });
    const anchorX = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50, 110],
        outputRange: [0, 0, -30],
        extrapolate: 'clamp'
    });
    const anchorY = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50, 110],
        outputRange: [0, 0, 14],
        extrapolate: 'clamp'
    });
    const opacityAnimated = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50, 110],
        outputRange: [1, 1, 0.93],
        extrapolate: 'clamp'
    });
    const searchBarPos = seasonalScrollOffsetY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, -50],
    })

    const openSort = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: [
                    "Cancel", 
                    "Title (A-Z)", 
                    "Title (Z-A)",
                    "Airing Date",
                    "Score",
                    "Number of Episodes"
                ],
                cancelButtonIndex: 0,
                title: "Sort by:"
            },
            btnIndex => {
                if (btnIndex === 1) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeSeasonalOrder(["TITLE", "false"]);
                } else if (btnIndex === 2) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeSeasonalOrder(["TITLE", "true"]);
                } else if (btnIndex === 3) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeSeasonalOrder(["AIRING", "false"]);
                } else if (btnIndex === 4) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeSeasonalOrder(["SCORE", "true"]);
                } else if (btnIndex === 5) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeSeasonalOrder(["EPISODES", "false"]);
                }
            }
        )
    }

    const selectSeason = () => {
        ActionSheetIOS.showActionSheetWithOptions({
            cancelButtonIndex: 0,
            options: [
                "Cancel",
                "Winter 2021",
                "Fall 2020",
                "Summer 2020",
                "Spring 2020",
                "Winter 2020"
            ]
        },
        btnIndex => {
            if (btnIndex === 1) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                changeSeasonYear(["WINTER", "2021"]);
            } else if (btnIndex === 2) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                changeSeasonYear(["FALL", "2020"]);
            } else if (btnIndex === 3) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                changeSeasonYear(["SUMMER", "2020"]);
            } else if (btnIndex === 4) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                changeSeasonYear(["SPRING", "2020"]);
            } else if (btnIndex === 5) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                changeSeasonYear(["WINTER", "2020"]);
            }
        })
    }

    const handleSearch = (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
        changeQuery(e.nativeEvent.text);
    }


    return (
        <React.Fragment>
            <Animated.View style={{
                backgroundColor: '#2b2d42',
                alignItems: 'center',
                justifyContent: 'center',
                top: 0,
                width: '100%',
                position: 'absolute',
                zIndex: 999,
                opacity: opacityAnimated,
                height: headerScrollHeight,
            }}>
                
                <Animated.View style={{
                    position: 'absolute',
                    left: 13,
                    bottom: 10,
                    transform: [
                        { scale: fontScale },
                        { translateX: anchorX },
                        { translateY: anchorY }
                    ]
                }}>
                    <TouchableOpacity onPress={selectSeason} style={{
                        flex: 1,
                        flexDirection: 'row',
                    }}>
                        <Animated.Text style={{
                            color: '#fff',
                            fontFamily: 'Overpass-Bold',
                            fontSize: 40,
                        }}>
                            {seasonYear[0].charAt(0) + seasonYear[0].toLowerCase().slice(1)}
                        </Animated.Text>
                        <Animated.Text style={{
                            color: 'rgb(110,133,158)',
                            fontFamily: 'Overpass-Bold',
                            fontSize: 16,
                            paddingTop: 23,
                        }}>
                            {seasonYear[1]}
                        </Animated.Text>
                        <Ionicons name="caret-down-outline" color="rgb(110,133,158)" size={16} style={{
                            paddingTop: 25,
                            paddingLeft: 4
                        }}/>
                    </TouchableOpacity>
                </Animated.View>
                
                <TouchableOpacity onPress={openSort} containerStyle={{
                    position: 'absolute',
                    right: 10,
                    top: 53
                }}>
                    <Ionicons name="swap-vertical" color="white" size={28} />
                </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{
                height: 40,
                width: '98%',
                margin: 6,
                shadowOpacity: 0.1,
                shadowOffset: {
                    width: 0,
                    height: 3
                },
                position: 'absolute',
                top: 149,
                zIndex: 998,
                opacity: 1,
                transform: [
                    { translateY: searchBarPos }
                ]
            }}>
                <TextInput 
                    placeholder="Search for title"
                    onEndEditing={handleSearch}
                    style={{
                        height: 40,
                        width: '100%',
                        padding: 10,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        fontFamily: 'Overpass-Regular',
                    }} 
                    autoCorrect={false}
                />
            </Animated.View>
        </React.Fragment>
    )
}
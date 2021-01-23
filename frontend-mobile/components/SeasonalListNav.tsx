import React, { useContext } from 'react';
import { View, Animated, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreContext } from '../store/store';
import { H_MAX_HEIGHT, H_MIN_HEIGHT, H_SCROLL_DISTANCE } from '../common/constants';
import { SeasonalListNavProps } from '../common/types';

export default function SeasonalListNav({ season, year, flatListRef }: SeasonalListNavProps) {

    let { seasonalScrollOffsetY, changeSeasonalOrder } = useContext(StoreContext);
    const headerScrollHeight = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
        extrapolate: "clamp"
    });
    const fontScale = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [1, 0.7],
        extrapolate: 'clamp'
    });
    const anchorX = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [0, -30],
        extrapolate: 'clamp'
    });
    const anchorX2 = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [0, -63],
        extrapolate: 'clamp'
    });
    const anchorY = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [0, 14],
        extrapolate: 'clamp'
    });
    const opacityAnimated = seasonalScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [1, 0.93],
        extrapolate: 'clamp'
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

    return (
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
                flex: 1,
                flexDirection: 'row',
                position: 'absolute',
                left: 13,
                bottom: 10,
            }}>
                <Animated.Text style={{
                    color: '#fff',
                    fontFamily: 'Overpass-Bold',
                    fontSize: 40,
                    transform: [
                        { scale: fontScale },
                        { translateX: anchorX },
                        { translateY: anchorY },
                    ],
                }}>
                    {season}
                </Animated.Text>
                <Animated.Text style={{
                    color: 'rgb(110,133,158)',
                    fontFamily: 'Overpass-Bold',
                    fontSize: 16,
                    paddingTop: 23,
                    transform: [
                        { scale: fontScale },
                        { translateX: anchorX2 },
                        { translateY: anchorY },
                    ],
                }}>
                    {year}
                </Animated.Text>
            </Animated.View>

            <Ionicons name="swap-vertical" color="white" size={28} 
            onPress={openSort}
            style={{
                position: 'absolute',
                right: 10,
                top: 53
            }} />
        </Animated.View>
    )
}
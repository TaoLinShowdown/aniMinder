import React, { useContext } from 'react';
import { Animated, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreContext } from '../store/store';
import { FollowingListNavProps } from '../common/types'
import { H_MAX_HEIGHT, H_MIN_HEIGHT, H_SCROLL_DISTANCE } from '../common/constants';

export default function FollowingListNav({ flatListRef }: FollowingListNavProps) {
    const { followingScrollOffsetY, 
            changeFollowingOrder 
        } = useContext(StoreContext);

    const headerScrollHeight = followingScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
        extrapolate: "clamp"
    });
    const fontScale = followingScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [1, 0.7],
        extrapolate: 'clamp'
    });
    const anchorX = followingScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [0, -30],
        extrapolate: 'clamp'
    });
    const anchorY = followingScrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [0, 17],
        extrapolate: 'clamp'
    });
    const opacityAnimated = followingScrollOffsetY.interpolate({
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
                    changeFollowingOrder(["TITLE", "false"]);
                } else if (btnIndex === 2) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeFollowingOrder(["TITLE", "true"]);
                } else if (btnIndex === 3) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeFollowingOrder(["AIRING", "false"]);
                } else if (btnIndex === 4) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeFollowingOrder(["SCORE", "true"]);
                } else if (btnIndex === 5) {
                    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                    changeFollowingOrder(["EPISODES", "false"]);
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
            
            <Animated.Text style={{
                color: '#fff',
                fontFamily: 'Overpass-Bold',
                position: 'absolute',
                left: 13,
                bottom: 10,
                fontSize: 38,
                transform: [
                    { scale: fontScale },
                    { translateX: anchorX },
                    { translateY: anchorY },
                ],
                paddingTop: 30,
            }}>
                Following
            </Animated.Text>

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
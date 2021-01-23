import React, { memo, useContext, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { anime, AnimeCardProps } from '../common/types';
import { StoreContext } from '../store/store';

export default memo<AnimeCardProps>(props => {
    let { fontsLoaded, followAnime, unfollowAnime } = useContext(StoreContext);
    let animeData: anime = props.animeData;
    let title: string | null = animeData.title.english === null ? animeData.title.romaji === null ? animeData.title.native : animeData.title.romaji : animeData.title.english;
    let studioList: string[] = [];
    animeData.studios.nodes.forEach(studio => {studioList.push(studio.name);});

    let currEp = "";
    let airingIn = "";
    let weekday = "";
    if (animeData.nextAiringEpisode !== null) {
        currEp = `Ep ${animeData.nextAiringEpisode.episode}`;
        if (animeData.episodes !== null && animeData.episodes !== 0) {currEp += ` of ${animeData.episodes}`;}
        currEp += " airing in"
        let airingInHoursMinutesList = dh((animeData.nextAiringEpisode.airingAt * 1000) - Date.now());
        airingIn = `${ airingInHoursMinutesList[0] !== 0 ? airingInHoursMinutesList[0] + " days, " : "" }${airingInHoursMinutesList[1]} hours`;
        weekday = days[(new Date(animeData.nextAiringEpisode.airingAt * 1000)).getDay()]
    } else {
        weekday = "NO DATA";
    }

    let swipeRef = useRef<Swipeable | null>(null);
    
    let fadeOutAnim = useRef<Animated.Value>(new Animated.Value(1));
    let fadeOut = (callback: () => void) => {
        Animated.timing(fadeOutAnim.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start(({finished}) => {
            callback();
        });
    }

    const handleFollow = () => {
        props.setAnimeName(title as string);
        followAnime([animeData.id], () => {
            swipeRef.current?.close();
            props.startAnimation();
        });
    }

    const handleUnfollow = () => {
        fadeOut(() => {
            props.setAnimeName(title as string);
            unfollowAnime([animeData.id], () => {
                swipeRef.current?.close();
                props.startAnimation();
            });
        });
    }

    const swipeLeftActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
        let widthAnimated = dragX.interpolate({
            inputRange: [0, 70],
            outputRange: [-70, 0]
        })
        let scaleAnimated = dragX.interpolate({
            inputRange: [0, 70, 140],
            outputRange: [1, 1, 3]
        });
        let scaleAnimatedInv = dragX.interpolate({
            inputRange: [0, 70, 140],
            outputRange: [1, 1, 0]
        });
        return (
            <Animated.View style={{
                width: 70,
                opacity: fadeOutAnim.current,
                transform: [
                    { translateX: widthAnimated },
                    { scaleX: scaleAnimated },
                ]
            }}>
                <TouchableOpacity onPress={() => {
                    if (props.type === "Add") {
                        handleFollow();
                    } else if (props.type === "Delete") {
                        handleUnfollow();
                    }
                }} 
                style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: props.type === "Add" ? 'hsl(100, 46%, 44%)' : 'hsl(0,82%,65%)',
                }}>

                    {props.type === "Add" ? 
                        <Animated.Text style={{
                            transform: [
                                {scaleX: scaleAnimatedInv }
                            ],
                            fontFamily: 'Overpass-Regular',
                            fontSize: 30,
                            color: 'white'
                        }}>
                            +
                        </Animated.Text>
                    :
                        <Animated.View style={{
                            transform: [
                                {scaleX: scaleAnimatedInv }
                            ]
                        }}>
                            <Ionicons name="trash-bin" size={30} color="white" />
                        </Animated.View>
                    }

                    <Animated.Text style={{
                        transform: [
                            {scaleX: scaleAnimatedInv }
                        ],
                        fontFamily: 'Overpass-Bold',
                        fontSize: 10,
                        color: 'white'
                    }}>
                        {props.type === "Add" ? "Follow" : "Unfollow"}
                    </Animated.Text>  
                </TouchableOpacity>
            </Animated.View>
        );
    }    

    if (!fontsLoaded) {
        return <View style={styles.container}><Image style={styles.image} source={{uri: animeData.coverImage.large}}/></View>
    }
    return (
        <Swipeable 
            renderLeftActions={(prog, dragx) => swipeLeftActions(prog, dragx)}
            overshootLeft={false}
            overshootFriction={10} 
            ref={swipeRef} >
            <Animated.View style={{
                ...styles.container,
                opacity: fadeOutAnim.current,
            }}>
                <Image style={styles.image} source={{uri: animeData.coverImage.large}}/>

                <View style={styles.description}>
                    <View style={styles.titleHolder}>
                        <Text numberOfLines={2} style={styles.title}>{title}</Text>
                        <View style={styles.studioAndScore}>
                            <Text style={styles.studio}>{studioList.join(", ")}</Text>
                            <Text style={styles.score}>★ {animeData.averageScore/10}</Text>
                        </View>
                    </View>

                    <View style={styles.timingHolder}>
                        <Text style={styles.currEp}>{currEp}</Text>
                        <Text style={styles.airingIn}>{airingIn}</Text>
                    </View>

                    <View style={styles.weekdayHolder}>
                        <Text style={styles.weekday}>{weekday}</Text>
                    </View>
                </View>
            </Animated.View>
        </Swipeable>
    )
})    

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: 130,
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 0
        },
    },

    image: {
        width: "24%",
        height: 130
    },

    description: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: "76%",
    },

    titleHolder: {
        backgroundColor: 'rgb(41,41,41)',
        opacity: 0.6,
        padding: 10,
        maxHeight: 80
    },

    title: {
        fontSize: 15,
        fontFamily: 'Overpass-Bold',
        color: '#fff',
        overflow: 'hidden',
    },

    studioAndScore: {
        flexDirection: 'row'
    },
    studio: {
        fontSize: 12,
        fontFamily: 'Overpass-SemiBold',
        color: 'hsl(185,99%,42%)'
    },
    score: {
        fontSize: 12,
        fontFamily: 'Overpass-SemiBold',
        color: 'hsl(47, 81%, 46%)',
        paddingHorizontal: 6
    },

    timingHolder: {
        padding: 10
    },
    currEp: {
        fontSize: 12,
        fontFamily: 'Overpass-SemiBold',
        color: 'rgb(110,133,158)'
    },
    airingIn: {
        fontSize: 16,
        fontFamily: 'Overpass-SemiBold',
        color: 'rgb(110,133,158)'
    },

    weekdayHolder: {
        position: 'absolute',
        right: -4,
        bottom: -17
    },
    weekday: {
        fontSize: 60,
        fontFamily: 'Overpass-Black',
        color: 'rgb(110,133,158)',
        opacity: 0.3
    }
});

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
    return [d, h];
}

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
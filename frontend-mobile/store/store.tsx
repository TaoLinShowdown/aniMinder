import { createContext, useCallback, useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Constants from 'expo-constants';
import { storeType, anime } from '../common/types';
import { api_url } from '../common/constants';
import * as Notifications from 'expo-notifications';

const initialData: storeType = {
    changeFontsLoaded: () => null,
    getSeasonalList: () => null,
    getFollowingList: () => null,
    changeSeasonalOrder: () => null,
    changeFollowingOrder: () => null,
    changeSeasonYear: () => null,
    followAnime: () => null,
    unfollowAnime: () => null,
    changeFollowingNeedToReload: () => null,
    changeQuery: () => null,
    animeData: [],
    animeDataDisplayed: [],
    followingData: [],
    listLoading: false,
    followingLoading: false,
    followingNeedToReload: false,
    fontsLoaded: false,
    seasonalScrollOffsetY: new Animated.Value(0),
    followingScrollOffsetY: new Animated.Value(0),
    seasonYear: [],
    query: "",
}

export const StoreContext = createContext<storeType>(initialData);

export function useStoreContextValue(): storeType {
    const [ animeData, setAnimeData ] = useState<anime[]>([]);
    const [ animeDataDisplayed, setAnimeDataDisplayed ] = useState<anime[]>([]);
    const [ followingData, setFollowingData ] = useState<anime[]>([]);
    const [ fontsLoaded, setFontsLoaded ] = useState<boolean>(false);
    const [ listLoading, setListLoading ] = useState<boolean>(false);
    const [ followingLoading, setFollowingLoading ] = useState<boolean>(false);
    const [ followingNeedToReload, setFollowingNeedToReload ] = useState<boolean>(false);
    const [ seasonalSortOrder, setSeasonalSortOrder ] = useState<string[]>(["TITLE", "false"]);
    const [ followingSortOrder, setFollowingSortOrder ] = useState<string[]>(["AIRING", "false"]);
    const [ seasonYear, setSeasonYear ] = useState<string[]>(["SPRING", "2020"]);
    const [ query, setQuery ] = useState<string>("");
    const seasonalScrollOffsetY = useRef(new Animated.Value(0)).current;
    const followingScrollOffsetY = useRef(new Animated.Value(0)).current;

    const changeFontsLoaded = useCallback((bool: boolean) => {
        setFontsLoaded(bool);
    }, [setFontsLoaded]);

    const changeSeasonalOrder = useCallback((order: string[]) => {
        setSeasonalSortOrder(order);
    }, [setSeasonalSortOrder]);

    const changeFollowingOrder = useCallback((order: string[]) => {
        setFollowingSortOrder(order);
    }, [setFollowingSortOrder]);

    const changeFollowingNeedToReload = useCallback((reload: boolean) => {
        setFollowingNeedToReload(reload);
    }, [setFollowingNeedToReload]);

    const changeSeasonYear = useCallback((sy: string[]) => {
        setSeasonYear(sy);
    }, [setSeasonYear])

    const changeQuery = useCallback((q: string) => {
        setQuery(q);
    }, [setQuery])

    const generateDisplayData = useCallback(() => {
        if(query === "") {
            setAnimeDataDisplayed(animeData);
        } else {
            setAnimeDataDisplayed(animeData.filter((anime: anime) => {
                return (anime.title.english !== null && anime.title.english.includes(query)) ||
                        (anime.title.romaji !== null && anime.title.romaji.includes(query)) ||
                        (anime.title.native !== null && anime.title.native.includes(query));
            }))
        }
    }, [setAnimeDataDisplayed, animeData, query])

    const getSeasonalList = useCallback(() => {
        setListLoading(true);
        let url = `${api_url}/getSeason?season=${seasonYear[0]}&seasonYear=${seasonYear[1]}&sort=${seasonalSortOrder[0]}&reverse=${seasonalSortOrder[1]}`;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: null
        };
        fetch(url, options)
        .then(response => response.json())
        .then(data => {
            console.log("SEASON API CALL", seasonYear[0], seasonYear[1]);
            setAnimeData(data);
            setListLoading(false);
        })
        .catch(err => { 
            console.error(err);
        });
    }, [animeData, setAnimeData, listLoading, setListLoading, seasonalSortOrder, generateDisplayData, seasonYear])

    const getFollowingList = useCallback(() => {
        setFollowingLoading(true);
        let url = `${api_url}/getUser?sort=${followingSortOrder[0]}&reverse=${followingSortOrder[1]}`;
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "deviceId": Constants.deviceId
            })
        }
        fetch(url, options)
        .then(response => response.json())
        .then(data => {
            console.log("FOLLOWING API CALL");
            setFollowingData(data);
            setFollowingLoading(false);
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData, followingLoading, setFollowingLoading, followingSortOrder])

    const scheduleNotification = useCallback((anime: anime) => {
        if (anime.nextAiringEpisode !== null  && (new Date(anime.nextAiringEpisode.airingAt * 1000) > (new Date()))) {
            Notifications.scheduleNotificationAsync({
                identifier: `${anime.id}`,
                trigger: new Date(anime.nextAiringEpisode.airingAt * 1000),
                content: {
                    title: `${anime.title.english} ep ${anime.nextAiringEpisode.episode} is airing now!`,
                    
                }
            });
        }
    }, [])

    const followAnime = useCallback((animeIds: number[], callback: () => void) => {
        let url = `${api_url}/updateUser`;
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "deviceId": Constants.deviceId,
                "action": "ADD",
                "animeIds": animeIds
            })
        }
        fetch(url, options)
        .then(() => {
            setFollowingNeedToReload(true);
            scheduleNotification(animeData.filter(anime => anime.id === animeIds[0])[0]);
            callback();
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData, animeData])

    const unscheduleNotification = useCallback((animeId: number) => {
        Notifications.cancelScheduledNotificationAsync(`${animeId}`);
    }, [])

    const unfollowAnime = useCallback((animeIds: number[], callback: () => void) => {
        let url = `${api_url}/updateUser`;
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "deviceId": Constants.deviceId,
                "action": "DELETE",
                "animeIds": animeIds
            })
        }
        fetch(url, options)
        .then(() => {
            callback();
            unscheduleNotification(animeIds[0])
            setFollowingData(followingData.filter((anime: anime) => anime.id !== animeIds[0]));
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData])

    useEffect(() => {
        if (!listLoading) {
            getSeasonalList();
        }
    }, [seasonalSortOrder, seasonYear])

    useEffect(() => {
        if (!followingLoading) {
            getFollowingList();
        }
    }, [followingSortOrder])

    useEffect(() => {
        generateDisplayData();
    }, [animeData])

    useEffect(() => {
        generateDisplayData();
    }, [query])

    useEffect(() => {
        (async () => {
            // console.log("UPDATING NOTIFICATIONS");
            let scheduled = await Notifications.getAllScheduledNotificationsAsync();

            // get all the identifiers for the scheduled notifications
            let scheduledIdentifiers: string[] = [];
            scheduled.forEach(notif => {
                scheduledIdentifiers.push(notif.identifier);
            })

            // schedule notifications for anime that do not have notifications
            followingData.forEach(async anime => {
                let id = `${anime.id}`;
                if (!scheduledIdentifiers.includes(id) && anime.nextAiringEpisode !== null && (new Date(anime.nextAiringEpisode.airingAt * 1000) > (new Date()))) {
                    console.log(`   [NOTIF] added notif for ${anime.title.english}`)
                    await Notifications.scheduleNotificationAsync({
                        identifier: id,
                        trigger: new Date(anime.nextAiringEpisode.airingAt * 1000),
                        content: {
                            body: `${anime.title.english} ep ${anime.nextAiringEpisode.episode} is airing now!`
                        }
                    });
                }
            });
        })();
    }, [followingData])

    return {
        changeFontsLoaded,
        getSeasonalList,
        getFollowingList,
        changeSeasonalOrder,
        changeFollowingOrder,
        changeSeasonYear,
        followAnime,
        unfollowAnime,
        changeFollowingNeedToReload,
        changeQuery,
        animeData,
        animeDataDisplayed,
        followingData,
        listLoading,
        followingLoading,
        followingNeedToReload,
        fontsLoaded,
        seasonalScrollOffsetY,
        followingScrollOffsetY,
        seasonYear,
        query
    }
}

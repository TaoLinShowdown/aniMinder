import { createContext, useCallback, useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Constants from 'expo-constants';
import { storeType, anime } from '../common/types';
import { api_url } from '../common/constants';

const initialData: storeType = {
    changeFontsLoaded: () => null,
    getSeasonalList: () => null,
    getFollowingList: () => null,
    changeSeasonalOrder: () => null,
    changeFollowingOrder: () => null,
    followAnime: () => null,
    unfollowAnime: () => null,
    changeFollowingNeedToReload: () => null,
    animeData: [],
    followingData: [],
    listLoading: false,
    followingLoading: false,
    followingNeedToReload: false,
    fontsLoaded: false,
    seasonalScrollOffsetY: new Animated.Value(0),
    followingScrollOffsetY: new Animated.Value(0),
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

    useEffect(() => {
        if (!listLoading) {
            getSeasonalList();
        }
    }, [seasonalSortOrder])

    useEffect(() => {
        if (!followingLoading) {
            getFollowingList();
        }
    }, [followingSortOrder])

    const getSeasonalList = useCallback(() => {
        setListLoading(true);
        // setAnimeData([]);
        let url = `${api_url}/getSeason?season=WINTER&seasonYear=2021&sort=${seasonalSortOrder[0]}&reverse=${seasonalSortOrder[1]}`;
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
            console.log("SEASON API CALL");
            setAnimeData(data);
            setListLoading(false);
        })
        .catch(err => { 
            console.error(err);
        });
    }, [animeData, setAnimeData, listLoading, setListLoading, seasonalSortOrder])

    const getFollowingList = useCallback(() => {
        setFollowingLoading(true);
        // setFollowingData([]);
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
            callback();
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData])

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
            setFollowingData(followingData.filter((anime: anime) => anime.id !== animeIds[0]));
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData])

    return {
        changeFontsLoaded,
        getSeasonalList,
        getFollowingList,
        changeSeasonalOrder,
        changeFollowingOrder,
        followAnime,
        unfollowAnime,
        changeFollowingNeedToReload,
        animeData,
        followingData,
        listLoading,
        followingLoading,
        followingNeedToReload,
        fontsLoaded,
        seasonalScrollOffsetY,
        followingScrollOffsetY,
    }
}

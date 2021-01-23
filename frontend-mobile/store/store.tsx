import React, { createContext, useCallback, useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Constants from 'expo-constants';
import { storeType, anime } from '../common/types';
import { api_url, H_MAX_HEIGHT, H_MIN_HEIGHT, H_SCROLL_DISTANCE } from '../common/constants';
import { call } from 'react-native-reanimated';

const initialData: storeType = {
    changeFontsLoaded: () => null,
    getSeasonalList: () => null,
    getFollowingList: () => null,
    changeSeasonalOrder: () => null,
    changeFollowingOrder: () => null,
    followAnime: () => null,
    unfollowAnime: () => null,
    animeData: [],
    followingData: [],
    listLoading: false,
    followingLoading: false,
    fontsLoaded: false,
    seasonalScrollOffsetY: new Animated.Value(0),
    followingScrollOffsetY: new Animated.Value(0),
}

export const StoreContext = createContext<storeType>(initialData);

export function useStoreContextValue(): storeType {
    const [ animeData, setAnimeData ] = useState<anime[]>([]);
    const [ followingData, setFollowingData ] = useState<anime[]>([]);
    const [ fontsLoaded, setFontsLoaded ] = useState<boolean>(false);
    const [ listLoading, setListLoading ] = useState<boolean>(false);
    const [ followingLoading, setFollowingLoading ] = useState<boolean>(false);
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
        var url = `${api_url}/getSeason?season=WINTER&seasonYear=2021&sort=${seasonalSortOrder[0]}&reverse=${seasonalSortOrder[1]}`;
        var options = {
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
        var url = `${api_url}/getUser?sort=${followingSortOrder[0]}&reverse=${followingSortOrder[1]}`;
        var options = {
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
        var url = `${api_url}/updateUser`;
        var options = {
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
            callback();
        })
        .catch(err => {
            console.error(err);
        });
    }, [followingData, setFollowingData])

    const unfollowAnime = useCallback((animeIds: number[], callback: () => void) => {
        var url = `${api_url}/updateUser`;
        var options = {
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
        animeData,
        followingData,
        listLoading,
        followingLoading,
        fontsLoaded,
        seasonalScrollOffsetY,
        followingScrollOffsetY,
    }
}

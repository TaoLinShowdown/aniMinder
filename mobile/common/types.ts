import React from 'react';
import { Animated, FlatList } from 'react-native';

export interface anime {
    id: number
    episodes: number | null
    averageScore: number,
    studios: {
        nodes: animeStudioName[]
    }
    coverImage: {
        large: string
    },
    nextAiringEpisode: {
        airingAt: number,
        episode: number
    },
    title: {
        romaji: string | null,
        english: string | null,
        native: string | null
    }
}

interface animeStudioName {
    name: string
}

export interface storeType {
    changeFontsLoaded: (bool: boolean) => void,
    getSeasonalList: () => void,
    getFollowingList: () => void,
    changeSeasonalOrder: (order: string[]) => void,
    changeFollowingOrder: (order: string[]) => void,
    changeSeasonYear: (sy: string[]) => void,
    followAnime: (animeIds: number[], callback: () => void) => void,
    unfollowAnime: (animeIds: number[], callback: () => void) => void,
    changeFollowingNeedToReload: (reload: boolean) => void,
    changeQuery: (q: string) => void,
    animeData: anime[],
    animeDataDisplayed: anime[],
    followingData: anime[],
    listLoading: boolean,
    followingLoading: boolean,
    followingNeedToReload: boolean,
    fontsLoaded: boolean,
    seasonalScrollOffsetY: Animated.Value
    followingScrollOffsetY: Animated.Value,
    seasonYear: string[],
    query: string,
}

export interface SeasonalListNavProps {
    flatListRef: React.MutableRefObject<FlatList | null>
}

export interface FollowingListNavProps {
    flatListRef: React.MutableRefObject<FlatList | null>
}

export interface AnimeCardProps {
    type: string,
    animeData: anime,
    startAnimation: () => void,
    setAnimeName: (name: string) => void
}

export type RootStackParamList = {
    Following: undefined,
    Seasonal: undefined,
    Settings: undefined
}

export type asyncSettings = {
    enableNotif: boolean,
    hide: boolean,
    enableDelay: boolean,
    delay: number
}
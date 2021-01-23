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
        id: number,
        airingAt: number,
        timeUntilAiring: number,
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
    followAnime: (animeIds: number[], callback: () => void) => void,
    unfollowAnime: (animeIds: number[], callback: () => void) => void,
    animeData: anime[],
    followingData: anime[],
    listLoading: boolean,
    followingLoading: boolean,
    fontsLoaded: boolean,
    seasonalScrollOffsetY: Animated.Value
    followingScrollOffsetY: Animated.Value
}

export interface SeasonalListNavProps {
    season: string,
    year: string,
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
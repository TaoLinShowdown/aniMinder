# aniMinder Backend

## System Design
The backend of aniMinder is on AWS using a combination of API Gateway, Lambda, DynamoDB, and Cloudwatch Event. 

## Diagram

## Lambda Functions 
- **getAnime:** Gets a specific anime based on the id
- **getSeason:** Gets the list of anime by the season and year and sort order. Can be sorted by title, airing date, score, and number of episodes.
- **getUser:** Gets the list of anime the user is following. If no user is found, another is created using the device ID.
- **updateUser:** Updates the follow list of a user. Can add or remove ids from the list.
- **updateSeasonalList:** Sends a GraphQL request to the AniList API to get the list of shows for the previous and currently airing seasons. This covers both shows airing now and shows that have not finished airing from the last season. This function is called every hour using Cloudwatch Event to keep the list up to date.

## DynamoDB Table Schemas
```
├── Users                       <-- Table
|   └── userId                  <-- Key: Device ID
|       └── followingAnime      <-- List of anime ids
|
└── SeasonalList                <-- Table
    └── id                      <-- Key: Anime ID
        ├── averageScore        <-- Average score
        ├── coverImage          <-- URL to cover art
        ├── episodes            <-- # of episodes total
        ├── nextAiringEpisode
        |   ├── airingAt        <-- Time in seconds when show will air
        |   └── episode         <-- Episode number
        ├── season              <-- Season ["WINTER", "SPRING", "SUMMER", "FALL"]
        ├── seasonYear          <-- Year
        ├── studios             <-- List of studios that worked on show
        └── title               <-- Titles of show, english may be null so use others
            ├── english
            ├── romaji
            └── native
```
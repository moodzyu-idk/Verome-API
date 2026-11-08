// appwrite-main.ts
// Jembatan Verome API untuk Appwrite (Deno 2.6)

import { YTMusic } from "./api/src/services/ytmusic.ts";
import { YouTubeSearch } from "./api/src/services/youtube-search.ts";
import { json, corsHeaders } from "./api/src/helpers/response.ts";

// Import semua handler yang dibutuhkan
import { handleSearch, handleSearchSuggestions, handleYTSearch } from "./api/src/routes/search.ts";
import { handleContentRoutes } from "./api/src/routes/content.ts";
import { handleDiscoverRoutes } from "./api/src/routes/discover.ts";
import { handleStream, handleProxy, handleMusicFind } from "./api/src/routes/stream.ts";
import { handleInfoRoutes } from "./api/src/routes/info.ts";
import { handleFeedRoutes } from "./api/src/routes/feed.ts";

const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

// Format Handler Appwrite: export default async ({ req, res })
export default async ({ req, res }: any) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return res.send("", 204, corsHeaders);
  }

  const pathname = req.path; // Appwrite ngasih path di req.path
  const searchParams = new URLSearchParams(req.query); // Query di req.query

  try {
    // ─── Routing Logic (Sama kayak main.ts lu) ───
    if (pathname === "/api/search") return await handleSearch(req, searchParams, ytmusic, youtubeSearch);
    if (pathname === "/api/search/suggestions") return await handleSearchSuggestions(searchParams, ytmusic, youtubeSearch);
    if (pathname === "/api/yt_search") return await handleYTSearch(searchParams, youtubeSearch);

    const contentResponse = await handleContentRoutes(pathname, searchParams, ytmusic);
    if (contentResponse) return contentResponse;

    const discoverResponse = await handleDiscoverRoutes(pathname, searchParams, ytmusic, youtubeSearch);
    if (discoverResponse) return discoverResponse;

    if (pathname === "/api/music/find") return await handleMusicFind(searchParams, ytmusic);
    if (pathname === "/api/stream") return await handleStream(searchParams);
    if (pathname === "/api/proxy") return await handleProxy(searchParams, req);

    const infoResponse = await handleInfoRoutes(pathname, searchParams);
    if (infoResponse) return infoResponse;

    const feedResponse = await handleFeedRoutes(pathname, searchParams);
    if (feedResponse) return feedResponse;

    return res.json({ error: "Route not found", path: pathname }, 404);

  } catch (err) {
    console.error("Error:", err);
    return res.json({ error: "Internal server error", message: String(err) }, 500);
  }
};

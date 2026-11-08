// Ubah import Deno lu jadi format URL standar
import { YTMusic } from "./api/src/services/ytmusic.ts";
import { YouTubeSearch } from "./api/src/services/youtube-search.ts";
import { json, corsHeaders } from "./api/src/helpers/response.ts";

// Import semua handler
import { handleSearch, handleSearchSuggestions, handleYTSearch } from "./api/src/routes/search.ts";
import { handleContentRoutes } from "./api/src/routes/content.ts";
import { handleDiscoverRoutes } from "./api/src/routes/discover.ts";
import { handleStream, handleProxy, handleMusicFind } from "./api/src/routes/stream.ts";
import { handleInfoRoutes } from "./api/src/routes/info.ts";
import { handleFeedRoutes } from "./api/src/routes/feed.ts";

const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

// FORMAT KHUSUS CLOUDFLARE WORKERS
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routing Logic
      if (pathname === "/api/search") return await handleSearch(request, searchParams, ytmusic, youtubeSearch);
      if (pathname === "/api/search/suggestions") return await handleSearchSuggestions(searchParams, ytmusic, youtubeSearch);
      if (pathname === "/api/yt_search") return await handleYTSearch(searchParams, youtubeSearch);

      const contentResponse = await handleContentRoutes(pathname, searchParams, ytmusic);
      if (contentResponse) return contentResponse;

      const discoverResponse = await handleDiscoverRoutes(pathname, searchParams, ytmusic, youtubeSearch);
      if (discoverResponse) return discoverResponse;

      if (pathname === "/api/music/find") return await handleMusicFind(searchParams, ytmusic);
      if (pathname === "/api/stream") return await handleStream(searchParams);
      if (pathname === "/api/proxy") return await handleProxy(searchParams, request);

      const infoResponse = await handleInfoRoutes(pathname, searchParams);
      if (infoResponse) return infoResponse;

      const feedResponse = await handleFeedRoutes(pathname, searchParams);
      if (feedResponse) return feedResponse;

      return json({ error: "Route not found", path: pathname }, 404);

    } catch (err) {
      console.error("Error:", err);
      return json({ error: "Internal server error", message: String(err) }, 500);
    }
  }
};

import { Client } from "@langchain/langgraph-sdk"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 59
export const dynamic = "force-dynamic" // Ensure this route is not cached

const LANGGRAPH_API_URL = "https://animai-7ae3101060ad56a4a38c382a0479ece6.us.langgraph.app"
const LANGGRAPH_API_KEY = "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"
const LANGGRAPH_ASSISTANT_ID = "fe096781-5601-53d2-b2f6-0d3403f7e9ca"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
  try {
    let prompt: string
    try {
      const body = await request.json()
      prompt = body.prompt

      if (!prompt || typeof prompt !== "string") {
        console.error("[v0] Invalid prompt received:", prompt)
        return Response.json(
          {
            success: false,
            error: "Invalid prompt provided",
          },
          { status: 400 },
        )
      }
    } catch (parseError) {
      console.error("[v0] Error parsing request body:", parseError)
      return Response.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    console.log("[v0] API route called with prompt:", prompt)

    try {
      const supabase = createAdminClient()
      const { data: cachedResult, error: cacheError } = await supabase
        .from("prompt_cache")
        .select("video_url, created_at")
        .eq("prompt", prompt)
        .single()

      if (!cacheError && cachedResult?.video_url) {
        console.log("[v0] Cache hit! Found cached video URL for prompt")
        console.log("[v0] Cached video URL:", cachedResult.video_url)
        console.log("[v0] Cache entry created at:", cachedResult.created_at)

        console.log("[v0] Waiting 60 seconds before returning cached result...")
        await wait(60000)

        const response = {
          success: true,
          text: "Your animation has been generated successfully!",
          videoUrl: cachedResult.video_url,
        }

        console.log("[v0] Returning cached response after 1 minute delay")
        return Response.json(response)
      }

      console.log("[v0] Cache miss. Proceeding to call LangGraph...")
    } catch (cacheCheckError) {
      console.error("[v0] Error checking cache:", cacheCheckError)
      // Continue to LangGraph if cache check fails
    }

    const client = new Client({
      apiUrl: LANGGRAPH_API_URL,
      apiKey: LANGGRAPH_API_KEY,
    })

    console.log("[v0] Calling LangGraph assistant:", LANGGRAPH_ASSISTANT_ID)

    const result = await client.runs.wait(
      null, // null = stateless/memoryless run
      LANGGRAPH_ASSISTANT_ID,
      { input: { prompt: prompt } },
    )

    console.log("[v0] LangGraph response received")
    console.log("[v0] LangGraph response type:", typeof result)
    console.log("[v0] LangGraph full response:", JSON.stringify(result, null, 2))

    let videoUrl = ""
    let responseText = ""
    let nonAnimationReply = ""

    try {
      if (typeof result === "string") {
        try {
          const parsed = JSON.parse(result)
          videoUrl = parsed?.video_url || parsed?.videoUrl || ""
          responseText = parsed?.text || ""
          nonAnimationReply = parsed?.non_animation_reply || ""
        } catch (parseError) {
          console.log("[v0] Could not parse result as JSON, treating as text")
          responseText = result
        }
      } else if (typeof result === "object" && result !== null) {
        // Try multiple possible paths for video URL
        videoUrl = result?.video_url || result?.videoUrl || result?.output?.video_url || result?.output?.videoUrl || ""

        responseText = result?.text || result?.output?.text || result?.message || ""

        nonAnimationReply = result?.non_animation_reply || result?.output?.non_animation_reply || ""

        console.log("[v0] Extracted videoUrl:", videoUrl)
        console.log("[v0] Extracted responseText:", responseText.substring(0, 100))
        console.log("[v0] Extracted nonAnimationReply:", nonAnimationReply.substring(0, 100))
      }
    } catch (extractError) {
      console.error("[v0] Error extracting fields:", extractError)
    }

    if (nonAnimationReply) {
      console.log("[v0] Non-animation reply detected, returning text-only response")
      const response = {
        success: true,
        text: nonAnimationReply,
        videoUrl: undefined, // No video URL for non-animation replies
      }

      console.log("[v0] API returning non-animation response:", response)
      return Response.json(response)
    }

    if (videoUrl) {
      try {
        const supabase = createAdminClient()
        const { error: insertError } = await supabase.from("prompt_cache").upsert(
          {
            prompt: prompt,
            video_url: videoUrl,
          },
          {
            onConflict: "prompt",
          },
        )

        if (insertError) {
          console.error("[v0] Error saving to cache:", insertError)
        } else {
          console.log("[v0] Successfully saved result to cache")
        }
      } catch (cacheSaveError) {
        console.error("[v0] Error saving to cache:", cacheSaveError)
        // Don't fail the request if cache save fails
      }
    }

    const response = {
      success: true,
      text: responseText || "Your animation has been generated successfully!",
      videoUrl: videoUrl,
    }

    console.log("[v0] API returning response:", response)
    return Response.json(response)
  } catch (error) {
    console.error("[v0] API error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate animation. Please try again.",
      },
      { status: 500 },
    )
  }
}

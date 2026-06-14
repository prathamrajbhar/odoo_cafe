const FALLBACK_IMAGES: Record<string, string> = {
  "Masala Chai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
  "Adrak Chai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
  "Green Tea": "https://images.unsplash.com/photo-1564890369478-c92815a557eb?w=500&auto=format&fit=crop&q=80",
  "Kashmiri Kahwa": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80",
  "Filter Kaapi": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
  "Cappuccino": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80",
  "Cold Coffee": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80",
  "Cafe Latte": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80",
  "Fresh Sugarcane Juice": "https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=500&auto=format&fit=crop&q=80",
  "Mango Lassi": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80",
  "Nimbu Pani": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
  "Watermelon Juice": "https://images.unsplash.com/photo-1508888628463-5a8b2933c88b?w=500&auto=format&fit=crop&q=80",
  "Samosa (2 pcs)": "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&auto=format&fit=crop&q=80",
  "Aloo Tikki": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Veg Sandwich": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=80",
  "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=80",
  "Dal Tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
  "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
  "Chole Bhature": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80",
  "Rajma Chawal": "https://images.unsplash.com/photo-1585969643870-a5afeea7f0a5?w=500&auto=format&fit=crop&q=80",
  "Veg Dum Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Mutton Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Gulab Jamun (2 pcs)": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Kulfi": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80",
  "Gajar Halwa": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
  "Rasgulla": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
};

/**
 * Searches Unsplash for an image matching the query.
 * Falls back to local pre-defined maps or generic category fallbacks.
 */
export async function getUnsplashImage(query: string): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (FALLBACK_IMAGES[query]) {
    return FALLBACK_IMAGES[query];
  }

  if (!accessKey || accessKey.trim() === "" || accessKey.includes("your_unsplash_access_key")) {
    // Return a generic fallback matching the name/type
    return `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80`; // generic coffee shop
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!res.ok) {
      console.warn(`Unsplash API error: ${res.statusText}`);
      return `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80`;
    }

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
  } catch (err) {
    console.error("Failed to fetch image from Unsplash:", err);
  }

  return `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80`;
}

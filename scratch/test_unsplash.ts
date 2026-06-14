import "dotenv/config";

async function test() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  console.log("Using access key:", accessKey);
  const url = `https://api.unsplash.com/search/photos?query=coffee&per_page=1`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    console.log("Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("Response Body:", body);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();

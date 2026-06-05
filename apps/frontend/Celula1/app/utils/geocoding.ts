export async function getCoordinates(address: string) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
    );
    const data = await res.json();
    if (data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return null;
  }
  
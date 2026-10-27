// Small helpers for prices and track times

export const formatNames = {vinyl : "Vinyl", cd : "CD", digital : "Digital"};

export const rupee = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// 245 -> "4:05"
export const mmss = (sec) => Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2,"0");

// "4:05" -> 245, NaN when it is not mm:ss
export const parseMmss = (text) =>{

    const match = /^(\d{1,3}):([0-5]\d)$/.exec(String(text).trim());

    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

// total seconds -> "47 min 12 s" or "1 h 12 min"
export const runtime = (sec) =>{

    if( sec >= 3600 ) return Math.floor(sec / 3600) + " h " + Math.round((sec % 3600) / 60) + " min";

    return Math.floor(sec / 60) + " min " + (sec % 60) + " s";
}

// formats of an album that have a price, e.g. ["vinyl","digital"]
export const sellableFormats = (album) => Object.keys(formatNames).filter(f => album.prices && album.prices[f] > 0);

export const orderNo = (order) => "#" + String(order._id).slice(-6).toUpperCase();

// Preview tracks only play a 30 second clip
export const playLength = (track) => (track.preview ? Math.min(30,track.duration) : track.duration);

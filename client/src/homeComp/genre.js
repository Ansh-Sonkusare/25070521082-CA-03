const genreColors = {Rock : "#CA2F40", "Hip-Hop" : "#C98A00", Electronic : "#534AC9", Jazz : "#297A62", Pop : "#BF41B0"};

// Colour of the cover for a genre, grey for any other genre
const genreColor = (genre) => genreColors[genre] || "#5A5D6B";


export default genreColor;

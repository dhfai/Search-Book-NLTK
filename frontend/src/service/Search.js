export const Search = async (keyword) => {
    const response = await fetch(`http://127.0.0.1:5000/search?keyword=${keyword}`);
    const data = await response.json();
    return {data};
}
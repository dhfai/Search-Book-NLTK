export const BookDataFetch = async () => {
    const response = await fetch("http://127.0.0.1:5000/list");
    const data = await response.json();
    return {data};
}
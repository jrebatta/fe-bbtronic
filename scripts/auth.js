const API_BASE_URL = 'https://be-bbtronic.onrender.com'; // URL del backend

async function simpleFetch(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    return response.json(); // Retornar la respuesta JSON
}

export { simpleFetch };

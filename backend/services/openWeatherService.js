const OPENWEATHER_BASE_URL =
  'https://api.openweathermap.org/data/2.5';

const OPENWEATHER_GEO_URL =
  'https://api.openweathermap.org/geo/1.0';

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast';

const getApiKey = () => {
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key || !key.trim()) {
    throw new Error('OPENWEATHER_API_KEY is not configured.');
  }

  return key.trim();
};

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.ok) {
    return data;
  }

  if (response.status === 401) {
    throw new Error('OpenWeather API authentication failed.');
  }

  if (response.status === 404) {
    throw new Error('Weather data was not found.');
  }

  if (response.status === 429) {
    throw new Error('OpenWeather API rate limit reached.');
  }

  throw new Error(
    data?.message ||
      `Weather provider request failed with status ${response.status}.`
  );
};

export const searchLocations = async (query) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const apiKey = getApiKey();

  const trimmedQuery = query.trim();

  const url =
    `${OPENWEATHER_GEO_URL}/direct` +
    `?q=${encodeURIComponent(trimmedQuery)}` +
    `&limit=8` +
    `&appid=${apiKey}`;

  const response = await fetch(url);

  const data = await handleResponse(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    name: item.name || '',
    state: item.state || '',
    country: item.country || '',
    lat: item.lat,
    lon: item.lon,
    displayName: [
      item.name,
      item.state,
      item.country
    ]
      .filter(Boolean)
      .join(', ')
  }));
};

export const reverseGeocode = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    throw new Error('Invalid coordinates.');
  }

  const apiKey = getApiKey();

  const url =
    `${OPENWEATHER_GEO_URL}/reverse` +
    `?lat=${lat}` +
    `&lon=${lon}` +
    `&limit=1` +
    `&appid=${apiKey}`;

  const response = await fetch(url);

  const data = await handleResponse(response);

  if (!Array.isArray(data) || data.length === 0) {
    return {
      name: '',
      state: '',
      country: ''
    };
  }

  return {
    name: data[0].name || '',
    state: data[0].state || '',
    country: data[0].country || ''
  };
};

export const getCurrentWeather = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    throw new Error('Invalid coordinates.');
  }

  const apiKey = getApiKey();

  const url =
    `${OPENWEATHER_BASE_URL}/weather` +
    `?lat=${lat}` +
    `&lon=${lon}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  const response = await fetch(url);

  const data = await handleResponse(response);

  return data;
};

export const getForecast = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    throw new Error('Invalid coordinates.');
  }

  const apiKey = getApiKey();

  const url =
    `${OPENWEATHER_BASE_URL}/forecast` +
    `?lat=${lat}` +
    `&lon=${lon}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  const response = await fetch(url);

  const data = await handleResponse(response);

  return data;
};

export const getUVIndex = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    throw new Error('Invalid coordinates.');
  }

  const url =
    `${OPEN_METEO_URL}` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=uv_index`;

  const response = await fetch(url);

  const data = await handleResponse(response);

  return {
    uvIndex:
      typeof data?.current?.uv_index === 'number'
        ? Math.round(data.current.uv_index * 10) / 10
        : null
  };
};
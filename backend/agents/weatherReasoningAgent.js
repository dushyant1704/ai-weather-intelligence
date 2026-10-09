const round = (value, decimals = 1) => {
  if (!Number.isFinite(value)) {
    return null
  }

  return Number(value.toFixed(decimals))
}

const getComfortLevel = ({
  temperature,
  humidity,
  feelsLike
}) => {
  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(humidity)
  ) {
    return {
      level: 'UNKNOWN',
      reason: 'Insufficient temperature or humidity data.'
    }
  }

  if (
    temperature >= 35 ||
    feelsLike >= 40
  ) {
    return {
      level: 'VERY UNCOMFORTABLE',
      reason: 'High heat conditions may cause significant thermal discomfort.'
    }
  }

  if (
    temperature >= 30 &&
    humidity >= 70
  ) {
    return {
      level: 'UNCOMFORTABLE',
      reason: 'High temperature combined with high humidity can reduce evaporative cooling.'
    }
  }

  if (
    temperature >= 30 &&
    humidity >= 50
  ) {
    return {
      level: 'MODERATELY UNCOMFORTABLE',
      reason: 'Warm conditions combined with moderate humidity may increase discomfort.'
    }
  }

  if (
    temperature >= 20 &&
    temperature < 30 &&
    humidity >= 40 &&
    humidity <= 70
  ) {
    return {
      level: 'COMFORTABLE',
      reason: 'Temperature and humidity are within a generally comfortable range.'
    }
  }

  if (temperature < 15) {
    return {
      level: 'COOL',
      reason: 'Lower temperature is the main contributor to discomfort.'
    }
  }

  return {
    level: 'MODERATE',
    reason: 'Weather conditions are neither strongly comfortable nor strongly uncomfortable.'
  }
}

const analyzeHumidityEffect = ({
  temperature,
  humidity,
  windSpeed
}) => {
  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(humidity) ||
    !Number.isFinite(windSpeed)
  ) {
    return null
  }

  if (
    temperature >= 30 &&
    humidity >= 70 &&
    windSpeed < 10
  ) {
    return {
      type: 'humidity-heat interaction',
      severity: 'high',
      explanation:
        'High temperature, high humidity, and low wind can reduce evaporative cooling and increase perceived discomfort.'
    }
  }

  if (
    temperature >= 30 &&
    humidity >= 60
  ) {
    return {
      type: 'humidity-heat interaction',
      severity: 'moderate',
      explanation:
        'Warm temperatures combined with elevated humidity may make conditions feel hotter.'
    }
  }

  return {
    type: 'humidity-heat interaction',
    severity: 'low',
    explanation:
      'Humidity is not currently creating a strong additional heat-discomfort signal.'
  }
}

const analyzeWindEffect = ({
  temperature,
  windSpeed
}) => {
  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(windSpeed)
  ) {
    return null
  }

  if (
    temperature >= 30 &&
    windSpeed < 5
  ) {
    return {
      type: 'low-wind effect',
      severity: 'moderate',
      explanation:
        'Very low wind during warm conditions may reduce cooling through air movement.'
    }
  }

  if (windSpeed >= 30) {
    return {
      type: 'strong-wind effect',
      severity: 'high',
      explanation:
        'Strong winds may affect outdoor comfort and activities.'
    }
  }

  return {
    type: 'wind effect',
    severity: 'low',
    explanation:
      'Wind speed is not currently creating a major comfort-related effect.'
  }
}

const analyzeRainEffect = ({
  rainProbability,
  condition
}) => {
  if (
    !Number.isFinite(rainProbability) &&
    !condition
  ) {
    return null
  }

  const probability =
    Number.isFinite(rainProbability)
      ? rainProbability
      : 0

  if (
    probability >= 0.7 ||
    /rain|storm|drizzle/i.test(condition || '')
  ) {
    return {
      type: 'precipitation effect',
      severity: 'high',
      explanation:
        'Rain-related conditions may significantly affect outdoor activities.'
    }
  }

  if (probability >= 0.3) {
    return {
      type: 'precipitation effect',
      severity: 'moderate',
      explanation:
        'There is a meaningful possibility of precipitation.'
    }
  }

  return {
    type: 'precipitation effect',
    severity: 'low',
    explanation:
      'There is currently no strong precipitation-related signal.'
  }
}

const generateOverallReasoning = ({
  comfort,
  humidityEffect,
  windEffect,
  rainEffect
}) => {
  const observations = []

  if (comfort?.reason) {
    observations.push(comfort.reason)
  }

  if (
    humidityEffect?.severity === 'high' ||
    humidityEffect?.severity === 'moderate'
  ) {
    observations.push(humidityEffect.explanation)
  }

  if (
    windEffect?.severity === 'high' ||
    windEffect?.severity === 'moderate'
  ) {
    observations.push(windEffect.explanation)
  }

  if (
    rainEffect?.severity === 'high' ||
    rainEffect?.severity === 'moderate'
  ) {
    observations.push(rainEffect.explanation)
  }

  return observations
}

export const reasonAboutWeather = ({
  current,
  uvIndex = null
}) => {
  const temperature =
    Number(current?.temperatureCelsius)

  const feelsLike =
    Number(current?.feelsLikeCelsius)

  const humidity =
    Number(current?.humidityPercent)

  const windSpeed =
    Number(current?.windSpeedKmh)

  const rainProbability =
    Number(current?.rainProbability)

  const condition =
    current?.condition || ''

  const comfort =
    getComfortLevel({
      temperature,
      humidity,
      feelsLike
    })

  const humidityEffect =
    analyzeHumidityEffect({
      temperature,
      humidity,
      windSpeed
    })

  const windEffect =
    analyzeWindEffect({
      temperature,
      windSpeed
    })

  const rainEffect =
    analyzeRainEffect({
      rainProbability,
      condition
    })

  const observations =
    generateOverallReasoning({
      comfort,
      humidityEffect,
      windEffect,
      rainEffect
    })

  return {
    agent: {
      name: 'Weather Reasoning Agent',
      version: '1.0.0',
      status: 'completed'
    },

    input: {
      temperatureCelsius:
        Number.isFinite(temperature)
          ? round(temperature)
          : null,

      feelsLikeCelsius:
        Number.isFinite(feelsLike)
          ? round(feelsLike)
          : null,

      humidityPercent:
        Number.isFinite(humidity)
          ? round(humidity)
          : null,

      windSpeedKmh:
        Number.isFinite(windSpeed)
          ? round(windSpeed)
          : null,

      rainProbability:
        Number.isFinite(rainProbability)
          ? round(rainProbability * 100)
          : null,

      uvIndex:
        Number.isFinite(Number(uvIndex))
          ? round(Number(uvIndex))
          : null,

      condition
    },

    reasoning: {
      comfort,
      interactions: [
        humidityEffect,
        windEffect,
        rainEffect
      ].filter(Boolean),

      observations
    },

    summary:
      observations.length > 0
        ? observations.join(' ')
        : 'Weather conditions could not be interpreted because insufficient data was available.'
  }
}
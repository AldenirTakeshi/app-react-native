const { withAndroidManifest } = require('@expo/config-plugins');

const withGoogleMapsApiKey = (config, { apiKey } = {}) => {
  if (!apiKey) {
    console.warn('Google Maps API Key não fornecida');
    return config;
  }

  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest.application) {
      return config;
    }

    const application = manifest.application[0];

    let apiKeyExists = false;
    if (application['meta-data']) {
      apiKeyExists = application['meta-data'].some(
        (meta) => meta.$['android:name'] === 'com.google.android.geo.API_KEY',
      );
    }

    if (!apiKeyExists) {
      if (!application['meta-data']) {
        application['meta-data'] = [];
      }

      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
        },
      });
    } else {
      const apiKeyMeta = application['meta-data'].find(
        (meta) => meta.$['android:name'] === 'com.google.android.geo.API_KEY',
      );
      if (apiKeyMeta) {
        apiKeyMeta.$['android:value'] = apiKey;
      }
    }

    return config;
  });
};

module.exports = withGoogleMapsApiKey;

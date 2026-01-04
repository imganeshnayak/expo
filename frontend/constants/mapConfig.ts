export const MAP_CONFIG = {
    STYLE_URL: 'https://demotiles.maplibre.org/style.json', // Fallback
    OSM_RASTER_STYLE: {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors'
            }
        },
        layers: [
            {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm',
                paint: {
                    'raster-saturation': -0.2,
                    'raster-contrast': 0.1
                }
            }
        ]
    },
    MIN_ZOOM: 14,
    MAX_ZOOM: 18,
    DEFAULT_ZOOM: 16.5,
    PITCH_ENABLED: false, // Retro 2D
    ROTATE_ENABLED: true
};

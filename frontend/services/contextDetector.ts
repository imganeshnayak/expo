
export const contextDetector = {
    detectTimeOfDay: (): 'morning' | 'afternoon' | 'evening' | 'late_night' => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'late_night';
    },

    isWeekend: (): boolean => {
        const day = new Date().getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    },

    // Mock Weather Service
    detectWeather: async (): Promise<'clear' | 'rain' | 'cloudy' | 'hot'> => {
        // In a real app, this would call OpenWeatherMap
        const weathers = ['clear', 'cloudy', 'rain', 'hot'] as const;
        return weathers[Math.floor(Math.random() * weathers.length)];
    },

    // Composite Context Analysis
    analyzeCurrentContext: async () => {
        const time = contextDetector.detectTimeOfDay();
        const weekend = contextDetector.isWeekend();
        const weather = await contextDetector.detectWeather();

        return {
            timeOfDay: time,
            isWeekend: weekend,
            weather: weather,
            locationContext: 'home' as const, // Placeholder
        };
    }
};

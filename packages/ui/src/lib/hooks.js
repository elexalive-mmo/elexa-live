import { useState, useEffect, useContext } from 'react';

// Solana Price Hook
export const useSolanaPrice = () => {
    const [data, setData] = useState({ price: 0, change: 0, loading: true });
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
                const json = await res.json();
                setData({
                    price: json.solana.usd,
                    change: json.solana.usd_24h_change?.toFixed(2) || 0,
                    loading: false
                });
            } catch (e) {
                setData({ price: 245.67, change: 2.34, loading: false }); // Fallback mock
            }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, []);
    return data;
};

// Weather Hook
export const useWeather = (location = 'Kelowna') => {
    const [weather, setWeather] = useState({ temp: 0, condition: 'clear', icon: '☀️', loading: true });
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(`https://wttr.in/${location}?format=j1`);
                const json = await res.json();
                const current = json.current_condition[0];
                const temp = current.temp_C;
                const code = parseInt(current.weatherCode);
                let icon = '☀️';
                if (code >= 200 && code < 300) icon = '⛈️';
                else if (code >= 300 && code < 600) icon = '🌧️';
                else if (code >= 600 && code < 700) icon = '❄️';
                else if (code >= 700 && code < 800) icon = '🌫️';
                else if (code === 800) icon = '☀️';
                else if (code > 800) icon = '☁️';
                setWeather({ temp, condition: current.weatherDesc[0].value, icon, loading: false });
            } catch (e) {
                setWeather({ temp: -5, condition: 'Snow', icon: '❄️', loading: false });
            }
        };
        fetchWeather();
    }, [location]);
    return weather;
};

// Live Stats Hook
export const useLiveStats = () => {
    const [stats, setStats] = useState({
        activeRooms: 4210,
        totalSignal: 892400,
        contributors: 1847,
        expGenerated: 45000,
    });
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                activeRooms: prev.activeRooms + Math.floor(Math.random() * 10 - 5),
                totalSignal: prev.totalSignal + Math.floor(Math.random() * 100),
                contributors: prev.contributors + Math.floor(Math.random() * 5 - 2),
                expGenerated: prev.expGenerated + Math.floor(Math.random() * 50),
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return stats;
};

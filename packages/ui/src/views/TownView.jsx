import { useState, useEffect } from 'react';
import TownBuilder from '../components/TownBuilder';

const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3020' : window.location.origin;

/**
 * TownView — Wrapper that provides mock/live data to TownBuilder
 * Will fetch from /api/user/:userId when backend is live
 */
const TownView = () => {
    const [townData, setTownData] = useState({
        buildings: [{ id: 'cozy_tent' }],
        soulDust: 250,
        happiness: 55,
        elexamonInTown: []
    });

    useEffect(() => {
        // Try to fetch from backend, fall back to mock
        const fetchTown = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/state`);
                const data = await res.json();
                if (data.user?.town) {
                    setTownData(data.user.town);
                }
            } catch (e) {
                // Mock data is fine for now
            }
        };
        fetchTown();
    }, []);

    const handleBuild = async (buildingId) => {
        try {
            const res = await fetch(`${API_BASE}/api/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'guest', action: 'build', details: { buildingId } })
            });
            const data = await res.json();
            if (data.success) {
                setTownData(prev => ({
                    ...prev,
                    buildings: [...prev.buildings, { id: buildingId }],
                    soulDust: prev.soulDust - (data.cost || 0)
                }));
            }
        } catch (e) {
            // Optimistic: just add it locally
            setTownData(prev => ({
                ...prev,
                buildings: [...prev.buildings, { id: buildingId }]
            }));
        }
    };

    return (
        <div className="w-full h-full p-4">
            <TownBuilder
                buildings={townData.buildings}
                soulDust={townData.soulDust}
                happiness={townData.happiness}
                elexamonInTown={townData.elexamonInTown}
                onBuild={handleBuild}
            />
        </div>
    );
};

export default TownView;

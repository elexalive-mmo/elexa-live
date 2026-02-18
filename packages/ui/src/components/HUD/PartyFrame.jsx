import React from 'react';

export default function PartyFrame({ partyData }) {
    // Mock data if none provided
    const members = partyData || [
        { name: 'Elexa.Prime', role: 'Leader', hp: 98, mana: 100, icon: '👑', status: 'Buffed' },
        { name: 'Guardian', role: 'Tank', hp: 85, mana: 40, icon: '🛡️', status: 'Shielded' },
        { name: 'Scout', role: 'DPS', hp: 45, mana: 90, icon: '🏹', status: 'Stealthed' },
        { name: 'Healer', role: 'Support', hp: 100, mana: 85, icon: '💚', status: 'Casting' }
    ];

    return (
        <div className="party-frame-container">
            <style>{`
                .party-frame-container {
                    position: absolute;
                    top: 120px;
                    left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 220px;
                    pointer-events: none; /* Let clicks pass through except on members */
                }

                .party-member {
                    display: flex;
                    align-items: center;
                    background: rgba(10, 15, 30, 0.7);
                    border-left: 4px solid #333;
                    padding: 8px;
                    border-radius: 4px;
                    backdrop-filter: blur(4px);
                    pointer-events: auto;
                    transition: border-color 0.2s;
                    position: relative;
                }

                .party-member.Tank { border-color: #3498db; }
                .party-member.DPS { border-color: #e74c3c; }
                .party-member.Support { border-color: #2ecc71; }
                .party-member.Leader { border-color: #f1c40f; }

                .pm-icon {
                    font-size: 20px;
                    margin-right: 10px;
                    width: 30px;
                    text-align: center;
                }

                .pm-info {
                    flex: 1;
                }

                .pm-name {
                    font-size: 12px;
                    color: #fff;
                    font-weight: bold;
                    display: block;
                    margin-bottom: 4px;
                    text-shadow: 0 1px 2px black;
                }

                .bar-container {
                    background: #222;
                    height: 6px;
                    border-radius: 3px;
                    margin-bottom: 2px;
                    overflow: hidden;
                }

                .hp-bar { height: 100%; background: #e74c3c; transition: width 0.3s; }
                .mana-bar { height: 100%; background: #3498db; transition: width 0.3s; }
                
                .pm-status {
                    position: absolute;
                    right: 8px;
                    top: 8px;
                    font-size: 10px;
                    color: #aaa;
                }
            `}</style>

            {members.map((m, i) => (
                <div key={i} className={`party-member ${m.role}`}>
                    <div className="pm-icon">{m.icon}</div>
                    <div className="pm-info">
                        <span className="pm-name">{m.name}</span>
                        <div className="bar-container">
                            <div className="hp-bar" style={{ width: `${m.hp}%` }} />
                        </div>
                        <div className="bar-container">
                            <div className="mana-bar" style={{ width: `${m.mana}%` }} />
                        </div>
                    </div>
                    <span className="pm-status">{m.status}</span>
                </div>
            ))}
        </div>
    );
}

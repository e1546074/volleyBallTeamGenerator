// data.js - Data persistence and management functions

const STORAGE_KEY = 'volleyballPlayers';

/**
 * Generate a UUID for player IDs
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Calculate overall score from ratings
 */
function calculateOverallScore(ratings) {
    const categories = [
        'height', 'verticalJump', 'speedAgility', 'spiking', 'blocking',
        'setting', 'passing', 'defense', 'serving', 'gameIQ'
    ];
    const sum = categories.reduce((total, category) => {
        return total + (ratings[category] || 0);
    }, 0);
    return Math.round((sum / categories.length) * 100) / 100;
}

/**
 * Create a new player object
 */
function createPlayer(playerData) {
    const player = {
        id: playerData.id || generateUUID(),
        name: playerData.name || '',
        ratings: {
            height: playerData.ratings?.height || 0,
            verticalJump: playerData.ratings?.verticalJump || 0,
            speedAgility: playerData.ratings?.speedAgility || 0,
            spiking: playerData.ratings?.spiking || 0,
            blocking: playerData.ratings?.blocking || 0,
            setting: playerData.ratings?.setting || 0,
            passing: playerData.ratings?.passing || 0,
            defense: playerData.ratings?.defense || 0,
            serving: playerData.ratings?.serving || 0,
            gameIQ: playerData.ratings?.gameIQ || 0
        },
        preferences: playerData.preferences || ['Setter', 'Middle Blocker'],
        overallScore: 0
    };
    
    player.overallScore = calculateOverallScore(player.ratings);
    return player;
}

/**
 * Load players from localStorage
 */
function loadPlayers() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
            return [];
        }
        
        const parsedData = JSON.parse(storedData);
        
        // Validate and migrate data if needed
        if (!Array.isArray(parsedData)) {
            console.error('Invalid player data format, resetting to empty array');
            return [];
        }
        
        // Ensure all players have required fields and calculate overall scores
        return parsedData.map(player => {
            const validatedPlayer = createPlayer(player);
            return validatedPlayer;
        });
    } catch (error) {
        console.error('Error loading players from localStorage:', error);
        // Data corruption - reset to empty database
        return [];
    }
}

/**
 * Save players to localStorage
 */
function savePlayers(players) {
    try {
        const playersToSave = players.map(player => ({
            id: player.id,
            name: player.name,
            ratings: { ...player.ratings },
            preferences: [ ...player.preferences ],
            overallScore: player.overallScore
        }));
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playersToSave));
        return true;
    } catch (error) {
        console.error('Error saving players to localStorage:', error);
        return false;
    }
}

/**
 * Add a new player
 */
function addPlayer(playerData) {
    const players = loadPlayers();
    const newPlayer = createPlayer(playerData);
    players.push(newPlayer);
    savePlayers(players);
    return newPlayer;
}

/**
 * Update an existing player
 */
function updatePlayer(playerId, playerData) {
    const players = loadPlayers();
    const index = players.findIndex(p => p.id === playerId);
    
    if (index === -1) {
        return null;
    }
    
    const updatedPlayer = createPlayer({
        ...players[index],
        ...playerData,
        id: playerId // Ensure ID remains the same
    });
    
    players[index] = updatedPlayer;
    savePlayers(players);
    return updatedPlayer;
}

/**
 * Delete a player by ID
 */
function deletePlayer(playerId) {
    const players = loadPlayers();
    const filteredPlayers = players.filter(p => p.id !== playerId);
    savePlayers(filteredPlayers);
    return filteredPlayers;
}

/**
 * Delete multiple players by IDs
 */
function deletePlayers(playerIds) {
    const players = loadPlayers();
    const filteredPlayers = players.filter(p => !playerIds.includes(p.id));
    savePlayers(filteredPlayers);
    return filteredPlayers;
}

/**
 * Get a player by ID
 */
function getPlayerById(playerId) {
    const players = loadPlayers();
    return players.find(p => p.id === playerId) || null;
}

/**
 * Get all players
 */
function getAllPlayers() {
    return loadPlayers();
}

/**
 * Reset all player data (clear localStorage)
 */
function resetPlayers() {
    localStorage.removeItem(STORAGE_KEY);
    return [];
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateUUID,
        calculateOverallScore,
        createPlayer,
        loadPlayers,
        savePlayers,
        addPlayer,
        updatePlayer,
        deletePlayer,
        deletePlayers,
        getPlayerById,
        getAllPlayers,
        resetPlayers
    };
}
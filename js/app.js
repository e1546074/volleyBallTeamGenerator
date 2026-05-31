// app.js - Main application logic and initialization

/**
 * Volleyball Team Builder - Main Application
 * 
 * This file contains the main application logic and initialization.
 * It coordinates between data, algorithm, and UI modules.
 */

// Import all functions from other modules (in browser, these are available as global functions)
// In Node.js, these would be imported via require()

/**
 * Initialize the application
 */
function init() {
    // Initialize UI
    initUI();
    
    // Load initial data
    const players = loadPlayers();
    
    // Render initial player table
    renderPlayerTable(players);
    
    // Update button states
    updateActionButtonStates();
    
    console.log('Volleyball Team Builder initialized successfully');
    console.log(`Loaded ${players.length} players from localStorage`);
}

/**
 * Handle player selection changes
 */
function handleSelection() {
    // This function is called when player selection changes
    // It updates the UI and button states
    updateActionButtonStates();
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    const presentPlayers = getPresentPlayers();
    
    try {
        // Validate team generation
        if (!validateTeamGeneration(presentPlayers.length)) {
            const minPlayers = getMinimumPlayers();
            showErrorMessage(`Need at least ${minPlayers} players for team generation. Current: ${presentPlayers.length}`);
            return;
        }
        
        // Generate teams
        const teamConfig = generateTeams(presentPlayers);
        
        // Render team generation view
        renderTeamGenerationView(teamConfig);
        
        // Clear error message
        hideErrorMessage();
        
    } catch (error) {
        showErrorMessage(error.message);
        console.error('Error generating teams:', error);
    }
}

/**
 * Handle back button click
 */
function handleBack() {
    switchView('player-list');
    clearPresentPlayers();
}

/**
 * Handle add player
 */
function handleAddPlayer(playerData) {
    const newPlayer = addPlayer(playerData);
    
    // Refresh player list
    const players = loadPlayers();
    renderPlayerTable(players);
    updateActionButtonStates();
    
    return newPlayer;
}

/**
 * Handle edit player
 */
function handleEditPlayer(playerId, playerData) {
    const updatedPlayer = updatePlayer(playerId, playerData);
    
    // Refresh player list
    const players = loadPlayers();
    renderPlayerTable(players);
    updateActionButtonStates();
    
    return updatedPlayer;
}

/**
 * Handle delete player
 */
function handleDeletePlayer(playerId) {
    deletePlayer(playerId);
    
    // Refresh player list
    const players = loadPlayers();
    renderPlayerTable(players);
    updateActionButtonStates();
    clearPresentPlayers();
}

/**
 * Handle delete multiple players
 */
function handleDeletePlayers(playerIds) {
    deletePlayers(playerIds);
    
    // Refresh player list
    const players = loadPlayers();
    renderPlayerTable(players);
    updateActionButtonStates();
    clearPresentPlayers();
}

/**
 * Get current application state
 */
function getAppState() {
    return {
        players: loadPlayers(),
        presentPlayers: getPresentPlayers(),
        selectedPlayerIds: getSelectedPlayerIds(),
        currentView: state.currentView
    };
}

/**
 * Reset application to initial state
 */
function resetApp() {
    resetPlayers();
    state.players = [];
    state.presentPlayers.clear();
    state.selectedPlayerId = null;
    state.editingPlayerId = null;
    
    renderPlayerTable([]);
    updateActionButtonStates();
    switchView('player-list');
    hideErrorMessage();
}

/**
 * Check if team generation is possible with current selection
 */
function canGenerateTeams() {
    const presentPlayers = getPresentPlayers();
    return validateTeamGeneration(presentPlayers.length);
}

/**
 * Get team generation information without actually generating teams
 */
function getTeamGenerationInfo() {
    const presentPlayers = getPresentPlayers();
    const presentCount = presentPlayers.length;
    
    const teamConfig = determineTeamSize(presentCount);
    
    if (!teamConfig) {
        return {
            valid: false,
            message: `Cannot generate teams with ${presentCount} players`
        };
    }
    
    return {
        valid: true,
        teamSize: teamConfig.teamSize,
        teamCount: teamConfig.teamCount,
        composition: teamConfig.composition,
        message: `${teamConfig.teamCount} teams of ${teamConfig.teamSize} players each`
    };
}

/**
 * Calculate statistics for current players
 */
function getPlayerStatistics() {
    const players = loadPlayers();
    
    if (players.length === 0) {
        return {
            totalPlayers: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0
        };
    }
    
    const scores = players.map(p => p.overallScore);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return {
        totalPlayers: players.length,
        averageScore: Math.round(average * 100) / 100,
        highestScore: highest,
        lowestScore: lowest
    };
}

/**
 * Export player data for backup
 */
function exportPlayers() {
    const players = loadPlayers();
    return JSON.stringify(players, null, 2);
}

/**
 * Import player data from backup
 */
function importPlayers(jsonString) {
    try {
        const players = JSON.parse(jsonString);
        
        // Validate imported data
        if (!Array.isArray(players)) {
            throw new Error('Invalid player data format');
        }
        
        // Save imported players
        savePlayers(players);
        
        // Refresh state
        state.players = loadPlayers();
        renderPlayerTable(state.players);
        updateActionButtonStates();
        
        return { success: true, count: players.length };
        
    } catch (error) {
        console.error('Error importing players:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create sample players for testing
 */
function createSamplePlayers() {
    const samplePlayers = [
        {
            name: 'John Smith',
            ratings: {
                height: 8,
                verticalJump: 7,
                speedAgility: 9,
                spiking: 8,
                blocking: 6,
                setting: 5,
                passing: 7,
                defense: 8,
                serving: 7,
                gameIQ: 8
            },
            preferences: ['Outside Hitter', 'Setter']
        },
        {
            name: 'Mike Johnson',
            ratings: {
                height: 9,
                verticalJump: 8,
                speedAgility: 7,
                spiking: 9,
                blocking: 8,
                setting: 4,
                passing: 6,
                defense: 7,
                serving: 8,
                gameIQ: 7
            },
            preferences: ['Middle Blocker', 'Outside Hitter']
        },
        {
            name: 'Sarah Williams',
            ratings: {
                height: 6,
                verticalJump: 7,
                speedAgility: 8,
                spiking: 7,
                blocking: 5,
                setting: 9,
                passing: 8,
                defense: 9,
                serving: 8,
                gameIQ: 9
            },
            preferences: ['Setter', 'Outside Hitter']
        },
        {
            name: 'David Brown',
            ratings: {
                height: 8,
                verticalJump: 9,
                speedAgility: 8,
                spiking: 7,
                blocking: 9,
                setting: 6,
                passing: 7,
                defense: 8,
                serving: 7,
                gameIQ: 8
            },
            preferences: ['Middle Blocker', 'Setter']
        },
        {
            name: 'Emily Davis',
            ratings: {
                height: 7,
                verticalJump: 8,
                speedAgility: 9,
                spiking: 8,
                blocking: 7,
                setting: 7,
                passing: 8,
                defense: 9,
                serving: 8,
                gameIQ: 8
            },
            preferences: ['Outside Hitter', 'Middle Blocker']
        },
        {
            name: 'Robert Wilson',
            ratings: {
                height: 9,
                verticalJump: 7,
                speedAgility: 6,
                spiking: 8,
                blocking: 8,
                setting: 5,
                passing: 6,
                defense: 7,
                serving: 7,
                gameIQ: 7
            },
            preferences: ['Middle Blocker', 'Outside Hitter']
        },
        {
            name: 'Jennifer Taylor',
            ratings: {
                height: 6,
                verticalJump: 8,
                speedAgility: 9,
                spiking: 7,
                blocking: 6,
                setting: 8,
                passing: 9,
                defense: 8,
                serving: 8,
                gameIQ: 9
            },
            preferences: ['Setter', 'Outside Hitter']
        },
        {
            name: 'Thomas Anderson',
            ratings: {
                height: 8,
                verticalJump: 8,
                speedAgility: 7,
                spiking: 9,
                blocking: 7,
                setting: 6,
                passing: 7,
                defense: 8,
                serving: 8,
                gameIQ: 8
            },
            preferences: ['Outside Hitter', 'Middle Blocker']
        },
        {
            name: 'Lisa Martinez',
            ratings: {
                height: 7,
                verticalJump: 7,
                speedAgility: 8,
                spiking: 8,
                blocking: 8,
                setting: 7,
                passing: 8,
                defense: 8,
                serving: 7,
                gameIQ: 8
            },
            preferences: ['Setter', 'Middle Blocker']
        },
        {
            name: 'James Lee',
            ratings: {
                height: 8,
                verticalJump: 9,
                speedAgility: 8,
                spiking: 8,
                blocking: 9,
                setting: 5,
                passing: 7,
                defense: 7,
                serving: 8,
                gameIQ: 7
            },
            preferences: ['Middle Blocker', 'Outside Hitter']
        },
        {
            name: 'Amanda Clark',
            ratings: {
                height: 6,
                verticalJump: 8,
                speedAgility: 9,
                spiking: 7,
                blocking: 6,
                setting: 9,
                passing: 8,
                defense: 9,
                serving: 8,
                gameIQ: 9
            },
            preferences: ['Setter', 'Outside Hitter']
        },
        {
            name: 'Daniel Rodriguez',
            ratings: {
                height: 9,
                verticalJump: 8,
                speedAgility: 7,
                spiking: 8,
                blocking: 8,
                setting: 6,
                passing: 7,
                defense: 8,
                serving: 7,
                gameIQ: 8
            },
            preferences: ['Middle Blocker', 'Setter']
        }
    ];
    
    // Add sample players
    samplePlayers.forEach(playerData => {
        addPlayer(playerData);
    });
    
    // Refresh state
    state.players = loadPlayers();
    renderPlayerTable(state.players);
    updateActionButtonStates();
    
    return samplePlayers.length;
}

/**
 * Performance test - Generate teams for 100 players
 */
function performanceTest() {
    console.log('Running performance test...');
    
    // Create 100 test players
    const testPlayers = [];
    for (let i = 0; i < 100; i++) {
        testPlayers.push({
            id: `test-${i}`,
            name: `Test Player ${i + 1}`,
            ratings: {
                height: Math.random() * 10,
                verticalJump: Math.random() * 10,
                speedAgility: Math.random() * 10,
                spiking: Math.random() * 10,
                blocking: Math.random() * 10,
                setting: Math.random() * 10,
                passing: Math.random() * 10,
                defense: Math.random() * 10,
                serving: Math.random() * 10,
                gameIQ: Math.random() * 10
            },
            preferences: ['Setter', 'Middle Blocker'],
            overallScore: Math.random() * 10
        });
    }
    
    // Test with 12 players (6v6)
    const startTime = performance.now();
    const result12 = generateTeams(testPlayers.slice(0, 12));
    const time12 = performance.now() - startTime;
    
    // Test with 10 players (5v5)
    const startTime10 = performance.now();
    const result10 = generateTeams(testPlayers.slice(0, 10));
    const time10 = performance.now() - startTime10;
    
    // Test with 14 players (7v7)
    const startTime14 = performance.now();
    const result14 = generateTeams(testPlayers.slice(0, 14));
    const time14 = performance.now() - startTime14;
    
    // Test with 100 players (if divisible by a team size)
    // 100 is divisible by 5, so we can test 5v5 with 20 teams
    const startTime100 = performance.now();
    const result100 = generateTeams(testPlayers.slice(0, 100));
    const time100 = performance.now() - startTime100;
    
    console.log(`Performance Results:`);
    console.log(`- 12 players (6v6): ${time12.toFixed(2)}ms`);
    console.log(`- 10 players (5v5): ${time10.toFixed(2)}ms`);
    console.log(`- 14 players (7v7): ${time14.toFixed(2)}ms`);
    console.log(`- 100 players (5v5 x 20 teams): ${time100.toFixed(2)}ms`);
    
    // Check if 100 players completes in < 1s
    const passed = time100 < 1000;
    console.log(`Performance test ${passed ? 'PASSED' : 'FAILED'}: ${time100.toFixed(2)}ms ${passed ? '<' : '>='} 1000ms`);
    
    return {
        time12, time10, time14, time100,
        passed: time100 < 1000
    };
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for use in other modules or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        handleSelection,
        handleConfirm,
        handleBack,
        handleAddPlayer,
        handleEditPlayer,
        handleDeletePlayer,
        handleDeletePlayers,
        getAppState,
        resetApp,
        canGenerateTeams,
        getTeamGenerationInfo,
        getPlayerStatistics,
        exportPlayers,
        importPlayers,
        createSamplePlayers,
        performanceTest
    };
}
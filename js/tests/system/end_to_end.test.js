// end_to_end.test.js - System tests for end-to-end workflows

const data = require('../../data.js');
const algorithm = require('../../algorithm.js');
const app = require('../../app.js');

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get store() { return store; }
    };
})();

// Mock document for Node.js environment
global.document = {
    addEventListener: () => {},
    getElementById: () => null
};

global.localStorage = localStorageMock;

// Mock all data module functions for system tests
global.loadPlayers = () => {
    try {
        const storedData = localStorageMock.getItem('volleyballPlayers');
        if (!storedData) {
            return [];
        }
        const parsedData = JSON.parse(storedData);
        if (!Array.isArray(parsedData)) {
            return [];
        }
        return parsedData;
    } catch (error) {
        return [];
    }
};

global.savePlayers = (players) => {
    try {
        localStorageMock.setItem('volleyballPlayers', JSON.stringify(players));
        return true;
    } catch (error) {
        return false;
    }
};

global.addPlayer = (playerData) => {
    const players = global.loadPlayers();
    const newPlayer = {
        id: playerData.id || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playerData.name || '',
        ratings: playerData.ratings || {},
        preferences: playerData.preferences || ['Setter', 'Middle Blocker'],
        overallScore: playerData.overallScore || 0
    };
    players.push(newPlayer);
    global.savePlayers(players);
    return newPlayer;
};

global.resetPlayers = () => {
    localStorageMock.removeItem('volleyballPlayers');
    return [];
};

// Mock all algorithm module functions
global.validateTeamGeneration = (playerCount) => {
    const teamConfig = global.determineTeamSize(playerCount);
    return teamConfig !== null;
};

global.determineTeamSize = (presentPlayerCount) => {
    const TEAM_COMPOSITION = {
        6: { minPlayers: 12, positions: { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 2 } },
        5: { minPlayers: 10, positions: { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 1 } },
        7: { minPlayers: 14, positions: { 'Setter': 2, 'Middle Blocker': 3, 'Outside Hitter': 2 } }
    };
    const priorityOrder = [6, 5, 7];
    for (const teamSize of priorityOrder) {
        const config = TEAM_COMPOSITION[teamSize];
        if (presentPlayerCount >= config.minPlayers && presentPlayerCount % teamSize === 0) {
            return { teamSize, teamCount: presentPlayerCount / teamSize, composition: config.positions };
        }
    }
    return null;
};

global.generateTeams = (presentPlayers) => {
    const presentPlayerCount = presentPlayers.length;
    const teamConfig = global.determineTeamSize(presentPlayerCount);
    if (!teamConfig) {
        throw new Error('Cannot determine valid team configuration');
    }
    
    // Create simple team structure for testing
    const teams = [];
    for (let i = 0; i < teamConfig.teamCount; i++) {
        teams.push({
            id: `team-${i + 1}`,
            players: [],
            totalScore: 0,
            positionSlots: { ...teamConfig.composition }
        });
    }
    
    // Simple assignment - just distribute players evenly
    for (let i = 0; i < presentPlayers.length; i++) {
        const teamIndex = i % teamConfig.teamCount;
        teams[teamIndex].players.push({
            playerId: presentPlayers[i].id,
            position: 'Setter',
            overallScore: presentPlayers[i].overallScore || 0
        });
        teams[teamIndex].totalScore += (presentPlayers[i].overallScore || 0);
    }
    
    return { teams, teamSize: teamConfig.teamSize, teamCount: teamConfig.teamCount, totalPlayers: presentPlayerCount };
};

// Mock state object
global.state = {
    players: [],
    presentPlayers: new Set(),
    selectedPlayerId: null,
    editingPlayerId: null,
    currentView: 'player-list'
};

// Mock UI functions
const mockUI = {
    initUI: () => {},
    renderPlayerTable: () => {},
    updateActionButtonStates: () => {},
    renderTeamGenerationView: () => {},
    switchView: () => {},
    clearPresentPlayers: () => { state.presentPlayers.clear(); },
    getPresentPlayers: () => Array.from(state.presentPlayers),
    getSelectedPlayerIds: () => [],
    showErrorMessage: () => {},
    hideErrorMessage: () => {}
};

// Override UI functions
global.initUI = mockUI.initUI;
global.renderPlayerTable = mockUI.renderPlayerTable;
global.updateActionButtonStates = mockUI.updateActionButtonStates;
global.renderTeamGenerationView = mockUI.renderTeamGenerationView;
global.switchView = mockUI.switchView;
global.clearPresentPlayers = mockUI.clearPresentPlayers;
global.getPresentPlayers = mockUI.getPresentPlayers;
global.getSelectedPlayerIds = mockUI.getSelectedPlayerIds;
global.showErrorMessage = mockUI.showErrorMessage;
global.hideErrorMessage = mockUI.hideErrorMessage;

// Test framework
const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    addTest: function(name, testFunc) {
        this.tests.push({ name, testFunc });
    },
    
    run: function() {
        console.log('Running end-to-end system tests...\n');
        this.passed = 0;
        this.failed = 0;
        
        for (const test of this.tests) {
            try {
                // Reset state before each test
                localStorageMock.clear();
                state.players = [];
                state.presentPlayers.clear();
                state.selectedPlayerId = null;
                state.editingPlayerId = null;
                state.currentView = 'player-list';
                
                test.testFunc();
                console.log(`✓ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\nSystem Tests: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    },
    
    assert: function(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },
    
    assertEqual: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || 'Values not equal'}: expected ${expected}, got ${actual}`);
        }
    },
    
    assertCloseTo: function(actual, expected, precision, message) {
        const diff = Math.abs(actual - expected);
        if (diff > precision) {
            throw new Error(`${message || 'Values not close'}: expected ${expected}, got ${actual}, diff ${diff}`);
        }
    },
    
    assertTrue: function(value, message) {
        this.assert(value === true, message || 'Expected true, got false');
    },
    
    assertFalse: function(value, message) {
        this.assert(value === false, message || 'Expected false, got true');
    },
    
    assertNull: function(value, message) {
        this.assert(value === null, message || 'Expected null');
    },
    
    assertNotNull: function(value, message) {
        this.assert(value !== null, message || 'Expected not null');
    },
    
    assertArrayLength: function(array, length, message) {
        this.assert(array.length === length, `${message || 'Array length mismatch'}: expected ${length}, got ${array.length}`);
    }
};

// ============================================
// SYSTEM TEST 1: Complete User Workflow
// ============================================

TestRunner.addTest('System: Complete workflow from player creation to team generation', function() {
    // Step 1: Create and add players
    const playerCount = 12;
    for (let i = 0; i < playerCount; i++) {
        app.handleAddPlayer({
            name: `System Test Player ${i}`,
            ratings: {
                height: 70 + (i % 3) * 10,
                verticalJump: 70 + ((i + 1) % 3) * 10,
                speedAgility: 70 + ((i + 2) % 3) * 10,
                spiking: 70 + (i % 3) * 10,
                blocking: 70 + ((i + 1) % 3) * 10,
                setting: 70 + ((i + 2) % 3) * 10,
                passing: 70 + (i % 3) * 10,
                defense: 70 + ((i + 1) % 3) * 10,
                serving: 70 + ((i + 2) % 3) * 10,
                gameIQ: 70 + (i % 3) * 10
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter']
        });
    }
    
    // Step 2: Verify players were created
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, playerCount, `Should have ${playerCount} players`);
    
    // Step 3: Mark players as present (simulate selection)
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    
    // Step 4: Check if team generation is possible
    TestRunner.assertTrue(app.canGenerateTeams(), 'Should be able to generate teams');
    
    // Step 5: Get team generation info
    const info = app.getTeamGenerationInfo();
    TestRunner.assertTrue(info.valid, 'Team generation should be valid');
    TestRunner.assertEqual(info.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(info.teamCount, 2, 'Should have 2 teams');
    
    // Step 6: Generate teams
    const presentPlayers = Array.from(state.presentPlayers).map(id => 
        players.find(p => p.id === id)
    );
    const teamConfig = algorithm.generateTeams(presentPlayers);
    
    TestRunner.assertEqual(teamConfig.teams.length, 2, 'Should create 2 teams');
    TestRunner.assertEqual(teamConfig.teamSize, 6, 'Team size should be 6');
    
    // Step 7: Verify all players are assigned
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, playerCount, `All ${playerCount} players should be assigned`);
});

// ============================================
// SYSTEM TEST 2: Data Persistence and Recovery
// ============================================

TestRunner.addTest('System: Data persistence across application restarts', function() {
    // Step 1: Create and save players
    const playersToCreate = 6;
    for (let i = 0; i < playersToCreate; i++) {
        data.addPlayer({
            name: `Persistent Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            },
            preferences: ['Setter', 'Middle Blocker']
        });
    }
    
    // Step 2: Verify players are saved
    const savedPlayers = data.loadPlayers();
    TestRunner.assertEqual(savedPlayers.length, playersToCreate, 'All players should be saved');
    
    // Step 3: Simulate application restart by clearing memory
    state.players = [];
    
    // Step 4: Reload players (simulate app restart)
    state.players = data.loadPlayers();
    TestRunner.assertEqual(state.players.length, playersToCreate, 'All players should be reloaded');
    
    // Step 5: Verify player data integrity
    for (const player of state.players) {
        TestRunner.assertTrue(player.name.startsWith('Persistent Player'), 'Player name should be preserved');
        TestRunner.assertTrue(player.overallScore === 8, 'Overall score should be preserved');
        TestRunner.assertTrue('ratings' in player, 'Ratings should be preserved');
        TestRunner.assertTrue('preferences' in player, 'Preferences should be preserved');
    }
});

// ============================================
// SYSTEM TEST 3: Export and Import Workflow
// ============================================

TestRunner.addTest('System: Export and import player data', function() {
    // Step 1: Create sample players
    app.createSamplePlayers();
    
    // Step 2: Export players
    const exportedData = app.exportPlayers();
    TestRunner.assertTrue(exportedData.length > 0, 'Exported data should not be empty');
    
    // Step 3: Verify exported data is valid JSON
    const parsedData = JSON.parse(exportedData);
    TestRunner.assertTrue(Array.isArray(parsedData), 'Exported data should be an array');
    TestRunner.assertTrue(parsedData.length > 0, 'Exported array should not be empty');
    
    // Step 4: Reset and reimport
    data.resetPlayers();
    const importResult = app.importPlayers(exportedData);
    TestRunner.assertTrue(importResult.success, 'Import should succeed');
    TestRunner.assertEqual(importResult.count, parsedData.length, 'Import count should match');
    
    // Step 5: Verify imported players
    const importedPlayers = data.loadPlayers();
    TestRunner.assertEqual(importedPlayers.length, parsedData.length, 'All players should be imported');
});

// ============================================
// SYSTEM TEST 4: Team Generation with Different Sizes
// ============================================

TestRunner.addTest('System: Team generation with 5v5 configuration', function() {
    // Create 10 players
    for (let i = 0; i < 10; i++) {
        app.handleAddPlayer({
            name: `5v5 Player ${i}`,
            ratings: {
                height: 75, verticalJump: 75, speedAgility: 75, spiking: 75, blocking: 75,
                setting: 75, passing: 75, defense: 75, serving: 75, gameIQ: 75
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter']
        });
    }
    
    const players = data.loadPlayers();
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    
    const presentPlayers = Array.from(state.presentPlayers).map(id => 
        players.find(p => p.id === id)
    );
    
    const teamConfig = algorithm.generateTeams(presentPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 5, 'Team size should be 5');
    TestRunner.assertEqual(teamConfig.teamCount, 2, 'Should have 2 teams');
    
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 10, 'All 10 players should be assigned');
});

TestRunner.addTest('System: Team generation with 7v7 configuration', function() {
    // Create 14 players
    for (let i = 0; i < 14; i++) {
        app.handleAddPlayer({
            name: `7v7 Player ${i}`,
            ratings: {
                height: 75, verticalJump: 75, speedAgility: 75, spiking: 75, blocking: 75,
                setting: 75, passing: 75, defense: 75, serving: 75, gameIQ: 75
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter']
        });
    }
    
    const players = data.loadPlayers();
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    
    const presentPlayers = Array.from(state.presentPlayers).map(id => 
        players.find(p => p.id === id)
    );
    
    const teamConfig = algorithm.generateTeams(presentPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 7, 'Team size should be 7');
    TestRunner.assertEqual(teamConfig.teamCount, 2, 'Should have 2 teams');
    
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 14, 'All 14 players should be assigned');
});

// ============================================
// SYSTEM TEST 5: Player Management Workflow
// ============================================

TestRunner.addTest('System: Complete player lifecycle management', function() {
    // Step 1: Add a player
    const newPlayer = app.handleAddPlayer({
        name: 'Lifecycle Player',
        ratings: {
            height: 9, verticalJump: 8, speedAgility: 9, spiking: 8, blocking: 7,
            setting: 9, passing: 8, defense: 9, serving: 8, gameIQ: 9
        },
        preferences: ['Setter', 'Middle Blocker']
    });
    
    TestRunner.assertNotNull(newPlayer, 'Should return created player');
    TestRunner.assertEqual(newPlayer.name, 'Lifecycle Player', 'Player name should match');
    
    // Step 2: Verify player was saved
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, 1, 'Should have 1 player');
    
    // Step 3: Update the player
    const updatedPlayer = app.handleEditPlayer(newPlayer.id, {
        name: 'Updated Lifecycle Player',
        ratings: {
            height: 10, verticalJump: 9, speedAgility: 10, spiking: 9, blocking: 8,
            setting: 10, passing: 9, defense: 10, serving: 9, gameIQ: 10
        }
    });
    
    TestRunner.assertNotNull(updatedPlayer, 'Should return updated player');
    TestRunner.assertEqual(updatedPlayer.name, 'Updated Lifecycle Player', 'Name should be updated');
    
    // Step 4: Verify update was saved
    const updatedPlayers = data.loadPlayers();
    TestRunner.assertEqual(updatedPlayers.length, 1, 'Should still have 1 player');
    TestRunner.assertEqual(updatedPlayers[0].name, 'Updated Lifecycle Player', 'Name should be updated in storage');
    
    // Step 5: Delete the player
    app.handleDeletePlayer(newPlayer.id);
    
    // Step 6: Verify deletion
    const finalPlayers = data.loadPlayers();
    TestRunner.assertEqual(finalPlayers.length, 0, 'Should have 0 players after deletion');
});

// ============================================
// SYSTEM TEST 6: Statistics and Analytics
// ============================================

TestRunner.addTest('System: Player statistics calculation', function() {
    // Create players with varying scores
    const scores = [5, 6, 7, 8, 9, 10];
    for (let i = 0; i < scores.length; i++) {
        app.handleAddPlayer({
            name: `Stats Player ${i}`,
            ratings: {
                height: scores[i], verticalJump: scores[i], speedAgility: scores[i], 
                spiking: scores[i], blocking: scores[i], setting: scores[i], 
                passing: scores[i], defense: scores[i], serving: scores[i], gameIQ: scores[i]
            },
            preferences: ['Setter']
        });
    }
    
    const stats = app.getPlayerStatistics();
    TestRunner.assertEqual(stats.totalPlayers, scores.length, 'Total players should match');
    TestRunner.assertEqual(stats.highestScore, 10, 'Highest score should be 10');
    TestRunner.assertEqual(stats.lowestScore, 5, 'Lowest score should be 5');
    
    // Average should be (5+6+7+8+9+10)/6 = 45/6 = 7.5
    TestRunner.assertCloseTo(stats.averageScore, 7.5, 0.01, 'Average score should be 7.5');
});

// ============================================
// SYSTEM TEST 7: Error Handling and Edge Cases
// ============================================

TestRunner.addTest('System: Handle invalid team generation gracefully', function() {
    // Create 9 players (invalid for team generation)
    for (let i = 0; i < 9; i++) {
        app.handleAddPlayer({
            name: `Invalid Player ${i}`,
            ratings: {
                height: 75, verticalJump: 75, speedAgility: 75, spiking: 75, blocking: 75,
                setting: 75, passing: 75, defense: 75, serving: 75, gameIQ: 75
            },
            preferences: ['Setter']
        });
    }
    
    const players = data.loadPlayers();
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    
    // Should not be able to generate teams
    TestRunner.assertFalse(app.canGenerateTeams(), 'Should not be able to generate teams with 9 players');
    
    const info = app.getTeamGenerationInfo();
    TestRunner.assertFalse(info.valid, 'Team generation info should be invalid');
    TestRunner.assertTrue('message' in info, 'Should have error message');
});

TestRunner.addTest('System: Handle import of invalid data', function() {
    // Try to import invalid JSON
    const result1 = app.importPlayers('not valid json');
    TestRunner.assertFalse(result1.success, 'Should fail to import invalid JSON');
    TestRunner.assertTrue('error' in result1, 'Should have error message');
    
    // Try to import non-array JSON
    const result2 = app.importPlayers(JSON.stringify({ not: 'an array' }));
    TestRunner.assertFalse(result2.success, 'Should fail to import non-array');
});

// ============================================
// SYSTEM TEST 8: Performance Testing
// ============================================

TestRunner.addTest('System: Performance test with large dataset', function() {
    // Create 100 players
    for (let i = 0; i < 100; i++) {
        app.handleAddPlayer({
            name: `Perf Player ${i}`,
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
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter']
        });
    }
    
    const players = data.loadPlayers();
    
    // Test with 100 players (should be divisible by 5 for 5v5)
    const startTime = Date.now();
    const teamConfig = algorithm.generateTeams(players);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    TestRunner.assertTrue(duration < 5000, `Team generation for 100 players should complete in < 5s, took ${duration}ms`);
    TestRunner.assertEqual(teamConfig.teamSize, 5, 'Team size should be 5 for 100 players');
    TestRunner.assertEqual(teamConfig.teamCount, 20, 'Should have 20 teams');
    
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 100, 'All 100 players should be assigned');
});

// ============================================
// SYSTEM TEST 9: Application Reset
// ============================================

TestRunner.addTest('System: Application reset clears all data', function() {
    // Create some players
    for (let i = 0; i < 5; i++) {
        app.handleAddPlayer({
            name: `Reset Player ${i}`,
            ratings: {
                height: 75, verticalJump: 75, speedAgility: 75, spiking: 75, blocking: 75,
                setting: 75, passing: 75, defense: 75, serving: 75, gameIQ: 75
            },
            preferences: ['Setter']
        });
    }
    
    // Add some present players
    const players = data.loadPlayers();
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    state.selectedPlayerId = players[0].id;
    
    // Verify state before reset
    TestRunner.assertEqual(data.loadPlayers().length, 5, 'Should have 5 players before reset');
    TestRunner.assertEqual(state.presentPlayers.size, 5, 'Should have 5 present players before reset');
    TestRunner.assertNotNull(state.selectedPlayerId, 'Should have selected player before reset');
    
    // Reset application
    app.resetApp();
    
    // Verify state after reset
    TestRunner.assertEqual(data.loadPlayers().length, 0, 'Should have 0 players after reset');
    TestRunner.assertEqual(state.presentPlayers.size, 0, 'Should have 0 present players after reset');
    TestRunner.assertNull(state.selectedPlayerId, 'Should have no selected player after reset');
});

// ============================================
// SYSTEM TEST 10: Sample Data Creation
// ============================================

TestRunner.addTest('System: Sample data creation and usage', function() {
    // Create sample players
    const count = app.createSamplePlayers();
    TestRunner.assertEqual(count, 12, 'Should create 12 sample players');
    
    // Verify players were created
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, 12, 'Should have 12 players');
    
    // Verify all players have valid structure
    for (const player of players) {
        TestRunner.assertTrue('id' in player, 'Player should have id');
        TestRunner.assertTrue('name' in player, 'Player should have name');
        TestRunner.assertTrue('ratings' in player, 'Player should have ratings');
        TestRunner.assertTrue('preferences' in player, 'Player should have preferences');
        TestRunner.assertTrue('overallScore' in player, 'Player should have overallScore');
        
        // Verify ratings have all required attributes
        const requiredAttributes = ['height', 'verticalJump', 'speedAgility', 'spiking', 'blocking', 
                                  'setting', 'passing', 'defense', 'serving', 'gameIQ'];
        for (const attr of requiredAttributes) {
            TestRunner.assertTrue(attr in player.ratings, `Player should have ${attr} rating`);
        }
    }
    
    // Verify we can generate teams with sample data
    for (const player of players) {
        state.presentPlayers.add(player.id);
    }
    
    const presentPlayers = Array.from(state.presentPlayers).map(id => 
        players.find(p => p.id === id)
    );
    
    const teamConfig = algorithm.generateTeams(presentPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(teamConfig.teamCount, 2, 'Should have 2 teams');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner };

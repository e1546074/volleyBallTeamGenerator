// app.test.js - Unit tests for app.js module

// Mock the browser environment and dependencies
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

// Mock state object
global.state = {
    players: [],
    presentPlayers: new Set(),
    selectedPlayerId: null,
    editingPlayerId: null,
    currentView: 'player-list'
};

// Mock all data module functions
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
        id: playerData.id || `test-${Date.now()}`,
        name: playerData.name || '',
        ratings: playerData.ratings || {},
        preferences: playerData.preferences || ['Setter', 'Middle Blocker'],
        overallScore: playerData.overallScore || 0
    };
    players.push(newPlayer);
    global.savePlayers(players);
    return newPlayer;
};

global.updatePlayer = (playerId, playerData) => {
    const players = global.loadPlayers();
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) {
        return null;
    }
    players[index] = { ...players[index], ...playerData, id: playerId };
    global.savePlayers(players);
    return players[index];
};

global.deletePlayer = (playerId) => {
    const players = global.loadPlayers();
    const filteredPlayers = players.filter(p => p.id !== playerId);
    global.savePlayers(filteredPlayers);
    return filteredPlayers;
};

global.deletePlayers = (playerIds) => {
    const players = global.loadPlayers();
    const filteredPlayers = players.filter(p => !playerIds.includes(p.id));
    global.savePlayers(filteredPlayers);
    return filteredPlayers;
};

global.getPlayerById = (playerId) => {
    const players = global.loadPlayers();
    return players.find(p => p.id === playerId) || null;
};

global.getAllPlayers = () => global.loadPlayers();

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

global.getMinimumPlayers = () => 10;

global.generateTeams = (presentPlayers) => {
    const presentPlayerCount = presentPlayers.length;
    const teamConfig = global.determineTeamSize(presentPlayerCount);
    if (!teamConfig) {
        throw new Error('Cannot determine valid team configuration');
    }
    return { teams: [], teamSize: teamConfig.teamSize, teamCount: teamConfig.teamCount, totalPlayers: presentPlayerCount };
};

global.getTeamComposition = (teamSize) => {
    const TEAM_COMPOSITION = {
        6: { minPlayers: 12, positions: { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 2 } },
        5: { minPlayers: 10, positions: { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 1 } },
        7: { minPlayers: 14, positions: { 'Setter': 2, 'Middle Blocker': 3, 'Outside Hitter': 2 } }
    };
    return TEAM_COMPOSITION[teamSize] || null;
};

global.getValidTeamSizes = () => [5, 6, 7];

global.isValidPlayerCount = (playerCount) => global.validateTeamGeneration(playerCount);

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

// Mock console.log to reduce noise
const originalConsoleLog = console.log;
console.log = () => {};

// Load the app module
const app = require('../../app.js');

// Restore console.log
console.log = originalConsoleLog;

// Test framework
const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    addTest: function(name, testFunc) {
        this.tests.push({ name, testFunc });
    },
    
    run: function() {
        console.log('Running app.js unit tests...\n');
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
        
        console.log(`\nApp Unit Tests: ${this.passed} passed, ${this.failed} failed`);
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
// getAppState TESTS
// ============================================

TestRunner.addTest('getAppState returns correct state structure', function() {
    state.players = [{ id: 'p1', name: 'Player 1' }];
    state.presentPlayers.add('p1');
    state.currentView = 'team-generation';
    
    const appState = app.getAppState();
    TestRunner.assertTrue('players' in appState, 'Should have players');
    TestRunner.assertTrue('presentPlayers' in appState, 'Should have presentPlayers');
    TestRunner.assertTrue('selectedPlayerIds' in appState, 'Should have selectedPlayerIds');
    TestRunner.assertTrue('currentView' in appState, 'Should have currentView');
});

TestRunner.addTest('getAppState returns current view', function() {
    state.currentView = 'team-generation';
    const appState = app.getAppState();
    TestRunner.assertEqual(appState.currentView, 'team-generation', 'Current view should match');
});

// ============================================
// canGenerateTeams TESTS
// ============================================

TestRunner.addTest('canGenerateTeams returns true for 12 present players', function() {
    state.presentPlayers.clear();
    for (let i = 0; i < 12; i++) {
        state.presentPlayers.add(`p${i}`);
    }
    
    TestRunner.assertTrue(app.canGenerateTeams(), 'Should be able to generate teams with 12 players');
});

TestRunner.addTest('canGenerateTeams returns true for 10 present players', function() {
    state.presentPlayers.clear();
    for (let i = 0; i < 10; i++) {
        state.presentPlayers.add(`p${i}`);
    }
    
    TestRunner.assertTrue(app.canGenerateTeams(), 'Should be able to generate teams with 10 players');
});

TestRunner.addTest('canGenerateTeams returns false for 9 present players', function() {
    state.presentPlayers.clear();
    for (let i = 0; i < 9; i++) {
        state.presentPlayers.add(`p${i}`);
    }
    
    TestRunner.assertFalse(app.canGenerateTeams(), 'Should not be able to generate teams with 9 players');
});

TestRunner.addTest('canGenerateTeams returns false for 0 present players', function() {
    state.presentPlayers.clear();
    TestRunner.assertFalse(app.canGenerateTeams(), 'Should not be able to generate teams with 0 players');
});

// ============================================
// getTeamGenerationInfo TESTS
// ============================================

TestRunner.addTest('getTeamGenerationInfo returns valid info for 12 players', function() {
    state.presentPlayers.clear();
    for (let i = 0; i < 12; i++) {
        state.presentPlayers.add(`p${i}`);
    }
    
    const info = app.getTeamGenerationInfo();
    TestRunner.assertTrue(info.valid, 'Should be valid');
    TestRunner.assertEqual(info.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(info.teamCount, 2, 'Should have 2 teams');
});

TestRunner.addTest('getTeamGenerationInfo returns invalid for 9 players', function() {
    state.presentPlayers.clear();
    for (let i = 0; i < 9; i++) {
        state.presentPlayers.add(`p${i}`);
    }
    
    const info = app.getTeamGenerationInfo();
    TestRunner.assertFalse(info.valid, 'Should be invalid');
    TestRunner.assertTrue('message' in info, 'Should have error message');
});

// ============================================
// getPlayerStatistics TESTS
// ============================================

TestRunner.addTest('getPlayerStatistics returns zeros for no players', function() {
    localStorageMock.clear();
    const stats = app.getPlayerStatistics();
    TestRunner.assertEqual(stats.totalPlayers, 0, 'Total players should be 0');
    TestRunner.assertEqual(stats.averageScore, 0, 'Average score should be 0');
    TestRunner.assertEqual(stats.highestScore, 0, 'Highest score should be 0');
    TestRunner.assertEqual(stats.lowestScore, 0, 'Lowest score should be 0');
});

// ============================================
// exportPlayers TESTS
// ============================================

TestRunner.addTest('exportPlayers returns JSON string', function() {
    localStorageMock.clear();
    const exported = app.exportPlayers();
    TestRunner.assertEqual(typeof exported, 'string', 'Should return a string');
});

TestRunner.addTest('exportPlayers returns valid JSON', function() {
    localStorageMock.clear();
    const exported = app.exportPlayers();
    try {
        JSON.parse(exported);
        TestRunner.assertTrue(true, 'Should be valid JSON');
    } catch (error) {
        TestRunner.assertTrue(false, 'Should be valid JSON');
    }
});

// ============================================
// importPlayers TESTS
// ============================================

TestRunner.addTest('importPlayers returns success for valid JSON', function() {
    localStorageMock.clear();
    const validJSON = JSON.stringify([
        { id: 'p1', name: 'Player 1', ratings: {}, preferences: ['Setter'], overallScore: 8 }
    ]);
    
    const result = app.importPlayers(validJSON);
    TestRunner.assertTrue(result.success, 'Import should succeed');
    TestRunner.assertEqual(result.count, 1, 'Should import 1 player');
});

TestRunner.addTest('importPlayers returns failure for invalid JSON', function() {
    localStorageMock.clear();
    const result = app.importPlayers('invalid json');
    TestRunner.assertFalse(result.success, 'Import should fail');
    TestRunner.assertTrue('error' in result, 'Should have error message');
});

TestRunner.addTest('importPlayers returns failure for non-array JSON', function() {
    localStorageMock.clear();
    const result = app.importPlayers(JSON.stringify({ not: 'an array' }));
    TestRunner.assertFalse(result.success, 'Import should fail for non-array');
});

// ============================================
// resetApp TESTS
// ============================================

TestRunner.addTest('resetApp clears all data', function() {
    localStorageMock.clear();
    // Add some data
    localStorageMock.setItem('volleyballPlayers', JSON.stringify([{ id: 'p1', name: 'P1' }]));
    state.players = [{ id: 'p1', name: 'P1' }];
    state.presentPlayers.add('p1');
    state.selectedPlayerId = 'p1';
    
    app.resetApp();
    
    TestRunner.assertEqual(state.players.length, 0, 'Players should be cleared');
    TestRunner.assertEqual(state.presentPlayers.size, 0, 'Present players should be cleared');
    TestRunner.assertNull(state.selectedPlayerId, 'Selected player should be cleared');
});

// ============================================
// createSamplePlayers TESTS
// ============================================

TestRunner.addTest('createSamplePlayers creates 12 players', function() {
    localStorageMock.clear();
    const count = app.createSamplePlayers();
    TestRunner.assertEqual(count, 12, 'Should create 12 sample players');
    
    // Check that players were saved
    const players = JSON.parse(localStorageMock.getItem('volleyballPlayers') || '[]');
    TestRunner.assertEqual(players.length, 12, 'Should have 12 players in storage');
});

// ============================================
// performanceTest TESTS
// ============================================

TestRunner.addTest('performanceTest returns results object', function() {
    const result = app.performanceTest();
    TestRunner.assertTrue('time12' in result, 'Should have time12');
    TestRunner.assertTrue('time10' in result, 'Should have time10');
    TestRunner.assertTrue('time14' in result, 'Should have time14');
    TestRunner.assertTrue('time100' in result, 'Should have time100');
    TestRunner.assertTrue('passed' in result, 'Should have passed flag');
});

TestRunner.addTest('performanceTest completes in reasonable time', function() {
    const result = app.performanceTest();
    TestRunner.assertTrue(result.time100 < 2000, '100 players should complete in < 2s');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner, app };

// data_algorithm.test.js - Integration tests for data and algorithm modules

const data = require('../../data.js');
const algorithm = require('../../algorithm.js');

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

global.localStorage = localStorageMock;

// Test framework
const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    addTest: function(name, testFunc) {
        this.tests.push({ name, testFunc });
    },
    
    run: function() {
        console.log('Running data-algorithm integration tests...\n');
        this.passed = 0;
        this.failed = 0;
        
        for (const test of this.tests) {
            try {
                localStorageMock.clear();
                test.testFunc();
                console.log(`✓ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\nIntegration Tests (Data-Algorithm): ${this.passed} passed, ${this.failed} failed`);
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
    }
};

// ============================================
// DATA TO ALGORITHM INTEGRATION TESTS
// ============================================

TestRunner.addTest('Player created by data module can be scored by algorithm', function() {
    const playerData = {
        name: 'Integration Test Player',
        ratings: {
            height: 80, verticalJump: 70, speedAgility: 90, spiking: 85, blocking: 75,
            setting: 95, passing: 80, defense: 85, serving: 75, gameIQ: 90
        }
    };
    
    const player = data.createPlayer(playerData);
    
    // Calculate position scores
    const setterScore = algorithm.calculatePositionScore(player, 'Setter');
    const mbScore = algorithm.calculatePositionScore(player, 'Middle Blocker');
    const ohScore = algorithm.calculatePositionScore(player, 'Outside Hitter');
    
    TestRunner.assertTrue(setterScore > 0, 'Setter score should be positive');
    TestRunner.assertTrue(mbScore > 0, 'Middle Blocker score should be positive');
    TestRunner.assertTrue(ohScore > 0, 'Outside Hitter score should be positive');
});

TestRunner.addTest('Player with high setting score has high Setter position score', function() {
    const playerData = {
        name: 'Setter Specialist',
        ratings: {
            height: 50, verticalJump: 50, speedAgility: 50, spiking: 50, blocking: 50,
            setting: 100, passing: 50, defense: 50, serving: 50, gameIQ: 50
        }
    };
    
    const player = data.createPlayer(playerData);
    const scores = algorithm.calculateAllPositionScores(player);
    
    // Setter should have the highest score for this player
    TestRunner.assertTrue(scores['Setter'] > scores['Middle Blocker'], 
        'Setter should have highest score for setting specialist');
    TestRunner.assertTrue(scores['Setter'] > scores['Outside Hitter'], 
        'Setter should have highest score for setting specialist');
});

TestRunner.addTest('Player with high blocking score has high Middle Blocker position score', function() {
    const playerData = {
        name: 'Blocker Specialist',
        ratings: {
            height: 100, verticalJump: 100, speedAgility: 50, spiking: 50, blocking: 100,
            setting: 50, passing: 50, defense: 50, serving: 50, gameIQ: 50
        }
    };
    
    const player = data.createPlayer(playerData);
    const scores = algorithm.calculateAllPositionScores(player);
    
    // Middle Blocker should have the highest score for this player
    TestRunner.assertTrue(scores['Middle Blocker'] > scores['Setter'], 
        'Middle Blocker should have highest score for blocking specialist');
    TestRunner.assertTrue(scores['Middle Blocker'] > scores['Outside Hitter'], 
        'Middle Blocker should have highest score for blocking specialist');
});

TestRunner.addTest('Player with high spiking score has high Outside Hitter position score', function() {
    const playerData = {
        name: 'Spiker Specialist',
        ratings: {
            height: 50, verticalJump: 100, speedAgility: 100, spiking: 100, blocking: 50,
            setting: 50, passing: 50, defense: 50, serving: 50, gameIQ: 50
        }
    };
    
    const player = data.createPlayer(playerData);
    const scores = algorithm.calculateAllPositionScores(player);
    
    // Outside Hitter should have the highest score for this player
    TestRunner.assertTrue(scores['Outside Hitter'] > scores['Setter'], 
        'Outside Hitter should have highest score for spiking specialist');
    TestRunner.assertTrue(scores['Outside Hitter'] > scores['Middle Blocker'], 
        'Outside Hitter should have highest score for spiking specialist');
});

// ============================================
// FULL WORKFLOW INTEGRATION TESTS
// ============================================

TestRunner.addTest('Full workflow: Create players, save, load, and generate teams', function() {
    localStorageMock.clear();
    
    // Create 12 players
    const players = [];
    for (let i = 0; i < 12; i++) {
        const playerData = {
            name: `Workflow Player ${i}`,
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
        };
        players.push(data.createPlayer(playerData));
    }
    
    // Save players
    data.savePlayers(players);
    
    // Load players
    const loadedPlayers = data.loadPlayers();
    TestRunner.assertEqual(loadedPlayers.length, 12, 'Should load all 12 players');
    
    // Generate teams
    const teamConfig = algorithm.generateTeams(loadedPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(teamConfig.teamCount, 2, 'Should have 2 teams');
    TestRunner.assertEqual(teamConfig.teams.length, 2, 'Should create 2 teams');
    
    // Check all players are assigned
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 12, 'All 12 players should be assigned');
});

TestRunner.addTest('Full workflow: Validate team generation with loaded players', function() {
    localStorageMock.clear();
    
    // Create 10 players
    const players = [];
    for (let i = 0; i < 10; i++) {
        players.push(data.createPlayer({
            name: `Validation Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            }
        }));
    }
    
    data.savePlayers(players);
    const loadedPlayers = data.loadPlayers();
    
    // Validate
    TestRunner.assertTrue(algorithm.validateTeamGeneration(loadedPlayers.length), 
        'Should validate 10 players');
    
    // Generate teams
    const teamConfig = algorithm.generateTeams(loadedPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 5, 'Team size should be 5 for 10 players');
});

TestRunner.addTest('Full workflow: Player overall score matches algorithm calculation', function() {
    const playerData = {
        name: 'Score Match Player',
        ratings: {
            height: 8, verticalJump: 7, speedAgility: 9, spiking: 8, blocking: 6,
            setting: 5, passing: 7, defense: 8, serving: 7, gameIQ: 8
        }
    };
    
    const player = data.createPlayer(playerData);
    
    // Player's overall score should be the average of all ratings
    const expectedOverall = (8 + 7 + 9 + 8 + 6 + 5 + 7 + 8 + 7 + 8) / 10;
    TestRunner.assertCloseTo(player.overallScore, expectedOverall, 0.01, 
        `Overall score should be ${expectedOverall}, got ${player.overallScore}`);
    
    // Now calculate position scores
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertTrue(scores['Setter'] > 0, 'Setter score should be positive');
    TestRunner.assertTrue(scores['Middle Blocker'] > 0, 'Middle Blocker score should be positive');
    TestRunner.assertTrue(scores['Outside Hitter'] > 0, 'Outside Hitter score should be positive');
});

// ============================================
// TEAM GENERATION WITH REALISTIC DATA
// ============================================

TestRunner.addTest('Team generation with specialized players assigns correctly', function() {
    localStorageMock.clear();
    
    // Create players with different specializations
    const setters = [];
    for (let i = 0; i < 2; i++) {
        setters.push(data.createPlayer({
            name: `Setter ${i}`,
            ratings: {
                height: 70, verticalJump: 70, speedAgility: 80, spiking: 60, blocking: 60,
                setting: 95, passing: 85, defense: 80, serving: 75, gameIQ: 90
            },
            preferences: ['Setter', 'Outside Hitter']
        }));
    }
    
    const middleBlockers = [];
    for (let i = 0; i < 2; i++) {
        middleBlockers.push(data.createPlayer({
            name: `Middle Blocker ${i}`,
            ratings: {
                height: 95, verticalJump: 90, speedAgility: 75, spiking: 85, blocking: 95,
                setting: 60, passing: 70, defense: 75, serving: 70, gameIQ: 75
            },
            preferences: ['Middle Blocker', 'Setter']
        }));
    }
    
    const outsideHitters = [];
    for (let i = 0; i < 2; i++) {
        outsideHitters.push(data.createPlayer({
            name: `Outside Hitter ${i}`,
            ratings: {
                height: 80, verticalJump: 90, speedAgility: 90, spiking: 95, blocking: 80,
                setting: 70, passing: 85, defense: 85, serving: 80, gameIQ: 85
            },
            preferences: ['Outside Hitter', 'Middle Blocker']
        }));
    }
    
    const allPlayers = [...setters, ...middleBlockers, ...outsideHitters];
    data.savePlayers(allPlayers);
    const loadedPlayers = data.loadPlayers();
    
    // Generate teams
    const teamConfig = algorithm.generateTeams(loadedPlayers);
    
    // Check that teams were created
    TestRunner.assertEqual(teamConfig.teams.length, 2, 'Should create 2 teams');
    
    // Check that all players are assigned
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 6, 'All 6 players should be assigned');
});

TestRunner.addTest('Team generation with 14 players creates 7v7 teams', function() {
    localStorageMock.clear();
    
    const players = [];
    for (let i = 0; i < 14; i++) {
        players.push(data.createPlayer({
            name: `7v7 Player ${i}`,
            ratings: {
                height: 75, verticalJump: 75, speedAgility: 75, spiking: 75, blocking: 75,
                setting: 75, passing: 75, defense: 75, serving: 75, gameIQ: 75
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter']
        }));
    }
    
    data.savePlayers(players);
    const loadedPlayers = data.loadPlayers();
    
    const teamConfig = algorithm.generateTeams(loadedPlayers);
    TestRunner.assertEqual(teamConfig.teamSize, 7, 'Team size should be 7');
    TestRunner.assertEqual(teamConfig.teamCount, 2, 'Should have 2 teams');
    
    const totalAssigned = teamConfig.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 14, 'All 14 players should be assigned');
});

// ============================================
// EDGE CASES
// ============================================

TestRunner.addTest('Integration handles player with all zero ratings', function() {
    const player = data.createPlayer({
        name: 'Zero Player',
        ratings: {
            height: 0, verticalJump: 0, speedAgility: 0, spiking: 0, blocking: 0,
            setting: 0, passing: 0, defense: 0, serving: 0, gameIQ: 0
        }
    });
    
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertEqual(scores['Setter'], 0, 'Setter score should be 0');
    TestRunner.assertEqual(scores['Middle Blocker'], 0, 'Middle Blocker score should be 0');
    TestRunner.assertEqual(scores['Outside Hitter'], 0, 'Outside Hitter score should be 0');
});

TestRunner.addTest('Integration handles player with max ratings', function() {
    const player = data.createPlayer({
        name: 'Max Player',
        ratings: {
            height: 10, verticalJump: 10, speedAgility: 10, spiking: 10, blocking: 10,
            setting: 10, passing: 10, defense: 10, serving: 10, gameIQ: 10
        }
    });
    
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertEqual(scores['Setter'], 10, 'Setter score should be 10');
    TestRunner.assertEqual(scores['Middle Blocker'], 10, 'Middle Blocker score should be 10');
    TestRunner.assertEqual(scores['Outside Hitter'], 10, 'Outside Hitter score should be 10');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner };

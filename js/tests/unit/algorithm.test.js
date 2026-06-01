// algorithm.test.js - Comprehensive unit tests for algorithm.js module

const algorithm = require('../../algorithm.js');

// Test framework
const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    addTest: function(name, testFunc) {
        this.tests.push({ name, testFunc });
    },
    
    run: function() {
        console.log('Running algorithm.js unit tests...\n');
        this.passed = 0;
        this.failed = 0;
        
        for (const test of this.tests) {
            try {
                test.testFunc();
                console.log(`✓ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\nAlgorithm Unit Tests: ${this.passed} passed, ${this.failed} failed`);
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
    },
    
    assertThrows: function(func, message) {
        let threw = false;
        try {
            func();
        } catch (error) {
            threw = true;
        }
        this.assert(threw, message || 'Expected function to throw');
    }
};

// ============================================
// POSITION WEIGHTS TESTS
// ============================================

TestRunner.addTest('POSITION_WEIGHTS has all three positions', function() {
    const positions = Object.keys(algorithm.POSITION_WEIGHTS);
    TestRunner.assertTrue(positions.includes('Setter'), 'Should have Setter');
    TestRunner.assertTrue(positions.includes('Middle Blocker'), 'Should have Middle Blocker');
    TestRunner.assertTrue(positions.includes('Outside Hitter'), 'Should have Outside Hitter');
});

TestRunner.addTest('Each position has all 10 attributes', function() {
    const expectedAttributes = ['height', 'verticalJump', 'speedAgility', 'spiking', 'blocking', 
                               'setting', 'passing', 'defense', 'serving', 'gameIQ'];
    
    for (const position of Object.keys(algorithm.POSITION_WEIGHTS)) {
        const attributes = Object.keys(algorithm.POSITION_WEIGHTS[position]);
        for (const attr of expectedAttributes) {
            TestRunner.assertTrue(attributes.includes(attr), 
                `${position} should have ${attr} attribute`);
        }
    }
});

TestRunner.addTest('Setter weights sum to 1.00', function() {
    const weights = algorithm.POSITION_WEIGHTS['Setter'];
    const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Setter weights sum to ${sum}`);
});

TestRunner.addTest('Middle Blocker weights sum to 1.00', function() {
    const weights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Middle Blocker weights sum to ${sum}`);
});

TestRunner.addTest('Outside Hitter weights sum to 1.00', function() {
    const weights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Outside Hitter weights sum to ${sum}`);
});

// ============================================
// TEAM COMPOSITION TESTS
// ============================================

TestRunner.addTest('TEAM_COMPOSITION has all team sizes', function() {
    const sizes = Object.keys(algorithm.TEAM_COMPOSITION).map(Number);
    TestRunner.assertTrue(sizes.includes(5), 'Should have team size 5');
    TestRunner.assertTrue(sizes.includes(6), 'Should have team size 6');
    TestRunner.assertTrue(sizes.includes(7), 'Should have team size 7');
});

TestRunner.addTest('Team size 6 requires 12 players minimum', function() {
    const config = algorithm.TEAM_COMPOSITION[6];
    TestRunner.assertEqual(config.minPlayers, 12, 'Min players for size 6 should be 12');
    TestRunner.assertEqual(config.positions['Setter'], 2, 'Should have 2 Setters');
    TestRunner.assertEqual(config.positions['Middle Blocker'], 2, 'Should have 2 Middle Blockers');
    TestRunner.assertEqual(config.positions['Outside Hitter'], 2, 'Should have 2 Outside Hitters');
});

TestRunner.addTest('Team size 5 requires 10 players minimum', function() {
    const config = algorithm.TEAM_COMPOSITION[5];
    TestRunner.assertEqual(config.minPlayers, 10, 'Min players for size 5 should be 10');
});

TestRunner.addTest('Team size 7 requires 14 players minimum', function() {
    const config = algorithm.TEAM_COMPOSITION[7];
    TestRunner.assertEqual(config.minPlayers, 14, 'Min players for size 7 should be 14');
});

// ============================================
// calculatePositionScore TESTS
// ============================================

TestRunner.addTest('calculatePositionScore with max ratings returns 10', function() {
    const player = {
        ratings: {
            height: 100, verticalJump: 100, speedAgility: 100, spiking: 100, blocking: 100,
            setting: 100, passing: 100, defense: 100, serving: 100, gameIQ: 100
        }
    };
    
    const setterScore = algorithm.calculatePositionScore(player, 'Setter');
    const mbScore = algorithm.calculatePositionScore(player, 'Middle Blocker');
    const ohScore = algorithm.calculatePositionScore(player, 'Outside Hitter');
    
    TestRunner.assertEqual(setterScore, 10.0, `Setter score should be 10, got ${setterScore}`);
    TestRunner.assertEqual(mbScore, 10.0, `Middle Blocker score should be 10, got ${mbScore}`);
    TestRunner.assertEqual(ohScore, 10.0, `Outside Hitter score should be 10, got ${ohScore}`);
});

TestRunner.addTest('calculatePositionScore with zero ratings returns 0', function() {
    const player = {
        ratings: {
            height: 0, verticalJump: 0, speedAgility: 0, spiking: 0, blocking: 0,
            setting: 0, passing: 0, defense: 0, serving: 0, gameIQ: 0
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    TestRunner.assertEqual(score, 0, `Score should be 0, got ${score}`);
});

TestRunner.addTest('calculatePositionScore with partial ratings', function() {
    const player = {
        ratings: {
            height: 50, verticalJump: 50, speedAgility: 50, spiking: 50, blocking: 50,
            setting: 50, passing: 50, defense: 50, serving: 50, gameIQ: 50
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    TestRunner.assertEqual(score, 5.0, `Score should be 5, got ${score}`);
});

TestRunner.addTest('calculatePositionScore returns 0 for unknown position', function() {
    const player = {
        ratings: {
            height: 100, verticalJump: 100, speedAgility: 100, spiking: 100, blocking: 100,
            setting: 100, passing: 100, defense: 100, serving: 100, gameIQ: 100
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Unknown Position');
    TestRunner.assertEqual(score, 0, 'Unknown position should return 0');
});

TestRunner.addTest('calculatePositionScore handles missing ratings', function() {
    const player = {
        ratings: {
            height: 100
            // Missing other ratings
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    // Only height contributes, so score should be based on height weight
    const expected = (100 * algorithm.POSITION_WEIGHTS['Setter'].height / 100) * 10;
    TestRunner.assertCloseTo(score, expected, 0.01, 
        `Score should be ${expected}, got ${score}`);
});

// ============================================
// calculateAllPositionScores TESTS
// ============================================

TestRunner.addTest('calculateAllPositionScores returns scores for all positions', function() {
    const player = {
        ratings: {
            height: 100, verticalJump: 100, speedAgility: 100, spiking: 100, blocking: 100,
            setting: 100, passing: 100, defense: 100, serving: 100, gameIQ: 100
        }
    };
    
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertTrue('Setter' in scores, 'Should have Setter score');
    TestRunner.assertTrue('Middle Blocker' in scores, 'Should have Middle Blocker score');
    TestRunner.assertTrue('Outside Hitter' in scores, 'Should have Outside Hitter score');
});

TestRunner.addTest('calculateAllPositionScores with max ratings', function() {
    const player = {
        ratings: {
            height: 100, verticalJump: 100, speedAgility: 100, spiking: 100, blocking: 100,
            setting: 100, passing: 100, defense: 100, serving: 100, gameIQ: 100
        }
    };
    
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertEqual(scores['Setter'], 10.0, 'Setter score should be 10');
    TestRunner.assertEqual(scores['Middle Blocker'], 10.0, 'Middle Blocker score should be 10');
    TestRunner.assertEqual(scores['Outside Hitter'], 10.0, 'Outside Hitter score should be 10');
});

// ============================================
// determineTeamSize TESTS
// ============================================

TestRunner.addTest('determineTeamSize for 12 players returns size 6', function() {
    const result = algorithm.determineTeamSize(12);
    TestRunner.assertEqual(result.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(result.teamCount, 2, 'Should have 2 teams');
});

TestRunner.addTest('determineTeamSize for 10 players returns size 5', function() {
    const result = algorithm.determineTeamSize(10);
    TestRunner.assertEqual(result.teamSize, 5, 'Team size should be 5');
    TestRunner.assertEqual(result.teamCount, 2, 'Should have 2 teams');
});

TestRunner.addTest('determineTeamSize for 14 players returns size 7', function() {
    const result = algorithm.determineTeamSize(14);
    TestRunner.assertEqual(result.teamSize, 7, 'Team size should be 7');
    TestRunner.assertEqual(result.teamCount, 2, 'Should have 2 teams');
});

TestRunner.addTest('determineTeamSize for 24 players returns size 6', function() {
    const result = algorithm.determineTeamSize(24);
    TestRunner.assertEqual(result.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(result.teamCount, 4, 'Should have 4 teams');
});

TestRunner.addTest('determineTeamSize for 9 players returns null', function() {
    const result = algorithm.determineTeamSize(9);
    TestRunner.assertNull(result, 'Should return null for invalid count');
});

TestRunner.addTest('determineTeamSize for 11 players returns null', function() {
    const result = algorithm.determineTeamSize(11);
    TestRunner.assertNull(result, 'Should return null for invalid count');
});

// ============================================
// validateTeamGeneration TESTS
// ============================================

TestRunner.addTest('validateTeamGeneration returns true for 12 players', function() {
    TestRunner.assertTrue(algorithm.validateTeamGeneration(12), 
        'Should validate 12 players');
});

TestRunner.addTest('validateTeamGeneration returns true for 10 players', function() {
    TestRunner.assertTrue(algorithm.validateTeamGeneration(10), 
        'Should validate 10 players');
});

TestRunner.addTest('validateTeamGeneration returns true for 14 players', function() {
    TestRunner.assertTrue(algorithm.validateTeamGeneration(14), 
        'Should validate 14 players');
});

TestRunner.addTest('validateTeamGeneration returns false for 9 players', function() {
    TestRunner.assertFalse(algorithm.validateTeamGeneration(9), 
        'Should not validate 9 players');
});

TestRunner.addTest('validateTeamGeneration returns false for 11 players', function() {
    TestRunner.assertFalse(algorithm.validateTeamGeneration(11), 
        'Should not validate 11 players');
});

// ============================================
// getMinimumPlayers TESTS
// ============================================

TestRunner.addTest('getMinimumPlayers returns 10', function() {
    const min = algorithm.getMinimumPlayers();
    TestRunner.assertEqual(min, 10, `Minimum should be 10, got ${min}`);
});

// ============================================
// initializeTeams TESTS
// ============================================

TestRunner.addTest('initializeTeams creates correct number of teams', function() {
    const composition = { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 2 };
    const teams = algorithm.initializeTeams(2, composition);
    TestRunner.assertEqual(teams.length, 2, 'Should create 2 teams');
});

TestRunner.addTest('initializeTeams sets correct team IDs', function() {
    const composition = { 'Setter': 1, 'Middle Blocker': 1, 'Outside Hitter': 1 };
    const teams = algorithm.initializeTeams(1, composition);
    TestRunner.assertEqual(teams[0].id, 'team-1', 'Team ID should be team-1');
});

TestRunner.addTest('initializeTeams sets position slots', function() {
    const composition = { 'Setter': 2, 'Middle Blocker': 2, 'Outside Hitter': 2 };
    const teams = algorithm.initializeTeams(1, composition);
    TestRunner.assertEqual(teams[0].positionSlots['Setter'], 2, 'Should have 2 Setter slots');
    TestRunner.assertEqual(teams[0].positionSlots['Middle Blocker'], 2, 'Should have 2 Middle Blocker slots');
    TestRunner.assertEqual(teams[0].positionSlots['Outside Hitter'], 2, 'Should have 2 Outside Hitter slots');
});

// ============================================
// findTeamWithLowestScore TESTS
// ============================================

TestRunner.addTest('findTeamWithLowestScore returns team with lowest score', function() {
    const teams = [
        { totalScore: 100, positionSlots: {} },
        { totalScore: 50, positionSlots: {} },
        { totalScore: 75, positionSlots: {} }
    ];
    
    const lowest = algorithm.findTeamWithLowestScore(teams);
    TestRunner.assertEqual(lowest.totalScore, 50, 'Should return team with score 50');
});

TestRunner.addTest('findTeamWithLowestScore returns null for empty array', function() {
    const lowest = algorithm.findTeamWithLowestScore([]);
    TestRunner.assertNull(lowest, 'Should return null for empty array');
});

// ============================================
// getUnoccupiedSlots TESTS
// ============================================

TestRunner.addTest('getUnoccupiedSlots returns all slots with counts > 0', function() {
    const team = {
        positionSlots: {
            'Setter': 2,
            'Middle Blocker': 1,
            'Outside Hitter': 0
        }
    };
    
    const slots = algorithm.getUnoccupiedSlots(team);
    TestRunner.assertEqual(slots.length, 3, 'Should return 3 slots (2 Setter + 1 Middle Blocker)');
    TestRunner.assertTrue(slots.includes('Setter'), 'Should include Setter');
    TestRunner.assertTrue(slots.includes('Middle Blocker'), 'Should include Middle Blocker');
});

TestRunner.addTest('getUnoccupiedSlots returns empty array when no slots', function() {
    const team = {
        positionSlots: {
            'Setter': 0,
            'Middle Blocker': 0
        }
    };
    
    const slots = algorithm.getUnoccupiedSlots(team);
    TestRunner.assertEqual(slots.length, 0, 'Should return empty array');
});

// ============================================
// playerMatchesSlots TESTS
// ============================================

TestRunner.addTest('playerMatchesSlots returns true when preference matches', function() {
    const player = { preferences: ['Setter', 'Middle Blocker'] };
    const slots = ['Setter', 'Outside Hitter'];
    
    TestRunner.assertTrue(algorithm.playerMatchesSlots(player, slots), 
        'Should match when first preference is in slots');
});

TestRunner.addTest('playerMatchesSlots returns true when second preference matches', function() {
    const player = { preferences: ['Outside Hitter', 'Setter'] };
    const slots = ['Middle Blocker', 'Setter'];
    
    TestRunner.assertTrue(algorithm.playerMatchesSlots(player, slots), 
        'Should match when second preference is in slots');
});

TestRunner.addTest('playerMatchesSlots returns false when no match', function() {
    const player = { preferences: ['Setter', 'Middle Blocker'] };
    const slots = ['Outside Hitter'];
    
    TestRunner.assertFalse(algorithm.playerMatchesSlots(player, slots), 
        'Should not match when no preferences are in slots');
});

TestRunner.addTest('playerMatchesSlots returns false when no preferences', function() {
    const player = { preferences: [] };
    const slots = ['Setter'];
    
    TestRunner.assertFalse(algorithm.playerMatchesSlots(player, slots), 
        'Should not match when player has no preferences');
});

// ============================================
// findMostPreferredSlot TESTS
// ============================================

TestRunner.addTest('findMostPreferredSlot returns first preference when available', function() {
    const player = { preferences: ['Setter', 'Middle Blocker'] };
    const slots = ['Setter', 'Middle Blocker', 'Outside Hitter'];
    
    const slot = algorithm.findMostPreferredSlot(player, slots);
    TestRunner.assertEqual(slot, 'Setter', 'Should return first preference');
});

TestRunner.addTest('findMostPreferredSlot returns second preference when first not available', function() {
    const player = { preferences: ['Setter', 'Middle Blocker'] };
    const slots = ['Middle Blocker', 'Outside Hitter'];
    
    const slot = algorithm.findMostPreferredSlot(player, slots);
    TestRunner.assertEqual(slot, 'Middle Blocker', 'Should return second preference');
});

TestRunner.addTest('findMostPreferredSlot returns first available when no preference matches', function() {
    const player = { preferences: ['Middle Blocker', 'Setter'] };
    const slots = ['Outside Hitter', 'Setter'];
    
    const slot = algorithm.findMostPreferredSlot(player, slots);
    TestRunner.assertEqual(slot, 'Setter', 'Should return first matching preference');
});

// ============================================
// assignPlayerToTeam TESTS
// ============================================

TestRunner.addTest('assignPlayerToTeam adds player to team', function() {
    const team = {
        players: [],
        totalScore: 0,
        positionSlots: { 'Setter': 1 }
    };
    
    const player = { id: 'p1', overallScore: 8.5 };
    algorithm.assignPlayerToTeam(team, player, 'Setter');
    
    TestRunner.assertEqual(team.players.length, 1, 'Should have 1 player');
    TestRunner.assertEqual(team.players[0].playerId, 'p1', 'Player ID should match');
    TestRunner.assertEqual(team.totalScore, 8.5, 'Total score should be updated');
});

TestRunner.addTest('assignPlayerToTeam decrements position slot count', function() {
    const team = {
        players: [],
        totalScore: 0,
        positionSlots: { 'Setter': 2 }
    };
    
    const player = { id: 'p1', overallScore: 5 };
    algorithm.assignPlayerToTeam(team, player, 'Setter');
    
    TestRunner.assertEqual(team.positionSlots['Setter'], 1, 'Slot count should be decremented');
});

TestRunner.addTest('assignPlayerToTeam removes position when count reaches zero', function() {
    const team = {
        players: [],
        totalScore: 0,
        positionSlots: { 'Setter': 1 }
    };
    
    const player = { id: 'p1', overallScore: 5 };
    algorithm.assignPlayerToTeam(team, player, 'Setter');
    
    TestRunner.assertTrue(!('Setter' in team.positionSlots), 'Position should be removed when count is 0');
});

// ============================================
// generateTeams TESTS
// ============================================

TestRunner.addTest('generateTeams creates correct number of teams for 12 players', function() {
    const players = [];
    for (let i = 0; i < 12; i++) {
        players.push({
            id: `p${i}`,
            name: `Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter'],
            overallScore: 8.0
        });
    }
    
    const result = algorithm.generateTeams(players);
    TestRunner.assertEqual(result.teamSize, 6, 'Team size should be 6');
    TestRunner.assertEqual(result.teamCount, 2, 'Should have 2 teams');
    TestRunner.assertEqual(result.teams.length, 2, 'Should create 2 teams');
});

TestRunner.addTest('generateTeams creates correct number of teams for 10 players', function() {
    const players = [];
    for (let i = 0; i < 10; i++) {
        players.push({
            id: `p${i}`,
            name: `Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter'],
            overallScore: 8.0
        });
    }
    
    const result = algorithm.generateTeams(players);
    TestRunner.assertEqual(result.teamSize, 5, 'Team size should be 5');
    TestRunner.assertEqual(result.teamCount, 2, 'Should have 2 teams');
});

TestRunner.addTest('generateTeams throws error for invalid player count', function() {
    const players = [];
    for (let i = 0; i < 9; i++) {
        players.push({
            id: `p${i}`,
            name: `Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter'],
            overallScore: 8.0
        });
    }
    
    TestRunner.assertThrows(() => {
        algorithm.generateTeams(players);
    }, 'Should throw error for 9 players');
});

TestRunner.addTest('generateTeams assigns all players to teams', function() {
    const players = [];
    for (let i = 0; i < 12; i++) {
        players.push({
            id: `p${i}`,
            name: `Player ${i}`,
            ratings: {
                height: 80, verticalJump: 80, speedAgility: 80, spiking: 80, blocking: 80,
                setting: 80, passing: 80, defense: 80, serving: 80, gameIQ: 80
            },
            preferences: ['Setter', 'Middle Blocker', 'Outside Hitter'],
            overallScore: 8.0
        });
    }
    
    const result = algorithm.generateTeams(players);
    const totalAssigned = result.teams.reduce((sum, team) => sum + team.players.length, 0);
    TestRunner.assertEqual(totalAssigned, 12, 'All 12 players should be assigned');
});

// ============================================
// getTeamComposition TESTS
// ============================================

TestRunner.addTest('getTeamComposition returns correct composition for size 6', function() {
    const composition = algorithm.getTeamComposition(6);
    TestRunner.assertNotNull(composition, 'Should return composition');
    TestRunner.assertEqual(composition.minPlayers, 12, 'Min players should be 12');
});

TestRunner.addTest('getTeamComposition returns null for invalid size', function() {
    const composition = algorithm.getTeamComposition(8);
    TestRunner.assertNull(composition, 'Should return null for invalid size');
});

// ============================================
// getValidTeamSizes TESTS
// ============================================

TestRunner.addTest('getValidTeamSizes returns all valid sizes', function() {
    const sizes = algorithm.getValidTeamSizes();
    TestRunner.assertTrue(sizes.includes(5), 'Should include 5');
    TestRunner.assertTrue(sizes.includes(6), 'Should include 6');
    TestRunner.assertTrue(sizes.includes(7), 'Should include 7');
});

// ============================================
// isValidPlayerCount TESTS
// ============================================

TestRunner.addTest('isValidPlayerCount returns true for valid counts', function() {
    TestRunner.assertTrue(algorithm.isValidPlayerCount(10), '10 should be valid');
    TestRunner.assertTrue(algorithm.isValidPlayerCount(12), '12 should be valid');
    TestRunner.assertTrue(algorithm.isValidPlayerCount(14), '14 should be valid');
    TestRunner.assertTrue(algorithm.isValidPlayerCount(20), '20 should be valid');
});

TestRunner.addTest('isValidPlayerCount returns false for invalid counts', function() {
    TestRunner.assertFalse(algorithm.isValidPlayerCount(9), '9 should be invalid');
    TestRunner.assertFalse(algorithm.isValidPlayerCount(11), '11 should be invalid');
    TestRunner.assertFalse(algorithm.isValidPlayerCount(13), '13 should be invalid');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner, algorithm };

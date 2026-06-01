// data.test.js - Unit tests for data.js module

const data = require('../../data.js');

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

// Override localStorage in data module
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
        console.log('Running data.js unit tests...\n');
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
        
        console.log(`\nData Unit Tests: ${this.passed} passed, ${this.failed} failed`);
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

// Test 1: generateUUID
TestRunner.addTest('generateUUID returns a string', function() {
    const uuid = data.generateUUID();
    TestRunner.assertTrue(typeof uuid === 'string', 'UUID should be a string');
});

TestRunner.addTest('generateUUID returns unique values', function() {
    const uuid1 = data.generateUUID();
    const uuid2 = data.generateUUID();
    TestRunner.assertTrue(uuid1 !== uuid2, 'UUIDs should be unique');
});

TestRunner.addTest('generateUUID has correct format', function() {
    const uuid = data.generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    TestRunner.assertTrue(uuidRegex.test(uuid), `UUID format incorrect: ${uuid}`);
});

// Test 2: calculateOverallScore
TestRunner.addTest('calculateOverallScore with all zeros returns 0', function() {
    const score = data.calculateOverallScore({
        height: 0, verticalJump: 0, speedAgility: 0, spiking: 0, blocking: 0,
        setting: 0, passing: 0, defense: 0, serving: 0, gameIQ: 0
    });
    TestRunner.assertEqual(score, 0, `Expected 0, got ${score}`);
});

TestRunner.addTest('calculateOverallScore with all max values returns 10', function() {
    const score = data.calculateOverallScore({
        height: 10, verticalJump: 10, speedAgility: 10, spiking: 10, blocking: 10,
        setting: 10, passing: 10, defense: 10, serving: 10, gameIQ: 10
    });
    TestRunner.assertEqual(score, 10, `Expected 10, got ${score}`);
});

TestRunner.addTest('calculateOverallScore with all 5s returns 5', function() {
    const score = data.calculateOverallScore({
        height: 5, verticalJump: 5, speedAgility: 5, spiking: 5, blocking: 5,
        setting: 5, passing: 5, defense: 5, serving: 5, gameIQ: 5
    });
    TestRunner.assertEqual(score, 5, `Expected 5, got ${score}`);
});

TestRunner.addTest('calculateOverallScore handles missing ratings', function() {
    const score = data.calculateOverallScore({
        height: 10, verticalJump: 10
        // Missing other ratings
    });
    // Should treat missing as 0, so (10+10+0+0+0+0+0+0+0+0)/10 = 2
    TestRunner.assertEqual(score, 2, `Expected 2, got ${score}`);
});

// Test 3: createPlayer
TestRunner.addTest('createPlayer with full data creates valid player', function() {
    const playerData = {
        id: 'test-id',
        name: 'Test Player',
        ratings: {
            height: 8, verticalJump: 7, speedAgility: 9, spiking: 8, blocking: 6,
            setting: 5, passing: 7, defense: 8, serving: 7, gameIQ: 8
        },
        preferences: ['Setter', 'Middle Blocker']
    };
    
    const player = data.createPlayer(playerData);
    TestRunner.assertEqual(player.id, 'test-id', 'Player ID should match');
    TestRunner.assertEqual(player.name, 'Test Player', 'Player name should match');
    TestRunner.assertEqual(player.ratings.height, 8, 'Rating should match');
    TestRunner.assertEqual(player.preferences.length, 2, 'Preferences should match');
    TestRunner.assertTrue(player.overallScore > 0, 'Overall score should be calculated');
});

TestRunner.addTest('createPlayer with partial data uses defaults', function() {
    const playerData = {
        name: 'Partial Player'
    };
    
    const player = data.createPlayer(playerData);
    TestRunner.assertTrue(player.id.length > 0, 'Should generate UUID');
    TestRunner.assertEqual(player.name, 'Partial Player', 'Name should match');
    TestRunner.assertEqual(player.ratings.height, 0, 'Default rating should be 0');
    TestRunner.assertEqual(player.preferences.length, 2, 'Default preferences should be set');
});

TestRunner.addTest('createPlayer calculates overallScore correctly', function() {
    const playerData = {
        ratings: {
            height: 10, verticalJump: 10, speedAgility: 10, spiking: 10, blocking: 10,
            setting: 10, passing: 10, defense: 10, serving: 10, gameIQ: 10
        }
    };
    
    const player = data.createPlayer(playerData);
    TestRunner.assertEqual(player.overallScore, 10, 'Overall score should be 10');
});

// Test 4: loadPlayers and savePlayers
TestRunner.addTest('loadPlayers returns empty array when no data', function() {
    localStorageMock.clear();
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, 0, 'Should return empty array');
});

TestRunner.addTest('savePlayers and loadPlayers work together', function() {
    localStorageMock.clear();
    const player = data.createPlayer({ name: 'Test' });
    data.savePlayers([player]);
    const loaded = data.loadPlayers();
    TestRunner.assertEqual(loaded.length, 1, 'Should load saved player');
    TestRunner.assertEqual(loaded[0].name, 'Test', 'Loaded player name should match');
});

TestRunner.addTest('loadPlayers handles corrupted data', function() {
    localStorageMock.clear();
    localStorageMock.setItem('volleyballPlayers', 'invalid json');
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, 0, 'Should return empty array for corrupted data');
});

TestRunner.addTest('loadPlayers handles non-array data', function() {
    localStorageMock.clear();
    localStorageMock.setItem('volleyballPlayers', JSON.stringify({ not: 'an array' }));
    const players = data.loadPlayers();
    TestRunner.assertEqual(players.length, 0, 'Should return empty array for non-array data');
});

// Test 5: addPlayer
TestRunner.addTest('addPlayer adds a new player', function() {
    localStorageMock.clear();
    const initialCount = data.loadPlayers().length;
    data.addPlayer({ name: 'New Player' });
    const newCount = data.loadPlayers().length;
    TestRunner.assertEqual(newCount, initialCount + 1, 'Player count should increase');
});

TestRunner.addTest('addPlayer returns the created player', function() {
    localStorageMock.clear();
    const player = data.addPlayer({ name: 'Returned Player' });
    TestRunner.assertEqual(player.name, 'Returned Player', 'Should return created player');
    TestRunner.assertTrue(player.id.length > 0, 'Returned player should have ID');
});

// Test 6: updatePlayer
TestRunner.addTest('updatePlayer updates existing player', function() {
    localStorageMock.clear();
    const player = data.addPlayer({ name: 'Original' });
    const updated = data.updatePlayer(player.id, { name: 'Updated' });
    TestRunner.assertEqual(updated.name, 'Updated', 'Player name should be updated');
    TestRunner.assertEqual(updated.id, player.id, 'Player ID should remain the same');
});

TestRunner.addTest('updatePlayer returns null for non-existent player', function() {
    localStorageMock.clear();
    const result = data.updatePlayer('non-existent-id', { name: 'Test' });
    TestRunner.assertNull(result, 'Should return null for non-existent player');
});

// Test 7: deletePlayer
TestRunner.addTest('deletePlayer removes a player', function() {
    localStorageMock.clear();
    const player = data.addPlayer({ name: 'To Delete' });
    const initialCount = data.loadPlayers().length;
    data.deletePlayer(player.id);
    const newCount = data.loadPlayers().length;
    TestRunner.assertEqual(newCount, initialCount - 1, 'Player count should decrease');
});

TestRunner.addTest('deletePlayer returns updated player list', function() {
    localStorageMock.clear();
    const player1 = data.addPlayer({ name: 'Player 1' });
    const player2 = data.addPlayer({ name: 'Player 2' });
    const remaining = data.deletePlayer(player1.id);
    TestRunner.assertEqual(remaining.length, 1, 'Should return 1 remaining player');
    TestRunner.assertEqual(remaining[0].id, player2.id, 'Remaining player should be player2');
});

// Test 8: deletePlayers
TestRunner.addTest('deletePlayers removes multiple players', function() {
    localStorageMock.clear();
    const p1 = data.addPlayer({ name: 'P1' });
    const p2 = data.addPlayer({ name: 'P2' });
    const p3 = data.addPlayer({ name: 'P3' });
    
    data.deletePlayers([p1.id, p2.id]);
    const remaining = data.loadPlayers();
    TestRunner.assertEqual(remaining.length, 1, 'Should have 1 player remaining');
    TestRunner.assertEqual(remaining[0].id, p3.id, 'Remaining should be P3');
});

// Test 9: getPlayerById
TestRunner.addTest('getPlayerById returns correct player', function() {
    localStorageMock.clear();
    const player = data.addPlayer({ name: 'Find Me' });
    const found = data.getPlayerById(player.id);
    TestRunner.assertEqual(found.id, player.id, 'Should find player by ID');
});

TestRunner.addTest('getPlayerById returns null for non-existent ID', function() {
    const result = data.getPlayerById('non-existent');
    TestRunner.assertNull(result, 'Should return null for non-existent ID');
});

// Test 10: getAllPlayers
TestRunner.addTest('getAllPlayers returns all players', function() {
    localStorageMock.clear();
    data.addPlayer({ name: 'Player A' });
    data.addPlayer({ name: 'Player B' });
    const all = data.getAllPlayers();
    TestRunner.assertEqual(all.length, 2, 'Should return all players');
});

// Test 11: resetPlayers
TestRunner.addTest('resetPlayers clears all players', function() {
    localStorageMock.clear();
    data.addPlayer({ name: 'Player 1' });
    data.addPlayer({ name: 'Player 2' });
    const result = data.resetPlayers();
    TestRunner.assertEqual(result.length, 0, 'Should return empty array');
    TestRunner.assertEqual(data.loadPlayers().length, 0, 'Should have no players after reset');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner, data };

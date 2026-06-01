// algorithm.js - Team generation algorithm and position-specific scoring

// Position weights as defined in the specification
// All weights are normalized to sum to 1.00 for each position
const POSITION_WEIGHTS = {
    'Setter': {
        height: 0.0882,
        verticalJump: 0.0735,
        speedAgility: 0.1177,
        spiking: 0.0588,
        blocking: 0.0882,
        setting: 0.1471,
        passing: 0.1029,
        defense: 0.1029,
        serving: 0.0882,
        gameIQ: 0.1324
    },
    'Middle Blocker': {
        height: 0.1308,
        verticalJump: 0.1163,
        speedAgility: 0.1018,
        spiking: 0.0872,
        blocking: 0.1308,
        setting: 0.0581,
        passing: 0.0685,
        defense: 0.1096,
        serving: 0.0872,
        gameIQ: 0.1096
    },
    'Outside Hitter': {
        height: 0.1018,
        verticalJump: 0.1163,
        speedAgility: 0.1163,
        spiking: 0.1309,
        blocking: 0.1018,
        setting: 0.0525,
        passing: 0.0918,
        defense: 0.0918,
        serving: 0.0918,
        gameIQ: 0.1050
    }
};

// Team composition by team size
const TEAM_COMPOSITION = {
    6: {
        minPlayers: 12,
        positions: {
            'Setter': 2,
            'Middle Blocker': 2,
            'Outside Hitter': 2
        }
    },
    5: {
        minPlayers: 10,
        positions: {
            'Setter': 2,
            'Middle Blocker': 2,
            'Outside Hitter': 1
        }
    },
    7: {
        minPlayers: 14,
        positions: {
            'Setter': 2,
            'Middle Blocker': 3,
            'Outside Hitter': 2
        }
    }
};

/**
 * Calculate position-specific score for a player and position
 */
function calculatePositionScore(player, position) {
    const weights = POSITION_WEIGHTS[position];
    if (!weights) {
        return 0;
    }
    
    let weightedSum = 0;
    for (const [category, weight] of Object.entries(weights)) {
        const rating = player.ratings[category] || 0;
        weightedSum += rating * weight;
    }
    
    // Scale to 0-10 range
    const positionScore = (weightedSum / 100) * 10;
    return Math.round(positionScore * 100) / 100;
}

/**
 * Calculate position-specific scores for all positions for a player
 */
function calculateAllPositionScores(player) {
    const scores = {};
    for (const position of Object.keys(POSITION_WEIGHTS)) {
        scores[position] = calculatePositionScore(player, position);
    }
    return scores;
}

/**
 * Determine the optimal team size based on present player count
 * Priority: 6 (min 12), 5 (min 10), 7 (min 14)
 */
function determineTeamSize(presentPlayerCount) {
    // Check team sizes in priority order
    const priorityOrder = [6, 5, 7];
    
    for (const teamSize of priorityOrder) {
        const config = TEAM_COMPOSITION[teamSize];
        if (presentPlayerCount >= config.minPlayers && presentPlayerCount % teamSize === 0) {
            return {
                teamSize: teamSize,
                teamCount: presentPlayerCount / teamSize,
                composition: config.positions
            };
        }
    }
    
    // If no valid team size found, return null
    return null;
}

/**
 * Validate if team generation is possible with current player count
 */
function validateTeamGeneration(presentPlayerCount) {
    const teamConfig = determineTeamSize(presentPlayerCount);
    return teamConfig !== null;
}

/**
 * Get minimum players required for any team size
 */
function getMinimumPlayers() {
    return Math.min(
        TEAM_COMPOSITION[6].minPlayers,
        TEAM_COMPOSITION[5].minPlayers,
        TEAM_COMPOSITION[7].minPlayers
    );
}

/**
 * Initialize team structure with empty position slots
 */
function initializeTeams(teamCount, composition) {
    const teams = [];
    for (let i = 0; i < teamCount; i++) {
        teams.push({
            id: `team-${i + 1}`,
            players: [],
            totalScore: 0,
            positionSlots: { ...composition }
        });
    }
    return teams;
}

/**
 * Find the team with the lowest total overall score
 */
function findTeamWithLowestScore(teams) {
    let lowestTeam = null;
    let lowestScore = Infinity;
    
    for (const team of teams) {
        if (team.totalScore < lowestScore) {
            lowestScore = team.totalScore;
            lowestTeam = team;
        }
    }
    
    return lowestTeam;
}

/**
 * Find all unoccupied position slots in a team
 */
function getUnoccupiedSlots(team) {
    const unoccupiedSlots = [];
    for (const [position, count] of Object.entries(team.positionSlots)) {
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                unoccupiedSlots.push(position);
            }
        }
    }
    return unoccupiedSlots;
}

/**
 * Check if player's preferences match any unoccupied slots
 */
function playerMatchesSlots(player, unoccupiedSlots) {
    const playerPreferences = player.preferences || [];
    return playerPreferences.some(pref => unoccupiedSlots.includes(pref));
}

/**
 * Find the most preferred available slot for a player in a team
 */
function findMostPreferredSlot(player, unoccupiedSlots) {
    const playerPreferences = player.preferences || [];
    
    // Check first preference
    if (unoccupiedSlots.includes(playerPreferences[0])) {
        return playerPreferences[0];
    }
    
    // Check second preference
    if (playerPreferences.length > 1 && unoccupiedSlots.includes(playerPreferences[1])) {
        return playerPreferences[1];
    }
    
    // If no preference matches, return the first available slot
    return unoccupiedSlots[0];
}

/**
 * Assign a player to a team and position
 */
function assignPlayerToTeam(team, player, position) {
    // Add player to team
    team.players.push({
        playerId: player.id,
        position: position,
        overallScore: player.overallScore
    });
    
    // Update team total score
    team.totalScore += player.overallScore;
    
    // Decrement the position slot count
    team.positionSlots[position]--;
    
    // Remove the position from slots if count reaches zero
    if (team.positionSlots[position] <= 0) {
        delete team.positionSlots[position];
    }
}

/**
 * Calculate position-specific score for a player (0-100 scale)
 */
function calculatePositionSpecificScore(player, position) {
    const weights = POSITION_WEIGHTS[position];
    if (!weights) {
        return 0;
    }
    
    let weightedSum = 0;
    for (const [category, weight] of Object.entries(weights)) {
        const rating = player.ratings[category] || 0;
        weightedSum += rating * weight;
    }
    
    // Return raw weighted sum (0-100 scale)
    return weightedSum;
}

/**
 * Get players who have a specific position as their first preference
 */
function getPlayersWithPrimaryPosition(players, position) {
    return players.filter(p => 
        p.preferences && p.preferences.length > 0 && p.preferences[0] === position
    );
}

/**
 * Select a random player from an array
 */
function selectRandomPlayer(players) {
    if (players.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * players.length);
    return players[randomIndex];
}

/**
 * Find the best matching pair for a target aggregated score
 * Returns the pair of players whose combined position score is closest to targetScore
 */
function findBestMatchingPair(availablePlayers, position, targetScore) {
    if (availablePlayers.length < 2) return null;
    
    let bestPair = null;
    let bestDiff = Infinity;
    
    // Try all possible pairs
    for (let i = 0; i < availablePlayers.length; i++) {
        for (let j = i + 1; j < availablePlayers.length; j++) {
            const player1 = availablePlayers[i];
            const player2 = availablePlayers[j];
            
            const score1 = calculatePositionSpecificScore(player1, position);
            const score2 = calculatePositionSpecificScore(player2, position);
            const pairScore = score1 + score2;
            const diff = Math.abs(pairScore - targetScore);
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestPair = [player1, player2];
            }
        }
    }
    
    return bestPair;
}

/**
 * Assign a pair of players to a team with a specific position
 */
function assignPlayerPairToTeam(team, player1, player2, position) {
    const positionScore1 = calculatePositionSpecificScore(player1, position);
    const positionScore2 = calculatePositionSpecificScore(player2, position);
    
    // Assign first player
    team.players.push({
        playerId: player1.id,
        position: position,
        overallScore: player1.overallScore,
        positionScore: positionScore1
    });
    team.totalScore += player1.overallScore;
    
    // Assign second player
    team.players.push({
        playerId: player2.id,
        position: position,
        overallScore: player2.overallScore,
        positionScore: positionScore2
    });
    team.totalScore += player2.overallScore;
    
    // Decrement position slot count
    if (team.positionSlots[position] !== undefined) {
        team.positionSlots[position] -= 2;
        if (team.positionSlots[position] <= 0) {
            delete team.positionSlots[position];
        }
    }
}

/**
 * Remove a player from an array by ID
 */
function removePlayerById(players, playerId) {
    const index = players.findIndex(p => p.id === playerId);
    if (index > -1) {
        players.splice(index, 1);
    }
}

/**
 * Main team generation algorithm - NEW VERSION
 * 
 * Algorithm for each position (Setter, Middle Blocker, Outside Hitter):
 * 1. Choose 2 random players with that position as primary preference and put them in Team 1
 * 2. Calculate their aggregated position-specific rating (target score)
 * 3. Find the best matching pair of remaining players with that position whose combined rating is closest to the target score
 * 4. Put the matching pair in Team 2
 * 5. Repeat until all teams have the required number of that position
 * 6. Move to the next position type
 */
function generateTeams(presentPlayers) {
    const presentPlayerCount = presentPlayers.length;
    
    // Determine team size and configuration
    const teamConfig = determineTeamSize(presentPlayerCount);
    if (!teamConfig) {
        throw new Error('Cannot determine valid team configuration for the current number of players');
    }
    
    const { teamSize, teamCount, composition } = teamConfig;
    
    // Initialize teams with empty position slots
    const teams = initializeTeams(teamCount, composition);
    
    // Make a copy of players to track which ones are assigned
    let unassignedPlayers = [...presentPlayers];
    
    // Define position priority order
    const positionPriority = ['Setter', 'Middle Blocker', 'Outside Hitter'];
    
    // Process each position type in priority order
    for (const position of positionPriority) {
        const requiredCount = composition[position];
        if (!requiredCount || requiredCount === 0) continue;
        
        // Get players with this position as primary preference
        let availablePositionPlayers = getPlayersWithPrimaryPosition(unassignedPlayers, position);
        
        if (availablePositionPlayers.length < requiredCount * teamCount) {
            throw new Error(`Not enough players with ${position} as primary preference. ` +
                          `Need ${requiredCount * teamCount}, have ${availablePositionPlayers.length}`);
        }
        
        // Total players needed for this position across all teams
        const totalPlayersNeeded = requiredCount * teamCount;
        
        // Step 1: For Team 1, choose 2 random players (or requiredCount if not a pair)
        // For positions with requiredCount = 2, we assign pairs
        // For positions with requiredCount = 3 (7v7 Middle Blocker), we need to handle differently
        
        if (requiredCount === 2) {
            // Pair-based assignment for positions with 2 players per team
            
            // Step 1: Choose 2 random players for Team 1
            const randomPlayer1 = selectRandomPlayer(availablePositionPlayers);
            const randomPlayer2 = selectRandomPlayer(availablePositionPlayers.filter(p => p.id !== randomPlayer1.id));
            
            if (!randomPlayer1 || !randomPlayer2) {
                throw new Error(`Not enough ${position} players available`);
            }
            
            // Calculate target aggregated score
            const targetScore = calculatePositionSpecificScore(randomPlayer1, position) + 
                               calculatePositionSpecificScore(randomPlayer2, position);
            
            // Assign to team 1
            assignPlayerPairToTeam(teams[0], randomPlayer1, randomPlayer2, position);
            
            // Remove from available lists
            removePlayerById(availablePositionPlayers, randomPlayer1.id);
            removePlayerById(availablePositionPlayers, randomPlayer2.id);
            removePlayerById(unassignedPlayers, randomPlayer1.id);
            removePlayerById(unassignedPlayers, randomPlayer2.id);
            
            // Store target score for next team
            let currentTargetScore = targetScore;
            
            // For remaining teams, find matching pairs
            for (let remainingTeamIndex = 1; remainingTeamIndex < teamCount; remainingTeamIndex++) {
                // Step 2: Find best matching pair for the target score
                const bestPair = findBestMatchingPair(availablePositionPlayers, position, currentTargetScore);
                
                if (bestPair && bestPair.length === 2) {
                    // Assign matching pair to this team
                    assignPlayerPairToTeam(teams[remainingTeamIndex], bestPair[0], bestPair[1], position);
                    
                    // Remove from available lists
                    removePlayerById(availablePositionPlayers, bestPair[0].id);
                    removePlayerById(availablePositionPlayers, bestPair[1].id);
                    removePlayerById(unassignedPlayers, bestPair[0].id);
                    removePlayerById(unassignedPlayers, bestPair[1].id);
                    
                    // Update target score for next iteration (use this pair's score)
                    currentTargetScore = calculatePositionSpecificScore(bestPair[0], position) + 
                                        calculatePositionSpecificScore(bestPair[1], position);
                } else {
                    // If no matching pair found, just take the first 2 available
                    if (availablePositionPlayers.length >= 2) {
                        const pair = [availablePositionPlayers[0], availablePositionPlayers[1]];
                        assignPlayerPairToTeam(teams[remainingTeamIndex], pair[0], pair[1], position);
                        
                        // Remove from available lists
                        removePlayerById(availablePositionPlayers, pair[0].id);
                        removePlayerById(availablePositionPlayers, pair[1].id);
                        removePlayerById(unassignedPlayers, pair[0].id);
                        removePlayerById(unassignedPlayers, pair[1].id);
                    }
                }
            }
        } else if (requiredCount === 3) {
            // For 7v7 with 3 Middle Blockers per team
            // We need to assign 3 players per team, so we'll use a different approach
            // Assign 2 random to team 1, then find best match for the 3rd
            
            for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
                // For each team, we need 3 players
                const playersToAssign = [];
                
                if (teamIndex === 0) {
                    // Team 1: pick 2 random, then find best match for 3rd
                    const randomPlayer1 = selectRandomPlayer(availablePositionPlayers);
                    const randomPlayer2 = selectRandomPlayer(availablePositionPlayers.filter(p => p.id !== randomPlayer1.id));
                    
                    playersToAssign.push(randomPlayer1, randomPlayer2);
                    
                    // Calculate target for the 3rd player
                    const targetScore = calculatePositionSpecificScore(randomPlayer1, position) + 
                                       calculatePositionSpecificScore(randomPlayer2, position);
                    
                    // Find best single player to match the target (average)
                    const targetAvg = targetScore / 2;
                    let bestPlayer = null;
                    let bestDiff = Infinity;
                    
                    for (const player of availablePositionPlayers) {
                        if (player.id !== randomPlayer1.id && player.id !== randomPlayer2.id) {
                            const playerScore = calculatePositionSpecificScore(player, position);
                            const diff = Math.abs(playerScore - targetAvg);
                            if (diff < bestDiff) {
                                bestDiff = diff;
                                bestPlayer = player;
                            }
                        }
                    }
                    
                    if (bestPlayer) {
                        playersToAssign.push(bestPlayer);
                    } else if (availablePositionPlayers.length >= 3) {
                        // Take any remaining player
                        const remaining = availablePositionPlayers.filter(p => 
                            p.id !== randomPlayer1.id && p.id !== randomPlayer2.id
                        );
                        if (remaining.length > 0) {
                            playersToAssign.push(remaining[0]);
                        }
                    }
                } else {
                    // For other teams, find the best 3 players that match Team 1's aggregate
                    // This is more complex, so for now we'll just assign remaining players
                    const remaining = [...availablePositionPlayers];
                    if (remaining.length >= 3) {
                        playersToAssign.push(remaining[0], remaining[1], remaining[2]);
                    } else if (remaining.length === 2) {
                        playersToAssign.push(remaining[0], remaining[1]);
                    } else if (remaining.length === 1) {
                        playersToAssign.push(remaining[0]);
                    }
                }
                
                // Assign all selected players to this team
                for (const player of playersToAssign) {
                    assignPlayerToTeam(teams[teamIndex], player, position);
                    removePlayerById(availablePositionPlayers, player.id);
                    removePlayerById(unassignedPlayers, player.id);
                }
            }
        } else if (requiredCount === 1) {
            // For positions with 1 player per team (Outside Hitter in 5v5)
            // Assign randomly to each team
            for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
                if (availablePositionPlayers.length === 0) break;
                
                const randomPlayer = selectRandomPlayer(availablePositionPlayers);
                assignPlayerToTeam(teams[teamIndex], randomPlayer, position);
                removePlayerById(availablePositionPlayers, randomPlayer.id);
                removePlayerById(unassignedPlayers, randomPlayer.id);
            }
        }
    }
    
    // Assign any remaining unassigned players to teams
    // This handles players who don't have the primary positions
    for (const player of unassignedPlayers) {
        // Find team with available slots
        for (const team of teams) {
            const unoccupiedSlots = getUnoccupiedSlots(team);
            if (unoccupiedSlots.length > 0) {
                const preferredSlot = findMostPreferredSlot(player, unoccupiedSlots);
                assignPlayerToTeam(team, player, preferredSlot);
                break;
            }
        }
    }
    
    return {
        teams: teams,
        teamSize: teamSize,
        teamCount: teamCount,
        totalPlayers: presentPlayerCount
    };
}

/**
 * Get team composition information
 */
function getTeamComposition(teamSize) {
    return TEAM_COMPOSITION[teamSize] || null;
}

/**
 * Get all valid team sizes
 */
function getValidTeamSizes() {
    return Object.keys(TEAM_COMPOSITION).map(Number);
}

/**
 * Check if a player count is valid for team generation
 */
function isValidPlayerCount(playerCount) {
    return validateTeamGeneration(playerCount);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        POSITION_WEIGHTS,
        TEAM_COMPOSITION,
        calculatePositionScore,
        calculateAllPositionScores,
        determineTeamSize,
        validateTeamGeneration,
        getMinimumPlayers,
        initializeTeams,
        findTeamWithLowestScore,
        getUnoccupiedSlots,
        playerMatchesSlots,
        findMostPreferredSlot,
        assignPlayerToTeam,
        generateTeams,
        getTeamComposition,
        getValidTeamSizes,
        isValidPlayerCount
    };
}
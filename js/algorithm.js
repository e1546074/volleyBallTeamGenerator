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
    return positionScore = (weightedSum / 100)*100 ;
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
 * Main team generation algorithm
 */
function generateTeams(presentPlayers) {
    const presentPlayerCount = presentPlayers.length;
    
    // Determine team size and configuration
    const teamConfig = determineTeamSize(presentPlayerCount);
    if (!teamConfig) {
        throw new Error('Cannot determine valid team configuration for the current number of players');
    }
    
    const { teamSize, teamCount, composition } = teamConfig;
    
    // Sort present players by overall score descending
    const sortedPlayers = [...presentPlayers].sort((a, b) => b.overallScore - a.overallScore);
    
    // Initialize teams with empty position slots
    const teams = initializeTeams(teamCount, composition);
    
    // Make a copy of players to track which ones are assigned
    const unassignedPlayers = [...sortedPlayers];
    
    // Algorithm: For each player in sorted order
    for (const player of sortedPlayers) {
        // Find team with lowest total overall score
        const lowestTeam = findTeamWithLowestScore(teams);
        
        // Find all unoccupied position slots in that team
        const unoccupiedSlots = getUnoccupiedSlots(lowestTeam);
        
        if (unoccupiedSlots.length === 0) {
            continue; // No more slots in this team
        }
        
        // Filter players whose first or second preference matches any unoccupied slot
        const matchingPlayers = unassignedPlayers.filter(p => 
            playerMatchesSlots(p, unoccupiedSlots)
        );
        
        // If no matches, use all remaining players
        const filteredPlayers = matchingPlayers.length > 0 ? matchingPlayers : unassignedPlayers;
        
        // From filtered players, select the one with highest overall score
        const selectedPlayer = filteredPlayers.reduce((highest, current) => {
            return current.overallScore > highest.overallScore ? current : highest;
        }, filteredPlayers[0]);
        
        // Find the most preferred available slot in the team for this player
        const preferredSlot = findMostPreferredSlot(selectedPlayer, unoccupiedSlots);
        
        // Assign player to the team
        assignPlayerToTeam(lowestTeam, selectedPlayer, preferredSlot);
        
        // Remove the assigned player from unassigned list
        const playerIndex = unassignedPlayers.findIndex(p => p.id === selectedPlayer.id);
        if (playerIndex > -1) {
            unassignedPlayers.splice(playerIndex, 1);
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
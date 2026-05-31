// ui.js - UI rendering and interaction functions

// DOM Elements
const elements = {
    // Views
    playerListView: document.getElementById('player-list-view'),
    teamGenerationView: document.getElementById('team-generation-view'),
    
    // Player List
    playerTableBody: document.getElementById('player-table-body'),
    noPlayersMessage: document.getElementById('no-players-message'),
    errorMessage: document.getElementById('error-message'),
    
    // Action Buttons
    addPlayerBtn: document.getElementById('add-player-btn'),
    editPlayerBtn: document.getElementById('edit-player-btn'),
    deletePlayerBtn: document.getElementById('delete-player-btn'),
    confirmSelectionBtn: document.getElementById('confirm-selection-btn'),
    backToPlayersBtn: document.getElementById('back-to-players-btn'),
    
    // Team Generation
    teamInfo: document.getElementById('team-info'),
    teamsContainer: document.getElementById('teams-container'),
    
    // Modal
    playerModal: document.getElementById('player-modal'),
    confirmDeleteModal: document.getElementById('confirm-delete-modal'),
    modalTitle: document.getElementById('modal-title'),
    
    // Player Form
    playerForm: document.getElementById('player-form'),
    playerName: document.getElementById('player-name'),
    
    // Rating Sliders
    heightRating: document.getElementById('height-rating'),
    heightValue: document.getElementById('height-value'),
    verticalJumpRating: document.getElementById('vertical-jump-rating'),
    verticalJumpValue: document.getElementById('vertical-jump-value'),
    speedAgilityRating: document.getElementById('speed-agility-rating'),
    speedAgilityValue: document.getElementById('speed-agility-value'),
    spikingRating: document.getElementById('spiking-rating'),
    spikingValue: document.getElementById('spiking-value'),
    blockingRating: document.getElementById('blocking-rating'),
    blockingValue: document.getElementById('blocking-value'),
    settingRating: document.getElementById('setting-rating'),
    settingValue: document.getElementById('setting-value'),
    passingRating: document.getElementById('passing-rating'),
    passingValue: document.getElementById('passing-value'),
    defenseRating: document.getElementById('defense-rating'),
    defenseValue: document.getElementById('defense-value'),
    servingRating: document.getElementById('serving-rating'),
    servingValue: document.getElementById('serving-value'),
    gameIQRating: document.getElementById('game-iq-rating'),
    gameIQValue: document.getElementById('game-iq-value'),
    
    // Preferences
    firstPreference: document.getElementById('first-preference'),
    secondPreference: document.getElementById('second-preference'),
    
    // Position Scores
    setterScore: document.getElementById('setter-score'),
    middleBlockerScore: document.getElementById('middle-blocker-score'),
    outsideHitterScore: document.getElementById('outside-hitter-score'),
    overallScore: document.getElementById('overall-score'),
    
    // Modal Buttons
    closeModalBtn: document.getElementById('close-modal-btn'),
    cancelModalBtn: document.getElementById('cancel-modal-btn'),
    closeConfirmModalBtn: document.getElementById('close-confirm-modal-btn'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn')
};

// State
let state = {
    players: [],
    presentPlayers: new Set(),
    selectedPlayerId: null,
    editingPlayerId: null,
    currentView: 'player-list'
};

// Slider to value element mapping
const sliderValueMap = {
    'height-rating': 'height-value',
    'vertical-jump-rating': 'vertical-jump-value',
    'speed-agility-rating': 'speed-agility-value',
    'spiking-rating': 'spiking-value',
    'blocking-rating': 'blocking-value',
    'setting-rating': 'setting-value',
    'passing-rating': 'passing-value',
    'defense-rating': 'defense-value',
    'serving-rating': 'serving-value',
    'game-iq-rating': 'game-iq-value'
};

/**
 * Format score for display (2 decimal places)
 */
function formatScore(score) {
    return score.toFixed(2);
}

/**
 * Get rating value from slider ID
 */
function getRatingFromSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    return parseFloat(slider.value);
}

/**
 * Update slider value display
 */
function updateSliderValue(sliderId, valueElementId) {
    const slider = document.getElementById(sliderId);
    const valueElement = document.getElementById(valueElementId);
    if (slider && valueElement) {
        valueElement.textContent = formatScore(parseFloat(slider.value));
    }
}

/**
 * Update all slider value displays
 */
function updateAllSliderValues() {
    for (const [sliderId, valueId] of Object.entries(sliderValueMap)) {
        updateSliderValue(sliderId, valueId);
    }
}

/**
 * Get all ratings from form
 */
function getRatingsFromForm() {
    return {
        height: getRatingFromSlider('height-rating'),
        verticalJump: getRatingFromSlider('vertical-jump-rating'),
        speedAgility: getRatingFromSlider('speed-agility-rating'),
        spiking: getRatingFromSlider('spiking-rating'),
        blocking: getRatingFromSlider('blocking-rating'),
        setting: getRatingFromSlider('setting-rating'),
        passing: getRatingFromSlider('passing-rating'),
        defense: getRatingFromSlider('defense-rating'),
        serving: getRatingFromSlider('serving-rating'),
        gameIQ: getRatingFromSlider('game-iq-rating')
    };
}

/**
 * Calculate and display position-specific scores
 */
function updatePositionScores() {
    const ratings = getRatingsFromForm();
    const playerData = {
        ratings: ratings,
        preferences: [
            elements.firstPreference.value,
            elements.secondPreference.value
        ]
    };
    
    // Calculate position scores
    const setterScore = calculatePositionScore(playerData, 'Setter');
    const middleBlockerScore = calculatePositionScore(playerData, 'Middle Blocker');
    const outsideHitterScore = calculatePositionScore(playerData, 'Outside Hitter');
    const overallScore = calculateOverallScore(ratings);
    
    // Update UI
    if (elements.setterScore) elements.setterScore.textContent = formatScore(setterScore);
    if (elements.middleBlockerScore) elements.middleBlockerScore.textContent = formatScore(middleBlockerScore);
    if (elements.outsideHitterScore) elements.outsideHitterScore.textContent = formatScore(outsideHitterScore);
    if (elements.overallScore) elements.overallScore.textContent = formatScore(overallScore);
}

/**
 * Set form values from player data
 */
function setFormValues(player) {
    if (!player) return;
    
    // Set name
    if (elements.playerName) elements.playerName.value = player.name || '';
    
    // Set ratings
    const ratings = player.ratings || {};
    if (elements.heightRating) elements.heightRating.value = ratings.height || 0;
    if (elements.verticalJumpRating) elements.verticalJumpRating.value = ratings.verticalJump || 0;
    if (elements.speedAgilityRating) elements.speedAgilityRating.value = ratings.speedAgility || 0;
    if (elements.spikingRating) elements.spikingRating.value = ratings.spiking || 0;
    if (elements.blockingRating) elements.blockingRating.value = ratings.blocking || 0;
    if (elements.settingRating) elements.settingRating.value = ratings.setting || 0;
    if (elements.passingRating) elements.passingRating.value = ratings.passing || 0;
    if (elements.defenseRating) elements.defenseRating.value = ratings.defense || 0;
    if (elements.servingRating) elements.servingRating.value = ratings.serving || 0;
    if (elements.gameIQRating) elements.gameIQRating.value = ratings.gameIQ || 0;
    
    // Set preferences
    const preferences = player.preferences || ['Setter', 'Middle Blocker'];
    if (elements.firstPreference) elements.firstPreference.value = preferences[0] || 'Setter';
    if (elements.secondPreference) elements.secondPreference.value = preferences[1] || 'Middle Blocker';
    
    // Update slider value displays
    updateAllSliderValues();
    
    // Update position scores
    updatePositionScores();
}

/**
 * Clear form values
 */
function clearFormValues() {
    if (elements.playerName) elements.playerName.value = '';
    
    // Reset all sliders to middle value
    const sliders = Object.keys(sliderValueMap).map(id => document.getElementById(id));
    sliders.forEach(slider => {
        if (slider) slider.value = 5;
    });
    
    // Reset preferences
    if (elements.firstPreference) elements.firstPreference.value = 'Setter';
    if (elements.secondPreference) elements.secondPreference.value = 'Middle Blocker';
    
    // Update displays
    updateAllSliderValues();
    updatePositionScores();
}

/**
 * Show the player modal for adding or editing
 */
function showAddEditModal(player = null) {
    if (!elements.playerModal) return;
    
    // Set modal title
    if (elements.modalTitle) {
        elements.modalTitle.textContent = player ? 'Edit Player' : 'Add Player';
    }
    
    // Set form values
    if (player) {
        setFormValues(player);
        state.editingPlayerId = player.id;
    } else {
        clearFormValues();
        state.editingPlayerId = null;
    }
    
    // Show modal
    elements.playerModal.style.display = 'flex';
    
    // Focus on name field
    if (elements.playerName) {
        elements.playerName.focus();
    }
}

/**
 * Hide the player modal
 */
function hideAddEditModal() {
    if (elements.playerModal) {
        elements.playerModal.style.display = 'none';
    }
    state.editingPlayerId = null;
}

/**
 * Show the delete confirmation modal
 */
function showDeleteConfirmationModal() {
    if (elements.confirmDeleteModal) {
        elements.confirmDeleteModal.style.display = 'flex';
    }
}

/**
 * Hide the delete confirmation modal
 */
function hideDeleteConfirmationModal() {
    if (elements.confirmDeleteModal) {
        elements.confirmDeleteModal.style.display = 'none';
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideErrorMessage() {
    if (elements.errorMessage) {
        elements.errorMessage.style.display = 'none';
    }
}

/**
 * Switch to a different view
 */
function switchView(viewName) {
    // Hide all views
    if (elements.playerListView) elements.playerListView.classList.remove('active');
    if (elements.teamGenerationView) elements.teamGenerationView.classList.remove('active');
    
    // Show the requested view
    if (viewName === 'player-list') {
        if (elements.playerListView) elements.playerListView.classList.add('active');
        if (elements.teamGenerationView) elements.teamGenerationView.style.display = 'none';
    } else if (viewName === 'team-generation') {
        if (elements.playerListView) elements.playerListView.classList.remove('active');
        if (elements.teamGenerationView) {
            elements.teamGenerationView.classList.add('active');
            elements.teamGenerationView.style.display = 'block';
        }
    }
    
    state.currentView = viewName;
}

/**
 * Render a single player row
 */
function renderPlayerRow(player) {
    const row = document.createElement('tr');
    row.dataset.playerId = player.id;
    
    // Check if player is selected (present)
    if (state.presentPlayers.has(player.id)) {
        row.classList.add('selected');
    }
    
    // Name cell
    const nameCell = document.createElement('td');
    nameCell.textContent = player.name || 'Unnamed Player';
    row.appendChild(nameCell);
    
    // Overall Score cell
    const scoreCell = document.createElement('td');
    scoreCell.textContent = formatScore(player.overallScore || 0);
    row.appendChild(scoreCell);
    
    // Preferences cell
    const prefsCell = document.createElement('td');
    const preferences = player.preferences || [];
    const prefText = preferences.join(', ');
    prefsCell.textContent = prefText;
    row.appendChild(prefsCell);
    
    return row;
}

/**
 * Render the player table
 */
function renderPlayerTable(players) {
    if (!elements.playerTableBody) return;
    
    // Clear existing rows
    elements.playerTableBody.innerHTML = '';
    
    if (players.length === 0) {
        // Show no players message
        if (elements.noPlayersMessage) {
            elements.noPlayersMessage.style.display = 'block';
        }
        return;
    }
    
    // Hide no players message
    if (elements.noPlayersMessage) {
        elements.noPlayersMessage.style.display = 'none';
    }
    
    // Render each player
    players.forEach(player => {
        const row = renderPlayerRow(player);
        elements.playerTableBody.appendChild(row);
    });
    
    // Add click handlers to rows
    elements.playerTableBody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', (e) => {
            const playerId = row.dataset.playerId;
            togglePlayerPresent(playerId);
        });
    });
}

/**
 * Render team information
 */
function renderTeamInfo(teamConfig) {
    if (!elements.teamInfo) return;
    
    const { teamSize, teamCount, totalPlayers } = teamConfig;
    
    const infoHtml = `
        <p><strong>${teamCount}</strong> teams of <strong>${teamSize}</strong> players each (${totalPlayers} total players)</p>
    `;
    
    elements.teamInfo.innerHTML = infoHtml;
}

/**
 * Render a single team card
 */
function renderTeamCard(team, teamIndex) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.teamId = team.id;
    
    // Team header
    const header = document.createElement('div');
    header.className = 'team-header';
    
    const title = document.createElement('h3');
    title.textContent = `Team ${teamIndex + 1}`;
    header.appendChild(title);
    
    const totalScore = document.createElement('span');
    totalScore.className = 'team-total-score';
    totalScore.textContent = `Total Score: ${formatScore(team.totalScore || 0)}`;
    header.appendChild(totalScore);
    
    card.appendChild(header);
    
    // Team players
    const playersContainer = document.createElement('div');
    playersContainer.className = 'team-players';
    
    if (team.players && team.players.length > 0) {
        team.players.forEach(teamPlayer => {
            const playerElement = document.createElement('div');
            playerElement.className = 'team-player';
            
            const playerName = document.createElement('span');
            playerName.className = 'player-name';
            playerName.textContent = getPlayerById(teamPlayer.playerId)?.name || 'Unknown';
            playerElement.appendChild(playerName);
            
            const playerPosition = document.createElement('span');
            playerPosition.className = 'player-position';
            playerPosition.textContent = teamPlayer.position || 'Unknown';
            playerElement.appendChild(playerPosition);
            
            const playerScore = document.createElement('span');
            playerScore.className = 'player-score';
            playerScore.textContent = formatScore(teamPlayer.overallScore || 0);
            playerElement.appendChild(playerScore);
            
            playersContainer.appendChild(playerElement);
        });
    } else {
        const noPlayers = document.createElement('p');
        noPlayers.textContent = 'No players assigned';
        noPlayers.style.textAlign = 'center';
        noPlayers.style.color = 'var(--text-secondary)';
        playersContainer.appendChild(noPlayers);
    }
    
    card.appendChild(playersContainer);
    
    return card;
}

/**
 * Render all teams
 */
function renderTeams(teams) {
    if (!elements.teamsContainer) return;
    
    // Clear existing teams
    elements.teamsContainer.innerHTML = '';
    
    if (!teams || teams.length === 0) {
        const noTeams = document.createElement('p');
        noTeams.textContent = 'No teams generated';
        noTeams.style.textAlign = 'center';
        noTeams.style.color = 'var(--text-secondary)';
        elements.teamsContainer.appendChild(noTeams);
        return;
    }
    
    // Render each team
    teams.forEach((team, index) => {
        const card = renderTeamCard(team, index);
        elements.teamsContainer.appendChild(card);
    });
}

/**
 * Render team generation view
 */
function renderTeamGenerationView(teamConfig) {
    if (!teamConfig) return;
    
    const { teams, teamSize, teamCount, totalPlayers } = teamConfig;
    
    // Render team info
    renderTeamInfo({ teamSize, teamCount, totalPlayers });
    
    // Render teams
    renderTeams(teams);
    
    // Switch to team generation view
    switchView('team-generation');
}

/**
 * Toggle player present status
 */
function togglePlayerPresent(playerId) {
    if (state.presentPlayers.has(playerId)) {
        state.presentPlayers.delete(playerId);
    } else {
        state.presentPlayers.add(playerId);
    }
    
    // Update UI
    updatePlayerTableSelection();
    updateActionButtonStates();
}

/**
 * Update player table selection visuals
 */
function updatePlayerTableSelection() {
    if (!elements.playerTableBody) return;
    
    elements.playerTableBody.querySelectorAll('tr').forEach(row => {
        const playerId = row.dataset.playerId;
        if (state.presentPlayers.has(playerId)) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

/**
 * Update action button states based on selection
 */
function updateActionButtonStates() {
    const selectedCount = state.presentPlayers.size;
    const hasSelection = selectedCount > 0;
    const hasPlayers = state.players.length > 0;
    
    // Enable/disable buttons
    if (elements.editPlayerBtn) {
        elements.editPlayerBtn.disabled = !hasSelection || selectedCount !== 1;
    }
    
    if (elements.deletePlayerBtn) {
        elements.deletePlayerBtn.disabled = !hasSelection;
    }
    
    if (elements.confirmSelectionBtn) {
        const minPlayers = getMinimumPlayers();
        const isValid = validateTeamGeneration(selectedCount);
        elements.confirmSelectionBtn.disabled = !isValid;
    }
}

/**
 * Get selected player IDs
 */
function getSelectedPlayerIds() {
    return Array.from(state.presentPlayers);
}

/**
 * Get present players (selected for team generation)
 */
function getPresentPlayers() {
    return state.players.filter(player => state.presentPlayers.has(player.id));
}

/**
 * Clear present players selection
 */
function clearPresentPlayers() {
    state.presentPlayers.clear();
    updatePlayerTableSelection();
    updateActionButtonStates();
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Add Player button
    if (elements.addPlayerBtn) {
        elements.addPlayerBtn.addEventListener('click', () => {
            showAddEditModal();
        });
    }
    
    // Edit Player button
    if (elements.editPlayerBtn) {
        elements.editPlayerBtn.addEventListener('click', () => {
            const selectedIds = getSelectedPlayerIds();
            if (selectedIds.length === 1) {
                const player = getPlayerById(selectedIds[0]);
                if (player) {
                    showAddEditModal(player);
                }
            }
        });
    }
    
    // Delete Player button
    if (elements.deletePlayerBtn) {
        elements.deletePlayerBtn.addEventListener('click', () => {
            showDeleteConfirmationModal();
        });
    }
    
    // Confirm Selection button
    if (elements.confirmSelectionBtn) {
        elements.confirmSelectionBtn.addEventListener('click', () => {
            const presentPlayers = getPresentPlayers();
            try {
                const teamConfig = generateTeams(presentPlayers);
                renderTeamGenerationView(teamConfig);
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }
    
    // Back to Players button
    if (elements.backToPlayersBtn) {
        elements.backToPlayersBtn.addEventListener('click', () => {
            switchView('player-list');
            clearPresentPlayers();
        });
    }
    
    // Modal close buttons
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', hideAddEditModal);
    }
    
    if (elements.cancelModalBtn) {
        elements.cancelModalBtn.addEventListener('click', hideAddEditModal);
    }
    
    if (elements.closeConfirmModalBtn) {
        elements.closeConfirmModalBtn.addEventListener('click', hideDeleteConfirmationModal);
    }
    
    if (elements.cancelDeleteBtn) {
        elements.cancelDeleteBtn.addEventListener('click', hideDeleteConfirmationModal);
    }
    
    // Confirm Delete button
    if (elements.confirmDeleteBtn) {
        elements.confirmDeleteBtn.addEventListener('click', () => {
            const selectedIds = getSelectedPlayerIds();
            deletePlayers(selectedIds);
            state.players = loadPlayers();
            renderPlayerTable(state.players);
            updateActionButtonStates();
            hideDeleteConfirmationModal();
            clearPresentPlayers();
        });
    }
    
    // Player form submission
    if (elements.playerForm) {
        elements.playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const playerData = {
                name: elements.playerName.value,
                ratings: getRatingsFromForm(),
                preferences: [
                    elements.firstPreference.value,
                    elements.secondPreference.value
                ]
            };
            
            if (state.editingPlayerId) {
                // Update existing player
                updatePlayer(state.editingPlayerId, playerData);
            } else {
                // Add new player
                addPlayer(playerData);
            }
            
            // Refresh state and UI
            state.players = loadPlayers();
            renderPlayerTable(state.players);
            updateActionButtonStates();
            hideAddEditModal();
        });
    }
    
    // Slider change events
    const sliders = Object.keys(sliderValueMap).map(id => document.getElementById(id));
    sliders.forEach(slider => {
        if (slider) {
            slider.addEventListener('input', () => {
                updateSliderValue(slider.id, sliderValueMap[slider.id]);
                updatePositionScores();
            });
        }
    });
    
    // Preference change events
    if (elements.firstPreference) {
        elements.firstPreference.addEventListener('change', updatePositionScores);
    }
    
    if (elements.secondPreference) {
        elements.secondPreference.addEventListener('change', updatePositionScores);
    }
    
    // Close modal on outside click
    if (elements.playerModal) {
        elements.playerModal.addEventListener('click', (e) => {
            if (e.target === elements.playerModal) {
                hideAddEditModal();
            }
        });
    }
    
    if (elements.confirmDeleteModal) {
        elements.confirmDeleteModal.addEventListener('click', (e) => {
            if (e.target === elements.confirmDeleteModal) {
                hideDeleteConfirmationModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to close modals
        if (e.key === 'Escape') {
            if (elements.playerModal.style.display === 'flex') {
                hideAddEditModal();
            } else if (elements.confirmDeleteModal.style.display === 'flex') {
                hideDeleteConfirmationModal();
            }
        }
    });
}

/**
 * Initialize the UI
 */
function initUI() {
    // Initialize event listeners
    initializeEventListeners();
    
    // Load and render players
    state.players = loadPlayers();
    renderPlayerTable(state.players);
    
    // Update button states
    updateActionButtonStates();
    
    // Hide error message initially
    hideErrorMessage();
    
    // Initialize slider values
    updateAllSliderValues();
    updatePositionScores();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        elements,
        state,
        formatScore,
        updateSliderValue,
        updateAllSliderValues,
        getRatingsFromForm,
        updatePositionScores,
        setFormValues,
        clearFormValues,
        showAddEditModal,
        hideAddEditModal,
        showDeleteConfirmationModal,
        hideDeleteConfirmationModal,
        showErrorMessage,
        hideErrorMessage,
        switchView,
        renderPlayerRow,
        renderPlayerTable,
        renderTeamInfo,
        renderTeamCard,
        renderTeams,
        renderTeamGenerationView,
        togglePlayerPresent,
        updatePlayerTableSelection,
        updateActionButtonStates,
        getSelectedPlayerIds,
        getPresentPlayers,
        clearPresentPlayers,
        initializeEventListeners,
        initUI
    };
}
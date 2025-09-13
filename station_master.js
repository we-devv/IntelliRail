// =================================================================================
// GLOBAL STATE & CONFIGURATION
// =================================================================================
let trainMovementInterval;
let aiScanInterval;

// Map Interaction State
let scale = 1;
let translate = { x: 0, y: 0 };
let isPanning = false;
let panStart = { x: 0, y: 0 };
let trainDetailsTimeout;


let liveRecommendations = [];
let recommendationIdCounter = 0;

// =================================================================================
// DATASETS
// =================================================================================
const initialTrainData = [
    { id: '12951', name: 'Rajdhani', type: 'express', source: 'NDL', destination: 'MRT', route: ['t1a-NDL-GZB', 't2a-GZB-MRT'] },
    { id: '12003', name: 'Shatabdi', type: 'express', source: 'MRT', destination: 'NDL', route: ['t2b-MRT-GZB', 't1b-GZB-NDL'] },
    { id: '22440', name: 'Vande Bharat', type: 'express', source: 'UMB', destination: 'NDL', route: ['t6-NDL-UMB-rev'] },
    { id: '12424', name: 'Dbrg Rajdhani', type: 'express', source: 'JP', destination: 'NDL', route: ['t4b-JP-NDL'] },
    { id: '12015', name: 'Ajmer Shatabdi', type: 'express', source: 'NDL', destination: 'JP', route: ['t4a-NDL-JP'] },
    { id: '04408', name: 'MEMU', type: 'passenger', source: 'NDL', destination: 'SBD', route: ['t3-NDL-SBD'] },
    { id: '14205', name: 'Express', type: 'passenger', source: 'NDL', destination: 'AGRA', route: ['t5-NDL-AGRA'] },
    { id: '15014', name: 'Ranikhet Exp', type: 'passenger', source: 'UMB', destination: 'NDL', route: ['t6-NDL-UMB-rev'] },
    { id: '54321', name: 'Goods', type: 'freight', source: 'GZB', destination: 'MRD', route: ['t7-GZB-MRD'] },
    { id: '54322', name: 'Goods', type: 'freight', source: 'NDL', destination: 'MRT', route: ['t1a-NDL-GZB', 't2a-GZB-MRT'] },
];

const trainQueueUpdates = [
    { id: '12951', name: 'Rajdhani', details: 'Approaching GZB', status: 'delayed', color: '#f59e0b', eta: '3 min' },
    { id: '12003', name: 'Shatabdi', details: 'Departed NDL Platform 2', status: 'on-time', color: '#22c55e', eta: 'On Time' },
    { id: '04408', name: 'MEMU', details: 'Approaching SBD', status: 'on-time', color: '#22c55e', eta: '2 min' },
    { id: '54321', name: 'Goods', details: 'Waiting for signal at GZB yard', status: 'delayed', color: '#f59e0b', eta: '10 min' },
    { id: '22440', name: 'Vande Bharat', details: 'Approaching NDL', status: 'on-time', color: '#22c55e', eta: '5 min' },
];

const stationData = {
    'NDL': {
        name: 'New Delhi Main',
        stations: [
            { id: 'NDL', name: 'New Delhi', coords: { x: 500, y: 500 } }, { id: 'GZB', name: 'Ghaziabad', coords: { x: 750, y: 300 } },
            { id: 'SBD', name: 'Sahibabad', coords: { x: 600, y: 700 } }, { id: 'MRT', name: 'Meerut', coords: { x: 900, y: 150 } },
            { id: 'UMB', name: 'Ambala', coords: { x: 200, y: 200 } }, { id: 'JP', name: 'Jaipur', coords: { x: 200, y: 800 } },
            { id: 'AGRA', name: 'Agra', coords: { x: 800, y: 850 } }, { id: 'MRD', name: 'Moradabad', coords: { x: 950, y: 500 } }
        ],
        tracks: [
            { id: 't1a-NDL-GZB', name: 'NDLS-GZB Up', d: 'M500,500 C600,450 700,350 750,300' },
            { id: 't1b-GZB-NDL', name: 'GZB-NDLS Down', d: 'M758,300 C708,358 608,458 508,500' },
            { id: 't2a-GZB-MRT', name: 'GZB-MRT Up', d: 'M750,300 L900,150' },
            { id: 't2b-MRT-GZB', name: 'MRT-GZB Down', d: 'M908,150 L758,300' },
            { id: 't3-NDL-SBD', name: 'NDLS-SBD', d: 'M500,500 C450,600 500,700 600,700' },
            { id: 't3-NDL-SBD-rev', name: 'SBD-NDLS', d: 'M600,700 C500,700 450,600 500,500' },
            { id: 't4a-NDL-JP', name: 'NDLS-Jaipur Up', d: 'M500,500 C400,600 300,700 200,800' },
            { id: 't4b-JP-NDL', name: 'Jaipur-NDLS Down', d: 'M200,808 C300,708 400,608 500,508' },
            { id: 't5-NDL-AGRA', name: 'NDLS-Agra', d: 'M500,500 C600,650 700,750 800,850' },
            { id: 't6-NDL-UMB', name: 'NDLS-Ambala', d: 'M500,500 C400,400 300,300 200,200' },
            { id: 't6-NDL-UMB-rev', name: 'Ambala-NDLS', d: 'M200,200 C300,300 400,400 500,500' },
            { id: 't7-GZB-MRD', name: 'GZB-Moradabad', d: 'M750,300 L950,500' }
        ],
        trains: []
    },
    'ANVT': {
        name: 'Anand Vihar',
        stations: [
            { id: 'ANVT', name: 'Anand Vihar', coords: { x: 500, y: 500 } },
            { id: 'GZB', name: 'Ghaziabad', coords: { x: 800, y: 600 } },
            { id: 'SBD', name: 'Sahibabad', coords: { x: 400, y: 750 } },
            { id: 'DLI', name: 'Delhi Jn.', coords: { x: 200, y: 300 } }
        ],
        tracks: [
            { id: 't-anvt-gzb', name: 'ANVT-GZB', d: 'M500,500 L800,600' },
            { id: 't-anvt-sbd', name: 'ANVT-SBD', d: 'M500,500 L400,750' },
            { id: 't-anvt-dli', name: 'ANVT-DLI', d: 'M500,500 C400,400 300,350 200,300' },
            { id: 't-sbd-gzb', name: 'SBD-GZB', d: 'M400,750 C600,700 700,650 800,600' }
        ],
    }
};

let currentStations, currentTracks, currentTrains, stationName;

// =================================================================================
// INITIALIZATION & EVENT LISTENERS
// =================================================================================

function initializeData() {
    let stationCode = new URLSearchParams(window.location.search).get('station') || 'NDL';
    let station = stationData[stationCode] || stationData['NDL'];

    currentStations = station.stations;
    currentTracks = station.tracks;
    stationName = station.name;

    currentTrains = JSON.parse(JSON.stringify(initialTrainData)).map(train => ({
        ...train,
        status: 'running',
        position: 0,
        currentTrackIndex: 0
    }));
}

document.addEventListener('DOMContentLoaded', function () {
    initializeData();

    document.getElementById('header-status-section').innerHTML = `
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span>AI System Active</span>
        </div>
        <div style="font-size: 14px;">
            <div>Real-time: <span id="current-time"></span></div>
            <div style="font-size: 12px; opacity: 0.7;">Section: ${stationName}</div>
        </div>
        <button class="logout-btn" onclick="handleLogout()">Logout</button>
    `;

    document.querySelectorAll('.tab-item').forEach(item => {
        item.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            if (targetTab === 'dashboard') initDashboardCharts();
            else if (targetTab === 'analytics') initAnalyticsCharts();
            else if (targetTab === 'simulation') initSimulationCharts();
        });
    });

    document.getElementById('network').classList.add('active');
    renderNetwork();
    setupMapControls();

    startFullSimulation();
    updateTime();
    setInterval(updateTime, 1000);

    updateTrainQueue();
    setInterval(updateTrainQueue, 7000);
});

// =================================================================================
// CORE SIMULATION LOGIC
// =================================================================================

function startFullSimulation() {
    if (trainMovementInterval) clearInterval(trainMovementInterval);
    if (aiScanInterval) clearInterval(aiScanInterval);

    trainMovementInterval = setInterval(updateTrainPositions, 50);
    aiScanInterval = setInterval(generateAIRecommendations, 5000);
}

function updateTrainPositions() {
    const simulationSpeedEl = document.querySelector('.network-controls select.input-field');
    let speedMultiplier = simulationSpeedEl ? (parseInt(simulationSpeedEl.value) || 1) : 1;

    for (let i = currentTrains.length - 1; i >= 0; i--) {
        const train = currentTrains[i];

        if (train.status === 'rerouted') {
            if (Date.now() > train.rerouteUntil) {
                train.status = 'running';
                if (train.currentTrackIndex < train.route.length - 1) {
                    train.currentTrackIndex++;
                    train.position = 0.1;
                }
                const fo = document.getElementById(`train-fo-${train.id}`);
                if (fo) fo.style.display = 'block';
            }
            continue;
        }

        if (train.status === 'held') {
            if (Date.now() > train.holdUntil) {
                train.status = 'running';
                document.getElementById(`train-${train.id}`)?.classList.remove('held');
            } else continue;
        }

        const fo = document.getElementById(`train-fo-${train.id}`);
        const trackPath = document.getElementById(train.route[train.currentTrackIndex]);
        if (!fo || !trackPath) continue;

        const pathLength = trackPath.getTotalLength();
        if (pathLength === 0) continue;

        const baseSpeed = 0.001;
        const trainSpeedFactor = train.type === 'express' ? 1.8 : (train.type === 'passenger' ? 1.2 : 0.8);
        const increment = baseSpeed * trainSpeedFactor * speedMultiplier;
        let newPosition = train.position + increment;

        if (newPosition >= 1.0) {
            if (train.currentTrackIndex >= train.route.length - 1) {
                const originalTrain = initialTrainData.find(t => t.id === train.id);
                Object.assign(train, JSON.parse(JSON.stringify(originalTrain)), { status: 'running', position: 0, currentTrackIndex: 0 });
                continue;
            }

            const nextTrackId = train.route[train.currentTrackIndex + 1];
            const nextTrack = currentTracks.find(t => t.id === nextTrackId);
            if (nextTrack && nextTrack.occupiedBy && nextTrack.occupiedBy !== train.id) {
                train.status = 'waiting';
                continue;
            }

            train.currentTrackIndex++;
            train.position = 0;
            train.status = 'running';
        } else {
            train.position = newPosition;
        }

        const currentPoint = trackPath.getPointAtLength(train.position * pathLength);
        const nextPoint = trackPath.getPointAtLength(Math.min(train.position + 0.01, 1.0) * pathLength);
        const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * (180 / Math.PI);

        fo.setAttribute('x', currentPoint.x - 20);
        fo.setAttribute('y', currentPoint.y - 10);
        fo.firstElementChild.style.transform = `rotate(${angle}deg)`;
    }
    updateTrackStatus();
}

// =================================================================================
// AI RECOMMENDATION LOGIC (COMPLETE REPLACEMENT)
// =================================================================================

async function generateAIRecommendations() {
    if (liveRecommendations.length >= 4) return;

    // Send a richer state, including train type
    const train_states = currentTrains.map(train => ({
        id: train.id,
        type: train.type,
        position: train.position,
        track_index: train.route.length > 0 ? train.currentTrackIndex / train.route.length : 0
    }));

    try {
        const response = await fetch('  https://4282c2bd58de.ngrok-free.app /get_recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ train_states: train_states })
        });
        
        if (!response.ok) { console.error("Error from AI server:", response.statusText); return; }

        const data = await response.json();
        const recommendations = data.recommendations;

        // Clear old recommendations
        liveRecommendations = []; 

        recommendations.forEach(rec => {
            // Only show interesting recommendations (not NORMAL or FAST)
            if (rec.action < 2) {
                let text = rec.action === 0
                    ? `Hold Train ${rec.train_id} to clear path.`
                    : `Advise Train ${rec.train_id} to maintain SLOW speed (${rec.speed_range}).`;

                liveRecommendations.push({
                    id: recommendationIdCounter++,
                    type: '🤖 AI Speed Advisory',
                    text: text,
                    action: rec.action === 0 ? 'hold' : 'speed_change',
                    trainId: rec.train_id,
                    speedRange: rec.speed_range, // Store the speed range
                    holdDuration: 15000
                });
            }
        });
        
        renderAIRecommendations();

    } catch (error) {
        console.error("Could not connect to the AI server.", error);
    }
}

function applySuggestion(recId) {
    const rec = liveRecommendations.find(r => r.id === recId);
    if (!rec) return;

    // Send the speed range in the update message
    const update = { 
        message: rec.text, 
        speed_range: rec.speedRange, // Send the new data
        timestamp: new Date().toISOString() 
    };
    localStorage.setItem(`locoPilotUpdate-${rec.trainId}`, JSON.stringify(update));
    showMessageBox('Instruction Sent', `Sent message to Loco Pilot of Train ${rec.trainId}.`);

    const train = currentTrains.find(t => t.id === rec.trainId);
    if (train && rec.action === 'hold') {
        train.status = 'held';
        train.holdUntil = Date.now() + rec.holdDuration;
        document.getElementById(`train-${train.id}`)?.classList.add('held');
    }

    liveRecommendations = liveRecommendations.filter(r => r.id !== recId);
    renderAIRecommendations();
}
function applySuggestion(recId) {
    const rec = liveRecommendations.find(r => r.id === recId);
    if (!rec) {
        console.error("Recommendation not found!");
        return;
    }

    const update = { message: rec.text, timestamp: new Date().toISOString() };
    localStorage.setItem(`locoPilotUpdate-${rec.trainId}`, JSON.stringify(update));
    showMessageBox('Instruction Sent', `Sent message to Loco Pilot of Train ${rec.trainId}:\n\n"${rec.text}"`);

    const train = currentTrains.find(t => t.id === rec.trainId);
    if (train) {
        if (rec.action === 'hold') {
            train.status = 'held';
            train.holdUntil = Date.now() + rec.holdDuration;
            document.getElementById(`train-${train.id}`)?.classList.add('held');
        }
    }

    liveRecommendations = liveRecommendations.filter(r => r.id !== recId);
    renderAIRecommendations();
}

// =================================================================================
// UI RENDERING & UTILITY FUNCTIONS
// =================================================================================

function renderAIRecommendations() {
    const container = document.getElementById('ai-suggestions-list');
    if (!container) return;
    container.innerHTML = '';

    liveRecommendations.forEach(rec => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'ai-suggestion';
        suggestionDiv.innerHTML = `<div class="suggestion-header">${rec.type}</div><div>${rec.text}</div><button class="suggestion-action">Apply</button>`;
        suggestionDiv.querySelector('button').onclick = () => applySuggestion(rec.id);
        container.appendChild(suggestionDiv);
    });
}

function renderNetwork() {
    const tracksGroup = document.getElementById('tracks-group');
    const dynamicGroup = document.getElementById('stations-and-trains-group');
    tracksGroup.innerHTML = '';
    dynamicGroup.innerHTML = '';

    currentTracks.forEach(track => {
        const basePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        basePath.setAttribute('d', track.d);
        basePath.id = track.id;
        basePath.classList.add('invisible-path');
        tracksGroup.appendChild(basePath);
    });

    currentTracks.forEach(track => {
        const trackGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const basePath = document.getElementById(track.id);
        const pathLength = basePath.getTotalLength();
        if (pathLength > 0) {
            const sleeperSpacing = 15;
            for (let i = 0; i < pathLength; i += sleeperSpacing) {
                const point = basePath.getPointAtLength(i);
                const nextPoint = basePath.getPointAtLength(Math.min(i + 1, pathLength));
                const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
                const pAngle = angle + Math.PI / 2;
                const sWidth = 10;
                const x1 = point.x + (sWidth / 2) * Math.cos(pAngle);
                const y1 = point.y + (sWidth / 2) * Math.sin(pAngle);
                const x2 = point.x - (sWidth / 2) * Math.cos(pAngle);
                const y2 = point.y - (sWidth / 2) * Math.sin(pAngle);
                const sleeper = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                sleeper.setAttribute('x1', x1); sleeper.setAttribute('y1', y1);
                sleeper.setAttribute('x2', x2); sleeper.setAttribute('y2', y2);
                sleeper.setAttribute('class', 'track-sleeper');
                trackGroup.appendChild(sleeper);
            }
        }
        const railPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        railPath.setAttribute('d', track.d);
        railPath.setAttribute('class', `track-rail rail-${track.id}`);
        railPath.style.stroke = 'url(#freeGradient)';
        trackGroup.appendChild(railPath);
        tracksGroup.appendChild(trackGroup);
    });

    currentStations.forEach(station => {
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('x', station.coords.x - 40);
        fo.setAttribute('y', station.coords.y - 20);
        fo.setAttribute('width', 80);
        fo.setAttribute('height', 40);
        const stationDiv = document.createElement('div');
        stationDiv.className = 'station';
        stationDiv.innerHTML = `<div class="station-code">${station.id}</div><div class="station-name">${station.name}</div>`;
        fo.appendChild(stationDiv);
        dynamicGroup.appendChild(fo);
    });

    currentTrains.forEach(train => spawnTrainElement(train));
}

function spawnTrainElement(train) {
    const dynamicGroup = document.getElementById('stations-and-trains-group');
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.id = `train-fo-${train.id}`;
    fo.setAttribute('width', 40);
    fo.setAttribute('height', 20);
    const div = document.createElement('div');
    div.id = `train-${train.id}`;
    div.className = `train train-${train.type}`;
    div.textContent = train.id;
    div.onmouseover = (event) => showTrainDetails(event, train);
    div.onmouseout = () => hideTrainDetails();
    fo.appendChild(div);
    dynamicGroup.appendChild(fo);
}

function updateTrackStatus() {
    currentTracks.forEach(track => { track.occupiedBy = null; });
    currentTrains.forEach(train => {
        if (train.status !== 'rerouted') {
            const track = currentTracks.find(t => t.id === train.route[train.currentTrackIndex]);
            if (track) track.occupiedBy = train.id;
        }
    });

    currentTracks.forEach(track => {
        const railEl = document.querySelector(`.rail-${track.id}`);
        if (railEl) {
            if (track.occupiedBy) railEl.style.stroke = 'url(#occupiedGradient)';
            else railEl.style.stroke = 'url(#freeGradient)';
        }
    });
    renderTrackStatusTab();
}

function renderTrackStatusTab() {
    const container = document.getElementById('track-status-container');
    if (!container) return;
    let html = `<div class="section-title">🚦 Track Status Overview</div>`;
    currentTracks.forEach(track => {
        let status = 'Free';
        let statusClass = 'free-text';
        let statusDotClass = 'free';
        if (track.occupiedBy) {
            status = `Occupied by ${track.occupiedBy}`;
            statusClass = 'occupied-text';
            statusDotClass = 'occupied';
        } else if (track.reservedBy) {
            status = `Reserved for ${track.reservedBy}`;
            statusClass = 'reserved-text';
            statusDotClass = 'reserved';
        }

        html += `
            <div class="track-status-card">
                <div class="status-dot-lg ${statusDotClass}"></div>
                <div class="track-details">
                    <div style="font-weight: bold;">${track.name}</div>
                    <div class="track-info-label">Track ID: ${track.id}</div>
                    <div class="track-status-text ${statusClass}">${status}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateTrainQueue() {
    const queueContainer = document.getElementById('train-queue');
    if (!queueContainer) return;
    queueContainer.innerHTML = '';
    const shuffled = [...trainQueueUpdates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
    selected.forEach(train => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'queue-item';
        itemDiv.innerHTML = `<div class="title" style="color: ${train.color};">${train.id} - ${train.name}</div><div class="details">${train.details}</div><div class="status ${train.status}">${train.eta}</div>`;
        queueContainer.appendChild(itemDiv);
    });
}

function setupMapControls() {
    const networkMain = document.getElementById('network-main');
    networkMain.addEventListener('wheel', handleZoom);
    networkMain.addEventListener('mousedown', startPan);
    networkMain.addEventListener('mousemove', doPan);
    networkMain.addEventListener('mouseup', endPan);
    networkMain.addEventListener('mouseleave', endPan);
}

function handleZoom(event) {
    event.preventDefault();
    const scaleAmount = -event.deltaY * 0.001;
    scale = Math.min(Math.max(0.5, scale + scaleAmount), 3);
    updateSvgTransform();
}

function startPan(event) {
    event.preventDefault();
    isPanning = true;
    panStart.x = event.clientX - translate.x;
    panStart.y = event.clientY - translate.y;
}

function doPan(event) {
    if (isPanning) {
        event.preventDefault();
        translate.x = event.clientX - panStart.x;
        translate.y = event.clientY - panStart.y;
        updateSvgTransform();
    }
}

function endPan() {
    isPanning = false;
}

function updateSvgTransform() {
    const transformGroup = document.getElementById('map-transform-group');
    if (transformGroup) {
        transformGroup.setAttribute('transform', `translate(${translate.x}, ${translate.y}) scale(${scale})`);
    }
}

function handleLogout() {
    window.location.href = 'index.html';
}

function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = new Date().toTimeString().split(' ')[0];
    }
}

function showTrainDetails(event, train) {
    clearTimeout(trainDetailsTimeout);
    const detailCard = document.getElementById('train-details-card');
    const networkMain = document.getElementById('network-main');
    const mainRect = networkMain.getBoundingClientRect();
    const trainDiv = event.currentTarget.parentElement;
    const trainRect = trainDiv.getBoundingClientRect();

    detailCard.style.top = `${trainRect.bottom - mainRect.top + 10}px`;
    detailCard.style.left = `${trainRect.left - mainRect.left}px`;

    const currentTrackName = currentTracks.find(t => t.id === train.route[train.currentTrackIndex])?.name || 'Unknown';
    detailCard.innerHTML = `<div class="title">${train.id} - ${train.name}</div><div class="info-line"><span>Type:</span> <span style="color: #60a5fa;">${train.type.charAt(0).toUpperCase() + train.type.slice(1)}</span></div><div class="info-line"><span>Route:</span> <span>${train.source} → ${train.destination}</span></div><div class="info-line"><span>Status:</span> <span>${train.status}</span></div>`;
    detailCard.style.display = 'flex';
}

function hideTrainDetails() {
    trainDetailsTimeout = setTimeout(() => {
        document.getElementById('train-details-card').style.display = 'none';
    }, 100);
}

function showMessageBox(title, message) {
    document.getElementById('messageBoxTitle').textContent = title;
    document.getElementById('messageBoxContent').textContent = message;
    document.getElementById('messageBox').style.display = 'flex';
}

function hideMessageBox() {
    document.getElementById('messageBox').style.display = 'none';
}

function startSimulation() { showMessageBox('Simulation', 'Simulation is already running.'); }
function pauseSimulation() { clearInterval(trainMovementInterval); clearInterval(aiScanInterval); showMessageBox('Simulation', 'Simulation paused.'); }
function resetSimulation() { initializeData(); renderNetwork(); startFullSimulation(); showMessageBox('Simulation', 'Simulation has been reset.'); }
function runComparison() { showMessageBox('Comparison Started', 'Running a comparison between AI and static scheduling.'); }
function exportResults() { showMessageBox('Exporting Data', 'Exporting simulation results as a CSV file.'); }

const chartConfigs = {
    throughputChart: { type: 'line', data: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], datasets: [{ label: 'Trains/Hour', data: [18, 28, 24, 26, 32, 20], borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#334155' } }, x: { grid: { color: '#334155' } } } } },
    delayChart: { type: 'bar', data: { labels: ['Express', 'Passenger', 'Freight'], datasets: [{ label: 'Average Delay (min)', data: [1.2, 2.8, 4.2], backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b'], borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#334155' } }, x: { grid: { display: false } } } } },
    performanceChart: { type: 'doughnut', data: { labels: ['On Time', 'Minor Delay', 'Major Delay'], datasets: [{ data: [78, 18, 4], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 12 } } } } } },
    detailedMetricsChart: { type: 'radar', data: { labels: ['Throughput', 'Delays', 'Safety', 'Efficiency', 'Cost', 'Satisfaction'], datasets: [{ label: 'Traditional System', data: [60, 40, 85, 55, 60, 50], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', pointBackgroundColor: '#ef4444' }, { label: 'AI-Optimized', data: [88, 85, 95, 90, 80, 85], borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', pointBackgroundColor: '#22c55e' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { r: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, pointLabels: { color: '#cbd5e1' } } } } },
    simulationChart: { type: 'line', data: { labels: [], datasets: [{ label: 'Trains Processed', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#cbd5e1' } }, x: { grid: { color: '#334155' }, ticks: { color: '#cbd5e1' } } } } }
};

function createOrUpdateChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (canvas.chart) canvas.chart.destroy();
    canvas.chart = new Chart(canvas, config);
}

function initDashboardCharts() {
    createOrUpdateChart('throughputChart', chartConfigs.throughputChart);
    createOrUpdateChart('delayChart', chartConfigs.delayChart);
    createOrUpdateChart('performanceChart', chartConfigs.performanceChart);
}
function initAnalyticsCharts() {
    createOrUpdateChart('detailedMetricsChart', chartConfigs.detailedMetricsChart);
}
function initSimulationCharts() {
    createOrUpdateChart('simulationChart', chartConfigs.simulationChart);
}
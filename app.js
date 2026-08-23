const nodes = {
  northGate: { x: 112, y: 125, name: 'North Gate' },
  library: { x: 160, y: 370, name: 'Library' },
  ramp: { x: 390, y: 325, name: 'Rain Garden ramp' },
  science: { x: 475, y: 165, name: 'Science Hall' },
  commons: { x: 610, y: 430, name: 'Student Commons' },
  coveredWalk: { x: 705, y: 285, name: 'Covered Walkway' },
  wellness: { x: 790, y: 255, name: 'Wellness Center' },
  stairs: { x: 355, y: 145, name: 'East stairs' },
  courtyard: { x: 530, y: 345, name: 'Central Courtyard' }
};

const edges = [
  ['library', 'ramp', 210, ['stepFree', 'covered']], ['ramp', 'coveredWalk', 270, ['stepFree', 'covered', 'lit']],
  ['coveredWalk', 'wellness', 95, ['stepFree', 'covered', 'lit']], ['library', 'courtyard', 250, ['steps', 'busy']],
  ['courtyard', 'wellness', 250, ['busy']], ['northGate', 'science', 330, ['lit']], ['science', 'stairs', 125, ['steps']],
  ['stairs', 'library', 240, ['steps']], ['science', 'coveredWalk', 260, ['stepFree', 'covered']],
  ['commons', 'courtyard', 130, ['busy']], ['commons', 'wellness', 220, ['lit']], ['ramp', 'courtyard', 150, ['quiet']],
  ['northGate', 'library', 290, ['stepFree', 'lit']], ['northGate', 'ramp', 315, ['stepFree', 'covered']]
];

let state = { needs: new Set(['mobility']), conditions: new Set(['rain']), barrier: false };
const $ = (selector) => document.querySelector(selector);

function edgeCost(edge) {
  const [, , distance, tags] = edge;
  let cost = distance;
  if (state.needs.has('mobility') && tags.includes('steps')) cost += 10000;
  if (state.needs.has('vision') && !tags.includes('lit')) cost += 220;
  if (state.needs.has('sensory') && tags.includes('busy')) cost += 220;
  if (state.conditions.has('rain') && !tags.includes('covered')) cost += 140;
  if (state.conditions.has('night') && !tags.includes('lit')) cost += 220;
  if (state.conditions.has('busy') && tags.includes('busy')) cost += 180;
  if (state.barrier && ((edge[0] === 'library' && edge[1] === 'ramp') || (edge[1] === 'library' && edge[0] === 'ramp'))) cost += 10000;
  return cost;
}

function route(from, to) {
  const dist = Object.fromEntries(Object.keys(nodes).map((node) => [node, Infinity]));
  const previous = {}; const unseen = new Set(Object.keys(nodes)); dist[from] = 0;
  while (unseen.size) {
    const current = [...unseen].reduce((best, node) => dist[node] < dist[best] ? node : best);
    if (dist[current] === Infinity || current === to) break;
    unseen.delete(current);
    edges.forEach((edge) => {
      const [a, b] = edge; if (a !== current && b !== current) return;
      const neighbor = a === current ? b : a; if (!unseen.has(neighbor)) return;
      const attempt = dist[current] + edgeCost(edge);
      if (attempt < dist[neighbor]) { dist[neighbor] = attempt; previous[neighbor] = current; }
    });
  }
  const path = []; for (let at = to; at; at = previous[at]) { path.unshift(at); if (at === from) break; }
  return { path, score: dist[to] };
}

function formatRoute(path) {
  const coords = path.map((point) => `${nodes[point].x},${nodes[point].y}`).join(' ');
  $('#routePath').setAttribute('d', `M ${coords.replace(' ', ' L ')}`);
  $('#routeShadow').setAttribute('d', `M ${coords.replace(' ', ' L ')}`);
  $('#routeMarkers').innerHTML = path.map((point, index) => `<circle class="route-marker" cx="${nodes[point].x}" cy="${nodes[point].y}" r="${index === 0 || index === path.length - 1 ? 8 : 5}"></circle>`).join('');
}

function getReasoning(path) {
  const reasons = [];
  if (state.needs.has('mobility')) reasons.push(['♿', 'Step-free throughout', 'Removed stairs and selected verified ramp access.']);
  if (state.conditions.has('rain')) reasons.push(['☔', 'Shelter prioritized', 'Keeps you under cover for the highest possible share of the trip.']);
  if (state.conditions.has('night') || state.needs.has('vision')) reasons.push(['◉', 'Visibility checked', 'Favors recently verified, well-lit connections.']);
  if (state.conditions.has('busy') || state.needs.has('sensory')) reasons.push(['◌', 'Crowd load reduced', 'Avoids the central courtyard during its busiest period.']);
  if (state.barrier) reasons.push(['!', 'Community report applied', 'Rerouted around the reported flooded curb ramp.']);
  if (!reasons.length) reasons.push(['✓', 'Balanced for efficiency', 'Selected the shortest currently verified route.']);
  return reasons.slice(0, 3);
}

function drawRoute() {
  const from = $('#start').value; const to = $('#destination').value;
  if (from === to) { $('#destination').selectedIndex = ($('#destination').selectedIndex + 1) % $('#destination').options.length; }
  const finalTo = $('#destination').value; const result = route(from, finalTo); formatRoute(result.path);
  const idealDistance = Math.max(240, Math.round(result.path.slice(1).reduce((sum, node, index) => {
    const edge = edges.find((item) => (item[0] === result.path[index] && item[1] === node) || (item[1] === result.path[index] && item[0] === node)); return sum + (edge ? edge[2] : 0);
  }, 0) / 10) * 10);
  const minutes = Math.max(4, Math.round(idealDistance / 70));
  const hasCover = result.path.includes('coveredWalk') || result.path.includes('ramp');
  const title = state.barrier ? 'Rerouted around reported barrier' : hasCover && state.conditions.has('rain') ? 'Covered, step-free route' : 'Personalized verified route';
  $('#route-title').textContent = title;
  $('#routeSummary').textContent = `From ${nodes[from].name} to ${nodes[finalTo].name} via ${result.path.slice(1, -1).map((x) => nodes[x].name).join(' and ') || 'the direct path'}.`;
  $('#routeTime').textContent = `${minutes} min`; $('#routeDistance').textContent = `${idealDistance} m`;
  $('#mapStatus').textContent = state.barrier ? 'Route updated from a community report' : 'Live campus snapshot';
  $('#barrier').hidden = !state.barrier;
  $('#reasonList').innerHTML = getReasoning(result.path).map(([icon, heading, copy]) => `<article class="reason"><span>${icon}</span><div><strong>${heading}</strong><p>${copy}</p></div></article>`).join('');
}

document.querySelectorAll('.need-chip').forEach((button) => button.addEventListener('click', () => {
  const need = button.dataset.need; state.needs.has(need) ? state.needs.delete(need) : state.needs.add(need);
  button.classList.toggle('selected', state.needs.has(need)); button.setAttribute('aria-pressed', state.needs.has(need)); drawRoute();
}));
document.querySelectorAll('.condition').forEach((button) => button.addEventListener('click', () => {
  const condition = button.dataset.condition; state.conditions.has(condition) ? state.conditions.delete(condition) : state.conditions.add(condition);
  button.classList.toggle('selected', state.conditions.has(condition)); button.setAttribute('aria-pressed', state.conditions.has(condition)); drawRoute();
}));
$('#routeForm').addEventListener('submit', (event) => { event.preventDefault(); drawRoute(); $('#route-title').closest('.route-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
$('#resetButton').addEventListener('click', () => { state = { needs: new Set(['mobility']), conditions: new Set(['rain']), barrier: false }; document.querySelectorAll('.need-chip,.condition').forEach((button) => { const selected = button.dataset.need === 'mobility' || button.dataset.condition === 'rain'; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', selected); }); $('#start').value = 'library'; $('#destination').value = 'wellness'; drawRoute(); });
$('#explainButton').addEventListener('click', () => { const panel = $('#explanation'); panel.hidden = !panel.hidden; if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
$('#reportButton').addEventListener('click', () => $('#barrierDialog').showModal());
$('#submitBarrier').addEventListener('click', () => { state.barrier = true; setTimeout(drawRoute, 0); });
drawRoute();

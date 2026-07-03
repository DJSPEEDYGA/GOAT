const crewId = document.body.dataset.crew || 'money-penny';
const manifestUrl = 'data/goat-named-launchers.json';

function asList(items) {
    return items.map((item) => `<li>${item}</li>`).join('');
}

function asLinks(launcher) {
    const links = [
        ['Open Home Lane', launcher.home],
        ['Build With Me', 'goat-build-with-me.html'],
        ['GOAT Launcher', 'goat-launcher-home.html'],
        ['AGENT007 Status (Licence to Build or Destroy)', 'agent007-status.html'],
        ['Crew Hub', 'goat-crew-hub.html'],
        ['Media Lab', 'goat-media-lab.html'],
        ['Picture Animation', 'goat-picture-animation-lab.html'],
        ['Unreal Copilot', 'unreal-copilot.html'],
        ['Marketing Team', 'goat-marketing-team.html'],
        ['Eden Promo', 'eden-awakening-promo.html'],
        ['Tools', 'tools.html'],
        ['Storage', 'api-vault.html']
    ];

    if (launcher.id === 'agent007') {
        links.splice(3, 0, ['AGENT007 LLM + Tools (Licence to Build or Destroy)', 'agent007-llm-tools.html']);
        links.splice(4, 0, ['AGENT007 Local Models', 'agent007-local-model-downloads.html']);
        links.splice(5, 0, ['CUDA Core / NVIDIA Dev (AGENT007 core)', 'agent007-cuda-core.html']);
    }

    return links.map(([label, href]) => `<a class="btn" href="${href}">${label}</a>`).join('');
}

function renderLauncher(manifest) {
    const launcher = manifest.launchers.find((item) => item.id === crewId) || manifest.launchers[0];
    const accent = launcher.accent || '#d4a03c';

    document.title = `${launcher.displayName} Launcher`;
    document.documentElement.style.setProperty('--crew-accent', accent);
    const icon = document.getElementById('crewIcon');
    if (icon) {
        icon.textContent = launcher.iconText || launcher.displayName.slice(0, 2).toUpperCase();
        icon.style.setProperty('--crew-accent', accent);
    }
    document.getElementById('crewName').textContent = launcher.displayName;
    document.getElementById('codeName').textContent = launcher.codeName;
    document.getElementById('lane').textContent = launcher.lane;
    document.getElementById('lead').textContent = launcher.lead;
    document.getElementById('status').textContent = launcher.status;
    document.getElementById('houseRule').textContent = manifest.houseRule;
    document.getElementById('foundingNote').textContent = manifest.foundingNote;
    document.getElementById('sharedAccess').innerHTML = asList(manifest.sharedAccess);
    document.getElementById('approvalGates').innerHTML = asList(manifest.approvalGates);
    document.getElementById('launcherLinks').innerHTML = asLinks(launcher);
}

fetch(manifestUrl)
    .then((response) => response.json())
    .then(renderLauncher)
    .catch(() => {
        document.getElementById('lane').textContent = 'Launcher manifest could not be loaded. Check the GOAT data folder.';
    });

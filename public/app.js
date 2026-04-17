let chart;

function getStatusClass(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'safe') return 'safe';
  if (s === 'caution') return 'caution';
  return 'unsafe';
}

function getOverallStatus(data) {
  const statuses = data.map(item => item.safetyStatus);
  if (statuses.includes('Unsafe')) return 'Overall Status: Unsafe';
  if (statuses.includes('Caution')) return 'Overall Status: Caution';
  return 'Overall Status: Safe';
}

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    const cardsContainer = document.getElementById('cards');
    const overallStatus = document.getElementById('overall-status');
    const lastUpdated = document.getElementById('last-updated');
    lastUpdated.textContent = "Last Updated: " + data[0].windowEndTime;

    cardsContainer.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      overallStatus.textContent = 'No data available';
      return;
    }

    const overall = getOverallStatus(data);
    overallStatus.textContent = overall;

    overallStatus.className = "overall-status";

    if (overall.includes("Safe")) {
    overallStatus.classList.add("safe");
    } else if (overall.includes("Caution")) {
    overallStatus.classList.add("caution");
    } else {
    overallStatus.classList.add("unsafe");
    }

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      const statusText = item.safetyStatus || 'Unknown';
      const statusClass = getStatusClass(item.safetyStatus);

      card.innerHTML = `
        <h2>${item.location}</h2>
        <div class="badge ${statusClass}">${statusText}</div>
        <p><strong>Window End:</strong> ${item.windowEndTime}</p>
        <p><strong>Avg Ice Thickness:</strong> ${item.avgIceThickness?.toFixed(1)} cm</p>
        <p><strong>Min Ice Thickness:</strong> ${item.minIceThickness?.toFixed(1)} cm</p>
        <p><strong>Max Ice Thickness:</strong> ${item.maxIceThickness?.toFixed(1)} cm</p>
        <p><strong>Avg Surface Temp:</strong> ${item.avgSurfaceTemperature?.toFixed(1)} °C</p>
        <p><strong>Max Snow:</strong> ${item.maxSnowAccumulation?.toFixed(1)} cm</p>
        <p><strong>Readings:</strong> ${item.readingCount}</p>
      `;

      cardsContainer.appendChild(card);
    });
    // 画图（只用最新数据）
    // const labels = data.map(item => item.location);
    // const values = data.map(item => item.avgIceThickness);

    // const ctx = document.getElementById('iceChart').getContext('2d');

    // if (chart) {
    // chart.destroy();
    // }

    // chart = new Chart(ctx, {
    // type: 'bar',
    // data: {
    //     labels: labels,
    //     datasets: [{
    //     label: 'Avg Ice Thickness (cm)',
    //     data: values
    //     }]
    // },
    // options: {
    //     responsive: true
    // }
    // });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    document.getElementById('overall-status').textContent = 'Failed to load data';
  }
}

fetchData();
setInterval(fetchData, 30000);

document.addEventListener("DOMContentLoaded", () => {
  function showLoader() {
    // Show loader when data is loading
    document.getElementById('loader').style.display = 'block';
  }

  function hideLoader() {
    // Hide loader when data is loaded
    document.getElementById('loader').style.display = 'none';
  }

  const fetchAndRender = async () => {
    try {
      showLoader();
      const response = await fetch("/api/tickers");

      if (!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`);
      }

      hideLoader();
      const tickers = await response.json();

      const bestPrice = document.getElementById("best-price-info");
      const avgBuy = tickers[0].buy;
      bestPrice.innerHTML = "₹" + avgBuy;

      const app = document.getElementById("app");
      app.innerHTML = "";

      const table = document.createElement("table");
      const header = `
        <tr>
          <th>#</th>
          <th>Platform</th>
          <th>Last Traded Price</th>
          <th>Buy / Sell Price</th>
          <th>Difference</th>
          <th>Savings</th>
        </tr>
      `;
      table.innerHTML = header;

      tickers.forEach((ticker) => {
        const row = `
          <tr>
            <td>${ticker.id}</td>
            <td>${ticker.name}</td>
            <td>${"₹" + Number(ticker.last).toFixed(2)}</td>
            <td>${"₹" + ticker.buy + "  /  ₹" + ticker.sell}</td>
            <td class="${(ticker.sell - ticker.buy) / 100 > 0 ? 'positive' : 'negative'}">
              ${(ticker.sell - ticker.buy) / 100 > 0 ? "" : "- "}${Number((ticker.sell - ticker.buy) / 100).toFixed(2) + " %"}
            </td>
            <td class="${(ticker.sell - ticker.buy) > 0 ? 'positive' : 'negative'}">
              ${(ticker.sell - ticker.buy) > 0 ? '▲' : '▼'}${"₹" + Number(ticker.sell - ticker.buy).toFixed(2)}
            </td>
          </tr>
        `;
        table.innerHTML += row;
      });

      app.appendChild(table);
    } catch (err) {
      console.error("Error fetching tickers:", err);
    }
  };

  let count = 60;
  const updateTimer = () => {
    const timerDisplay = document.getElementById("indicator");

    if (timerDisplay) {
      timerDisplay.textContent = count + " seconds remaining";
      count--;
      if (count === 0) {
        count = 60;
      }
    }
  };

  fetchAndRender();
  setInterval(fetchAndRender, 60000);
  setInterval(updateTimer,  1000);
});

const modeSwitch = document.getElementById('modeSwitch');
modeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light-mode');
});

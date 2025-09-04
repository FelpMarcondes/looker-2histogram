const dscc = require('ds-component');

function draw(data) {
  const container = document.getElementById("chart");
  container.innerHTML = ""; // limpar antes de redesenhar

  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const rows = data.tables.DEFAULT;

  // Espera-se: 1 dimensão + 2 métricas
  const dataset = rows.map(row => ({
    categoria: row.dimID[0],
    valor1: row.metricID[0],
    valor2: row.metricID[1]
  }));

  const x0 = d3.scaleBand()
    .domain(dataset.map(d => d.categoria))
    .range([margin.left, width - margin.right])
    .paddingInner(0.2);

  const x1 = d3.scaleBand()
    .domain(["valor1", "valor2"])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => Math.max(d.valor1, d.valor2))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(["valor1", "valor2"])
    .range(["#1f77b4", "#ff7f0e"]);

  // Eixo X
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0));

  // Eixo Y
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Grupos de barras
  const barGroups = svg.selectAll("g.layer")
    .data(dataset)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.categoria)},0)`);

  barGroups.selectAll("rect")
    .data(d => ["valor1", "valor2"].map(key => ({ key, value: d[key] })))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => y(0) - y(d.value))
    .attr("fill", d => color(d.key));

  // Labels acima das barras
  barGroups.selectAll("text")
    .data(d => ["valor1", "valor2"].map(key => ({ key, value: d[key] })))
    .enter()
    .append("text")
    .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .text(d => d.value);

  // Legenda
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120},${margin.top})`);

  ["valor1", "valor2"].forEach((key, i) => {
    const g = legend.append("g").attr("transform", `translate(0,${i * 20})`);
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(key));
    g.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .style("font-size", "12px")
      .text(key);
  });
}

// Subscrever os dados
dscc.subscribeToData(draw, { transform: dscc.tableTransform });
